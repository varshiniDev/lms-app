from datetime import date, timedelta
from django.db import transaction
from rest_framework import serializers as drf
from rest_framework.decorators import action
from rest_framework.response import Response
from core.api import Base, build_serializer, make_viewset
from . import models as m

CourseS = build_serializer(m.Course); TopicS = build_serializer(m.Topic); StaffS = build_serializer(m.Staff, read_only=("staff_code",))
StudentS = build_serializer(m.Student, read_only=("student_code",)); BatchS = build_serializer(m.Batch); EnrollmentS = build_serializer(m.Enrollment)
AttendanceS = build_serializer(m.Attendance); SessionS = build_serializer(m.ClassSession); MaterialS = build_serializer(m.Material)
AssignmentS = build_serializer(m.Assignment); AssessmentS = build_serializer(m.Assessment, read_only=("grade",))
FeeS = build_serializer(m.Fee, read_only=("paid", "status", "last_payment_on"), extra={"balance": drf.SerializerMethodField(), "get_balance": lambda self, o: o.total - o.paid}, extra_fields=("balance",))
CertificateS = build_serializer(m.Certificate, read_only=("certificate_no",)); AnnouncementS = build_serializer(m.Announcement)

# make_viewset(model, serializer, screen needed to WRITE, readable-by-everyone "lookup" data)
CourseVS = make_viewset(m.Course, CourseS, "courses", True); TopicVS = make_viewset(m.Topic, TopicS, "courses", True)
StaffVS = make_viewset(m.Staff, StaffS, "staff", True); StudentVS = make_viewset(m.Student, StudentS, "students", True)
BatchVS = make_viewset(m.Batch, BatchS, "batches", True); EnrollmentVS = make_viewset(m.Enrollment, EnrollmentS, "enrollment", True)
SessionVS = make_viewset(m.ClassSession, SessionS, "schedule", True); MaterialVS = make_viewset(m.Material, MaterialS, "materials", True)
AssignmentVS = make_viewset(m.Assignment, AssignmentS, "assignments"); AssessmentVS = make_viewset(m.Assessment, AssessmentS, "assessments")
CertificateVS = make_viewset(m.Certificate, CertificateS, "certificates"); AnnouncementVS = make_viewset(m.Announcement, AnnouncementS, "announcements", True)


class AttendanceVS(Base):
    serializer_class = AttendanceS; screen = "attendance"; lookup = True; perm_actions = {"bulk": "add"}

    def get_queryset(self):
        qs = m.Attendance.objects.all()
        if self.action == "list":
            qs = qs.filter(date__gte=date.today() - timedelta(days=int(self.request.query_params.get("days", 90))))
        return qs

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Save a whole class roster for one batch + day."""
        batch_id, day, entries = request.data.get("batch_id"), request.data.get("date"), request.data.get("entries", [])
        if not batch_id or not day: raise drf.ValidationError({"detail": "batch_id and date are required"})
        with transaction.atomic():
            m.Attendance.objects.filter(batch_id=batch_id, date=day).delete()
            m.Attendance.objects.bulk_create([m.Attendance(batch_id=batch_id, student_id=e["student_id"], date=day, status=e["status"]) for e in entries])
        return Response({"saved": len(entries)})


class FeeVS(Base):
    queryset = m.Fee.objects.all(); serializer_class = FeeS; screen = "fees"; perm_actions = {"pay": "edit"}

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def pay(self, request, pk=None):
        fee = m.Fee.objects.select_for_update().get(pk=pk)
        amt = min(int(request.data.get("amount") or 0), fee.total - fee.paid)
        if amt <= 0: raise drf.ValidationError({"detail": "Enter a valid amount (or this fee is already fully paid)."})
        mode = request.data.get("mode") or fee.mode
        m.Payment.objects.create(fee=fee, amount=amt, mode=mode)
        fee.paid += amt; fee.mode = mode; fee.last_payment_on = date.today(); fee.save()
        return Response(FeeS(fee).data)
