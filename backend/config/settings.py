import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

APP_NAME = "lms"  # "crm" or "lms"
# Screens that access levels can grant (view / add / edit / delete). Users & Access is admin-only and not listed.
SCREENS = ["dashboard", "students", "staff", "courses", "batches", "enrollment", "attendance", "schedule", "assignments", "assessments", "materials", "fees", "certificates", "announcements", "reports"]
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY") or ("dev-only-insecure-key" if DEBUG else None)
if not SECRET_KEY:
    raise RuntimeError("Set DJANGO_SECRET_KEY in .env")
ALLOWED_HOSTS = [h.strip().replace("https://", "").replace("http://", "").strip("/") for h in os.environ.get("ALLOWED_HOSTS", "*").split(",") if h.strip()]
if os.environ.get("RENDER_EXTERNAL_HOSTNAME") and "*" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])
INSTALLED_APPS = [
    "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "core", APP_NAME,
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware","whitenoise.middleware.WhiteNoiseMiddleware","django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
                                                 "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"

# ---- DATABASE: choose with DB_ENGINE in .env (sqlite | postgresql | mysql) ----
_engine = os.environ.get("DB_ENGINE", "sqlite").lower()
if _engine == "mysql":
    try:
        import MySQLdb  # noqa: F401  (mysqlclient, if installed)
    except ImportError:  # pure-Python fallback: pip install PyMySQL
        import pymysql
        pymysql.version_info = (2, 2, 1, "final", 0)
        pymysql.install_as_MySQLdb()
if _engine == "sqlite":
    DATABASES = {"default": {"ENGINE": "django.db.backends.sqlite3", "NAME": BASE_DIR / f"{APP_NAME}.sqlite3"}}
else:
    DATABASES = {"default": {
        "ENGINE": {"postgresql": "django.db.backends.postgresql", "mysql": "django.db.backends.mysql"}[_engine],
        "NAME": os.environ.get("DB_NAME", f"{APP_NAME}_db"), "USER": os.environ.get("DB_USER", ""),
        "PASSWORD": os.environ.get("DB_PASSWORD", ""), "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432" if _engine == "postgresql" else "3306"),
    }}
    if _engine == "mysql":
        DATABASES["default"]["OPTIONS"] = {"charset": "utf8mb4"}

AUTH_PASSWORD_VALIDATORS = [{"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"}]
TIME_ZONE = os.environ.get("TIME_ZONE", "Asia/Kolkata")
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [o for o in os.environ.get("CORS_ORIGINS", "").split(",") if o]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["core.permissions.ScreenPermission"],
    "EXCEPTION_HANDLER": "core.exceptions.handler",
    "DEFAULT_PAGINATION_CLASS": None,
}
SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(minutes=60), "REFRESH_TOKEN_LIFETIME": timedelta(days=7)}
