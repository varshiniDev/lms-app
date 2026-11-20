from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = "Show which database Django is using, test the connection and list tables."

    def handle(self, *a, **k):
        d = settings.DATABASES["default"]
        self.stdout.write(f"Engine : {d['ENGINE']}\nName   : {d['NAME']}\nHost   : {d.get('HOST') or '-'}:{d.get('PORT') or '-'}\nUser   : {d.get('USER') or '-'}")
        try:
            tables = connection.introspection.table_names()
            self.stdout.write(self.style.SUCCESS(f"Connected. {len(tables)} tables." + ("" if tables else " (none yet - run: python manage.py migrate)")))
            for t in tables[:80]: self.stdout.write(f"  - {t}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Connection FAILED: {e}"))
