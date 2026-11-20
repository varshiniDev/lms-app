from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from core.accounts import MeView, SystemStatus, TeamView

urlpatterns = [
    path("api/auth/login/", TokenObtainPairView.as_view(permission_classes=[], authentication_classes=[])),
    path("api/auth/refresh/", TokenRefreshView.as_view(permission_classes=[], authentication_classes=[])),
    path("api/auth/me/", MeView.as_view()),
    path("api/team/", TeamView.as_view()),
    path("api/system/status/", SystemStatus.as_view()),
    path("api/", include("core.urls")),
    path("api/", include("lms.urls")),
]
