"""Helpers that keep each app's API tiny: build_serializer(model) + make_viewset(model, ...)."""
from django.db import IntegrityError, models as dm
from django.db.models import ProtectedError
from rest_framework import serializers, viewsets
from rest_framework.exceptions import ValidationError
from .serializers import BaseSerializer, fk

TIME = dict(format="%H:%M", input_formats=["%H:%M", "%H:%M:%S"], required=False, allow_null=True)


def build_serializer(model, read_only=(), extra=None, extra_fields=()):
    """All model fields; foreign keys become <name>_id (plain ids) so the UI stays simple."""
    attrs = dict(extra or {}); names = ["id"]
    for f in model._meta.get_fields():
        if f.auto_created or not f.concrete or f.name == "id":
            continue
        if f.many_to_one:
            n = f"{f.name}_id"
            attrs[n] = serializers.PrimaryKeyRelatedField(source=f.name, read_only=True) if f.name in read_only else fk(f.related_model, f.name, allow_null=f.null, required=not f.null)
            names.append(n)
        else:
            names.append(f.name)
            if isinstance(f, dm.TimeField):
                attrs[f.name] = serializers.TimeField(**TIME)
    names += list(extra_fields)
    attrs["Meta"] = type("Meta", (), {"model": model, "fields": names, "read_only_fields": [r for r in read_only if not any(f.name == r and f.many_to_one for f in model._meta.get_fields())], "validators": []})
    return type(model.__name__ + "S", (BaseSerializer,), attrs)


class Base(viewsets.ModelViewSet):
    def handle_exception(self, exc):
        if isinstance(exc, IntegrityError) and not isinstance(exc, ProtectedError):
            exc = ValidationError({"detail": "That record already exists or conflicts with an existing one."})
        return super().handle_exception(exc)


def make_viewset(model, ser, screen, lookup=False, read_screens=(), perm_actions=None, queryset=None):
    return type(f"{model.__name__}VS", (Base,), {"queryset": queryset if queryset is not None else model.objects.all(), "serializer_class": ser, "screen": screen,
                                                "lookup": lookup, "read_screens": read_screens, "perm_actions": perm_actions or {}})


def next_code(model, field, prefix, pad=4):
    n = (model.objects.order_by("-id").values_list("id", flat=True).first() or 0) + 1
    while model.objects.filter(**{field: f"{prefix}{str(n).zfill(pad)}"}).exists():
        n += 1
    return f"{prefix}{str(n).zfill(pad)}"
