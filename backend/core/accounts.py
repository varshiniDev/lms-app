from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile, Role
from .permissions import ACTIONS, IsAdminRole, is_admin, perms_of, role_name

User = get_user_model()


class MeView(APIView):
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "name": u.first_name or u.username, "role": role_name(u), "is_admin": is_admin(u), "permissions": perms_of(u)})


class TeamView(APIView):
    """Active logins as {id, name} - used for 'Owner / Assigned to' dropdowns. Readable by every login."""

    def get(self, request):
        return Response([{"id": u.id, "name": u.first_name or u.username} for u in User.objects.filter(is_active=True).order_by("first_name", "username")])


class SystemStatus(APIView):
    def get(self, request):
        return Response({"system": settings.APP_NAME, "database": settings.DATABASES["default"]["ENGINE"].split(".")[-1]})


class RoleS(serializers.ModelSerializer):
    user_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = ["id", "name", "description", "permissions", "is_system", "user_count"]
        read_only_fields = ["is_system"]

    def get_user_count(self, o):
        return o.profiles.count()

    def validate_permissions(self, v):
        if not isinstance(v, dict):
            raise ValidationError("Invalid permissions")
        clean = {}
        for s, acts in v.items():
            if s not in settings.SCREENS:
                raise ValidationError(f"Unknown screen: {s}")
            acts = [a for a in acts if a in ACTIONS]
            if acts:
                clean[s] = acts if "view" in acts else ["view"] + acts  # add/edit/delete imply view
        return clean

    def update(self, inst, d):
        if inst.is_system:
            raise ValidationError({"detail": "The Administrator level is built in and cannot be changed."})
        return super().update(inst, d)


class RoleVS(viewsets.ModelViewSet):
    queryset = Role.objects.all(); serializer_class = RoleS; permission_classes = [IsAdminRole]

    def destroy(self, request, *a, **k):
        if self.get_object().is_system:
            raise ValidationError({"detail": "The Administrator level cannot be deleted."})
        return super().destroy(request, *a, **k)


class UserS(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False)

    class Meta:
        model = User
        fields = ["id", "username", "name", "email", "password", "role_id", "is_active"]

    def to_representation(self, o):
        p = getattr(o, "profile", None)
        return {"id": o.id, "username": o.username, "name": o.first_name or o.username, "email": o.email, "role_id": p.role_id if p else None,
                "role_name": role_name(o), "is_active": o.is_active, "last_login": o.last_login}

    def _pw(self, pw):
        if pw and len(pw) < 6:
            raise ValidationError({"password": "Use at least 6 characters."})

    def create(self, d):
        pw = d.pop("password", ""); role = d.pop("role_id", None)
        if not pw: raise ValidationError({"password": "Password is required for a new login."})
        if not role: raise ValidationError({"role_id": "Choose a user level."})
        self._pw(pw)
        user = User.objects.create_user(password=pw, **d)
        Profile.objects.create(user=user, role=role)
        return user

    def update(self, inst, d):
        me = self.context["request"].user
        pw = d.pop("password", ""); role = d.pop("role_id", None)
        if inst.id == me.id and (d.get("is_active") is False or (role and not role.is_system)):
            raise ValidationError({"detail": "You cannot disable or demote your own account."})
        for k, v in d.items(): setattr(inst, k, v)
        if pw: self._pw(pw); inst.set_password(pw)
        inst.save()
        if role is not None:
            Profile.objects.update_or_create(user=inst, defaults={"role": role})
        return inst


class UserVS(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id"); serializer_class = UserS; permission_classes = [IsAdminRole]

    def destroy(self, request, *a, **k):
        if self.get_object().id == request.user.id:
            raise ValidationError({"detail": "You cannot delete your own account."})
        return super().destroy(request, *a, **k)
