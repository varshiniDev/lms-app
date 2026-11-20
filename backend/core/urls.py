from rest_framework.routers import SimpleRouter
from .accounts import RoleVS, UserVS

router = SimpleRouter()
router.register("users", UserVS, basename="users")
router.register("roles", RoleVS, basename="roles")
urlpatterns = router.urls
