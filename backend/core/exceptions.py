from django.db.models import ProtectedError
from rest_framework.response import Response
from rest_framework.views import exception_handler


def handler(exc, context):
    if isinstance(exc, ProtectedError):
        return Response({"detail": "This record is still used by other records. Remove or reassign those first."}, status=409)
    return exception_handler(exc, context)
