from django.conf import settings
from django.db import models


class Role(models.Model):
    """A 'user level'. permissions = {"leads": ["view","add","edit","delete"], ...}. The system role 'Administrator' always has everything."""
    name = models.CharField(max_length=60, unique=True)
    description = models.CharField(max_length=200, blank=True)
    permissions = models.JSONField(default=dict, blank=True)
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ["id"]


class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.ForeignKey(Role, null=True, on_delete=models.PROTECT, related_name="profiles")
