from datetime import date, timedelta
from django.db import transaction
from rest_framework import serializers as drf
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from core.api import Base, build_serializer
from core.permissions import linked_of, role_kind
from . import models as m

CourseS = build_serializer(m.Course); TopicS = build_serializer(m.Topic); StaffS = build_serializer(m.Staff, read_only=("staff_code",))
StudentS = build_serializer(m.Student, read_only=("student_code",)); BatchS = build_serializer(m.Batch); EnrollmentS = build_serializer(m.Enrollment)
AttendanceS = build_serializer(m.Attendance); SessionS = build_serializer(m.ClassSession); MaterialS = build_serializer(m.Material)
AssignmentS = build_serializer(m.Assignment); AssessmentS = build_serializer(m.Assessment, read_only=("grade",))
FeeS = build_serializer(m.Fee, read_only=("paid", "status", "last_payment_on"), extra={"balance": drf.SerializerMethodField(), "get_balance": lambda self, o: o.total - o.paid}, extra_fields=("balance",))
CertificateS = build_serializer(m.Certificate, read_only=("certificate_no",)); AnnouncementS = build_serializer(m.Announcement)

# ---------- who sees what ----------
# Admin / custom levels see everything their permissions allow. The built-in portal levels are scoped to their own data:
#   Student  -> only their own enrolments, batches, classes, attendance, assignments, results, fees, certificates
#   Trainer  -> only the batches they teach, those batches' students, classes, attendance, assignments, results
def scoped(qs, user, key):
    kind = role_kind(user)
    if kind not in ("student", "trainer"):
        return qs
    lid = linked_of(user)
    if not lid:
        return qs.none()
    if key == "announcements":
        return qs.filter(audience__in=("Everyone", "Students" if kind == "student" else "Staff"), status="Active")
    if kind == "student":
        rules = {"students": Q(id=lid), "enrollments": Q(student_id=lid), "batches": Q(enrollments__student_id=lid), "courses": Q(batches__enrollments__student_id=lid),
                 "topics": Q(course__batches__enrollments__student_id=lid), "staff": Q(batches__enrollments__student_id=lid), "attendance": Q(student_id=lid),
                 "sessions": Q(batch__enrollments__student_id=lid), "materials": Q(course__batches__enrollments__student_id=lid), "assignments": Q(batch__enrollments__student_id=lid),
                 "assessments": Q(student_id=lid), "fees": Q(student_id=lid), "certificates": Q(student_id=lid)}
    else:
        rules = {"students": Q(enrollments__batch__staff_id=lid), "enrollments": Q(batch__staff_id=lid), "batches": Q(staff_id=lid), "courses": Q(batches__staff_id=lid),
                 "topics": Q(course__batches__staff_id=lid), "staff": Q(id=lid), "attendance": Q(batch__staff_id=lid), "sessions": Q(batch__staff_id=lid),
                 "materials": Q(course__batches__staff_id=lid), "assignments": Q(batch__staff_id=lid), "assessments": Q(batch__staff_id=lid)}
    q = rules.get(key)
    return qs.filter(q).distinct() if q is not None else qs.none()


class ScopedVS(Base):
    scope_key = ""

    def get_queryset(self):
        return scoped(super().get_queryset(), self.request.user, self.scope_key)

    def _check(self, ser):
        """A trainer may only write into their own batches/courses, and only for students enrolled in that batch."""
        u = self.request.user
        if role_kind(u) != "trainer":
            return
        lid, d = linked_of(u), ser.validated_data
        b, c, st = d.get("batch"), d.get("course"), d.get("student")
        if b is not None and b.staff_id != lid:
            raise PermissionDenied("You can only manage your own batches.")
        if c is not None and not m.Batch.objects.filter(staff_id=lid, course=c).exists():
            raise PermissionDenied("You can only manage materials for courses you teach.")
        if st is not None and b is not None and not m.Enrollment.objects.filter(student=st, batch=b).exists():
            raise PermissionDenied("That student is not enrolled in this batch.")

    def perform_create(self, ser):
        self._check(ser); super().perform_create(ser)

    def perform_update(self, ser):
        self._check(ser); super().perform_update(ser)


def make_scoped(model, ser, screen, key, lookup=False):
    return type(f"{model.__name__}VS", (ScopedVS,), {"queryset": model.objects.all(), "serializer_class": ser, "screen": screen, "lookup": lookup, "scope_key": key,
                                                    "read_screens": (), "perm_actions": {}})


# make_scoped(model, serializer, screen needed to WRITE, scope key, readable "lookup" data)
CourseVS = make_scoped(m.Course, CourseS, "courses", "courses", True); TopicVS = make_scoped(m.Topic, TopicS, "courses", "topics", True)
StaffVS = make_scoped(m.Staff, StaffS, "staff", "staff", True); StudentVS = make_scoped(m.Student, StudentS, "students", "students", True)
BatchVS = make_scoped(m.Batch, BatchS, "batches", "batches", True); EnrollmentVS = make_scoped(m.Enrollment, EnrollmentS, "enrollment", "enrollments", True)
SessionVS = make_scoped(m.ClassSession, SessionS, "schedule", "sessions", True); MaterialVS = make_scoped(m.Material, MaterialS, "materials", "materials", True)
AssignmentVS = make_scoped(m.Assignment, AssignmentS, "assignments", "assignments"); AssessmentVS = make_scoped(m.Assessment, AssessmentS, "assessments", "assessments")
CertificateVS = make_scoped(m.Certificate, CertificateS, "certificates", "certificates"); AnnouncementVS = make_scoped(m.Announcement, AnnouncementS, "announcements", "announcements", True)


class AttendanceVS(ScopedVS):
    serializer_class = AttendanceS; screen = "attendance"; lookup = True; perm_actions = {"bulk": "add"}; scope_key = "attendance"; read_screens = ()

    def get_queryset(self):
        qs = scoped(m.Attendance.objects.all(), self.request.user, "attendance")
        if self.action == "list":
            qs = qs.filter(date__gte=date.today() - timedelta(days=int(self.request.query_params.get("days", 90))))
        return qs

    @action(detail=False, methods=["post"])
    def bulk(self, request):
        """Save a whole class roster for one batch + day."""
        batch_id, day, entries = request.data.get("batch_id"), request.data.get("date"), request.data.get("entries", [])
        if not batch_id or not day: raise drf.ValidationError({"detail": "batch_id and date are required"})
        if role_kind(request.user) == "trainer" and not m.Batch.objects.filter(pk=batch_id, staff_id=linked_of(request.user)).exists():
            raise PermissionDenied("You can only mark attendance for your own batches.")
        with transaction.atomic():
            m.Attendance.objects.filter(batch_id=batch_id, date=day).delete()
            m.Attendance.objects.bulk_create([m.Attendance(batch_id=batch_id, student_id=e["student_id"], date=day, status=e["status"]) for e in entries])
        return Response({"saved": len(entries)})


class FeeVS(ScopedVS):
    queryset = m.Fee.objects.all(); serializer_class = FeeS; screen = "fees"; perm_actions = {"pay": "edit"}; scope_key = "fees"

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
