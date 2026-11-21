import os
from datetime import timedelta
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

APP_NAME = "lms"  # "crm" or "lms"
# Screens that access levels can grant (view / add / edit / delete). Users & Access is admin-only and not listed.
SCREENS = ["dashboard", "students", "staff", "courses", "batches", "enrollment", "attendance", "schedule", "assignments", "assessments", "materials", "fees", "certificates", "announcements", "reports"]
# Portal logins: a user level of kind "trainer"/"student" is linked to one Instructor / Student record
LINK_MODELS = {"student": "lms.Student", "trainer": "lms.Staff"}
_FULL = ["view", "add", "edit", "delete"]
SYSTEM_ROLES = [  # created/refreshed automatically by `migrate`; row-level scoping is enforced in lms/views.py
    {"name": "Trainer", "kind": "trainer", "description": "Trainer portal: own batches and students, attendance, assignments, results, materials",
     "permissions": {"dashboard": ["view"], "students": ["view"], "courses": ["view"], "batches": ["view"], "schedule": _FULL, "attendance": ["view", "add"],
                     "assignments": _FULL, "assessments": _FULL, "materials": _FULL, "announcements": ["view"]}},
    {"name": "Student", "kind": "student", "description": "Student portal: own classes, attendance, assignments, results, fees and certificates",
     "permissions": {"dashboard": ["view"], "courses": ["view"], "batches": ["view"], "schedule": ["view"], "attendance": ["view"], "assignments": ["view"],
                     "assessments": ["view"], "materials": ["view"], "fees": ["view"], "certificates": ["view"], "announcements": ["view"]}},
]
DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY") or ("dev-only-insecure-key" if DEBUG else None)
if not SECRET_KEY:
    raise RuntimeError("Set DJANGO_SECRET_KEY in .env")
# Accepts "host", "https://host/" or a comma-separated list; Render's own hostname is added automatically.
ALLOWED_HOSTS = [h.strip().replace("https://", "").replace("http://", "").strip("/") for h in os.environ.get("ALLOWED_HOSTS", "*").split(",") if h.strip()]
if os.environ.get("RENDER_EXTERNAL_HOSTNAME") and "*" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(os.environ["RENDER_EXTERNAL_HOSTNAME"])

INSTALLED_APPS = [
    "django.contrib.auth", "django.contrib.contenttypes", "django.contrib.sessions", "django.contrib.messages", "django.contrib.staticfiles",
    "corsheaders", "rest_framework", "core", APP_NAME,
]
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware", "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware", "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware", "django.contrib.messages.middleware.MessageMiddleware",
]
ROOT_URLCONF = "config.urls"
TEMPLATES = [{"BACKEND": "django.template.backends.django.DjangoTemplates", "DIRS": [], "APP_DIRS": True,
              "OPTIONS": {"context_processors": ["django.template.context_processors.request", "django.contrib.auth.context_processors.auth",
                                                 "django.contrib.messages.context_processors.messages"]}}]
WSGI_APPLICATION = "config.wsgi.application"

# ---- DATABASE ----
# Option A (hosting, e.g. Render): one DATABASE_URL  ->  postgres://user:pass@host:5432/dbname  or  mysql://user:pass@host:3306/dbname
# Option B (local): DB_ENGINE = sqlite | postgresql | mysql plus DB_NAME / DB_USER / DB_PASSWORD / DB_HOST / DB_PORT
_url = os.environ.get("DATABASE_URL", "")
if _url:
    from urllib.parse import unquote, urlparse
    _u = urlparse(_url)
    _engine = {"postgres": "postgresql", "postgresql": "postgresql", "mysql": "mysql"}.get(_u.scheme.split("+")[0], "sqlite")
    _cfg = {"NAME": _u.path.lstrip("/"), "USER": unquote(_u.username or ""), "PASSWORD": unquote(_u.password or ""), "HOST": _u.hostname or "localhost", "PORT": str(_u.port or "")}
else:
    _engine = os.environ.get("DB_ENGINE", "sqlite").lower()
    _cfg = {"NAME": os.environ.get("DB_NAME", f"{APP_NAME}_db"), "USER": os.environ.get("DB_USER", ""), "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "localhost"), "PORT": os.environ.get("DB_PORT", "5432" if _engine == "postgresql" else "3306")}
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
    DATABASES = {"default": {"ENGINE": {"postgresql": "django.db.backends.postgresql", "mysql": "django.db.backends.mysql"}[_engine], **_cfg}}
    if _engine == "mysql":
        DATABASES["default"]["OPTIONS"] = {"charset": "utf8mb4"}
    if _engine == "postgresql" and os.environ.get("DB_SSLMODE"):
        DATABASES["default"]["OPTIONS"] = {"sslmode": os.environ["DB_SSLMODE"]}

AUTH_PASSWORD_VALIDATORS = [{"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"}]
TIME_ZONE = os.environ.get("TIME_ZONE", "Asia/Kolkata")
USE_TZ = True
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"  # `collectstatic` (run by hosts such as Render) copies files here
try:  # serve static files from gunicorn without nginx
    import whitenoise  # noqa: F401
    MIDDLEWARE.insert(2, "whitenoise.middleware.WhiteNoiseMiddleware")
except ImportError:
    pass
if not DEBUG:  # behind a hosting proxy (Render, Heroku, ...) that terminates HTTPS
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
CORS_ALLOW_ALL_ORIGINS = DEBUG
CORS_ALLOWED_ORIGINS = [o for o in os.environ.get("CORS_ORIGINS", "").split(",") if o]
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": ["rest_framework_simplejwt.authentication.JWTAuthentication"],
    "DEFAULT_PERMISSION_CLASSES": ["core.permissions.ScreenPermission"],
    "EXCEPTION_HANDLER": "core.exceptions.handler",
    "DEFAULT_PAGINATION_CLASS": None,
    "DEFAULT_RENDERER_CLASSES": ["rest_framework.renderers.JSONRenderer"],  # API is JSON-only (no browsable-API static files)
}
SIMPLE_JWT = {"ACCESS_TOKEN_LIFETIME": timedelta(minutes=60), "REFRESH_TOKEN_LIFETIME": timedelta(days=7)}
