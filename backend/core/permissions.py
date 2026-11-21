from django.conf import settings
from rest_framework.permissions import BasePermission, SAFE_METHODS

ACTIONS = ("view", "add", "edit", "delete")
METHOD_ACTION = {"GET": "view", "HEAD": "view", "OPTIONS": "view", "POST": "add", "PUT": "edit", "PATCH": "edit", "DELETE": "delete"}


def is_admin(user):
    if user.is_superuser:
        return True
    p = getattr(user, "profile", None)
    return bool(p and p.role and p.role.is_system)


def role_name(user):
    p = getattr(user, "profile", None)
    return "Administrator" if user.is_superuser else (p.role.name if p and p.role else "No level")


def role_kind(user):
    p = getattr(user, "profile", None)
    return p.role.kind if p and p.role else "custom"


def linked_of(user):
    p = getattr(user, "profile", None)
    return p.linked_id if p else None


def perms_of(user):
    """{screen: [actions]} for this login."""
    if is_admin(user):
        return {s: list(ACTIONS) for s in settings.SCREENS}
    p = getattr(user, "profile", None)
    raw = (p.role.permissions if p and p.role else {}) or {}
    return {s: [a for a in raw.get(s, []) if a in ACTIONS] for s in settings.SCREENS if raw.get(s)}


def _t(x):
    return () if x is None else (x,) if isinstance(x, str) else tuple(x)


class ScreenPermission(BasePermission):
    """Admin: everything. Others: the view's `screen` must grant the needed action (view/add/edit/delete).
    Reading is also allowed for `lookup` data (dropdown lists) and, with Dashboard/Reports access, for summaries."""

    def has_permission(self, request, view):
        u = request.user
        if not (u and u.is_authenticated and u.is_active):
            return False
        if is_admin(u):
            return True
        screen = getattr(view, "screen", None)
        if not screen:
            return True  # me / team / status
        act = getattr(view, "perm_actions", {}).get(getattr(view, "action", None)) or METHOD_ACTION.get(request.method, "edit")
        perms = perms_of(u)
        if act in perms.get(screen, []):
            return True
        if request.method in SAFE_METHODS:
            if getattr(view, "lookup", False):
                return True  # dropdown data (portal logins only ever receive their own, already-scoped rows)
            if role_kind(u) in ("trainer", "student"):
                return False  # portal logins get only what their level lists explicitly
            if any("view" in perms.get(s, []) for s in _t(getattr(view, "read_screens", ()))):
                return True
            if "view" in perms.get("dashboard", []) or "view" in perms.get("reports", []):
                return True
        return False


class IsAdminRole(BasePermission):
    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and u.is_active and is_admin(u))
