from django.apps import apps
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Profile, Role
from .permissions import ACTIONS, IsAdminRole, is_admin, linked_of, perms_of, role_kind, role_name

User = get_user_model()


def link_name(kind, linked):
    """Name of the Student / Instructor record a portal login is linked to (models come from settings.LINK_MODELS)."""
    path = getattr(settings, "LINK_MODELS", {}).get(kind)
    if not path or not linked:
        return ""
    obj = apps.get_model(path).objects.filter(pk=linked).first()
    return getattr(obj, "name", "") if obj else ""


class MeView(APIView):
    def get(self, request):
        u = request.user; k = role_kind(u); lid = linked_of(u)
        return Response({"id": u.id, "username": u.username, "name": u.first_name or u.username, "role": role_name(u), "kind": k, "is_admin": is_admin(u),
                         "linked_id": lid, "linked_name": link_name(k, lid), "permissions": perms_of(u)})


class ChangePasswordView(APIView):
    """Any logged-in user (admin, trainer, student, staff) can change their own password."""

    def post(self, request):
        old, new = request.data.get("old_password", ""), request.data.get("new_password", "")
        if not request.user.check_password(old):
            raise ValidationError({"old_password": "Current password is wrong."})
        if len(new) < 6:
            raise ValidationError({"new_password": "Use at least 6 characters."})
        request.user.set_password(new); request.user.save()
        return Response({"ok": True})


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
        fields = ["id", "name", "description", "permissions", "is_system", "kind", "user_count"]
        read_only_fields = ["is_system", "kind"]

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
        if inst.is_system or inst.kind != "custom":
            raise ValidationError({"detail": "Built-in levels (Administrator, Trainer, Student) cannot be changed."})
        return super().update(inst, d)


class RoleVS(viewsets.ModelViewSet):
    queryset = Role.objects.all(); serializer_class = RoleS; permission_classes = [IsAdminRole]

    def destroy(self, request, *a, **k):
        obj = self.get_object()
        if obj.is_system or obj.kind != "custom":
            raise ValidationError({"detail": "Built-in levels (Administrator, Trainer, Student) cannot be deleted."})
        return super().destroy(request, *a, **k)


class UserS(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), required=False)
    linked_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["id", "username", "name", "email", "password", "role_id", "linked_id", "is_active"]

    def to_representation(self, o):
        p = getattr(o, "profile", None); k = role_kind(o)
        return {"id": o.id, "username": o.username, "name": o.first_name or o.username, "email": o.email, "role_id": p.role_id if p else None,
                "role_name": role_name(o), "role_kind": k, "linked_id": p.linked_id if p else None, "linked_name": link_name(k, p.linked_id if p else None),
                "is_active": o.is_active, "last_login": o.last_login}

    def _link(self, role, linked, inst=None):
        """Trainer / Student logins must point at a real Instructor / Student record, and each record gets one login."""
        path = getattr(settings, "LINK_MODELS", {}).get(role.kind)
        if not path:
            return None
        if not linked:
            raise ValidationError({"linked_id": f"Select the {role.kind} record this login belongs to."})
        if not apps.get_model(path).objects.filter(pk=linked).exists():
            raise ValidationError({"linked_id": "That record does not exist."})
        dup = Profile.objects.filter(role=role, linked_id=linked)
        if inst is not None:
            dup = dup.exclude(user=inst)
        if dup.exists():
            raise ValidationError({"detail": "This record already has a login."})
        return linked

    def _pw(self, pw):
        if pw and len(pw) < 6:
            raise ValidationError({"password": "Use at least 6 characters."})

    def create(self, d):
        pw = d.pop("password", ""); role = d.pop("role_id", None); linked = d.pop("linked_id", None)
        if not pw: raise ValidationError({"password": "Password is required for a new login."})
        if not role: raise ValidationError({"role_id": "Choose a user level."})
        self._pw(pw); linked = self._link(role, linked)
        user = User.objects.create_user(password=pw, **d)
        Profile.objects.create(user=user, role=role, linked_id=linked)
        return user

    def update(self, inst, d):
        me = self.context["request"].user
        pw = d.pop("password", ""); role = d.pop("role_id", None); linked = d.pop("linked_id", None)
        prof = Profile.objects.filter(user=inst).first()
        eff_role = role or (prof.role if prof else None)
        link_final = self._link(eff_role, linked if linked is not None else (prof.linked_id if prof else None), inst) if eff_role else None
        if inst.id == me.id and (d.get("is_active") is False or (role and not role.is_system)):
            raise ValidationError({"detail": "You cannot disable or demote your own account."})
        for k, v in d.items(): setattr(inst, k, v)
        if pw: self._pw(pw); inst.set_password(pw)
        inst.save()
        if eff_role is not None:
            Profile.objects.update_or_create(user=inst, defaults={"role": eff_role, "linked_id": link_final})
        return inst


class UserVS(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id"); serializer_class = UserS; permission_classes = [IsAdminRole]

    def destroy(self, request, *a, **k):
        if self.get_object().id == request.user.id:
            raise ValidationError({"detail": "You cannot delete your own account."})
        return super().destroy(request, *a, **k)
