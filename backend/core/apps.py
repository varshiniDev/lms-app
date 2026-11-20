import os
from django.apps import AppConfig
from django.db.models.signals import post_migrate


def bootstrap_admin(sender, **kwargs):
    """After migrate: make sure the built-in 'Administrator' level and the first admin login exist (credentials from .env)."""
    from django.conf import settings
    if sender.name != settings.APP_NAME:
        return
    from django.contrib.auth import get_user_model
    from core.models import Profile, Role
    User = get_user_model()
    role, _ = Role.objects.get_or_create(name="Administrator", defaults={"description": "Full access to every screen and user management", "is_system": True})
    if not role.is_system:
        role.is_system = True; role.save()
    username = os.environ.get("ADMIN_USERNAME", "VarshiniShan"); password = os.environ.get("ADMIN_PASSWORD", "VarshiniShan")
    user = User.objects.filter(username=username).first()
    if not user:
        user = User.objects.create_superuser(username=username, password=password, first_name="Varshini Shan")
        print(f"[core] Admin '{username}' created. Change ADMIN_PASSWORD in .env for production.")
    Profile.objects.update_or_create(user=user, defaults={"role": role})


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    def ready(self):
        post_migrate.connect(bootstrap_admin, dispatch_uid="core_bootstrap_admin")
