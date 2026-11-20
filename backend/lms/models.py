from django.db import models
from django.utils import timezone
from core.api import next_code


class Course(models.Model):
    name = models.CharField(max_length=150)
    code = models.CharField(max_length=30, unique=True)
    weeks = models.PositiveIntegerField(default=12)
    fee = models.PositiveIntegerField(default=0)
    level = models.CharField(max_length=20, default="Beginner")
    status = models.CharField(max_length=10, default="Active")
    description = models.TextField(blank=True)
    class Meta: ordering = ["name"]


class Topic(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="topics")
    title = models.CharField(max_length=200)
    week = models.PositiveIntegerField(default=1)
    minutes = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, default="Active")
    description = models.TextField(blank=True)
    class Meta: ordering = ["week", "id"]


class Staff(models.Model):
    staff_code = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    designation = models.CharField(max_length=60, default="Instructor")
    joined_on = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, default="Active")
    class Meta: ordering = ["name"]
    def save(self, *a, **k):
        if not self.staff_code: self.staff_code = next_code(Staff, "staff_code", "INS-", 3)
        super().save(*a, **k)


class Student(models.Model):
    student_code = models.CharField(max_length=20, unique=True, blank=True)
    name = models.CharField(max_length=120)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=80, blank=True)
    guardian = models.CharField(max_length=120, blank=True)
    joined_on = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=12, default="Active")
    class Meta: ordering = ["-id"]
    def save(self, *a, **k):
        if not self.student_code: self.student_code = next_code(Student, "student_code", "STU-", 4)
        super().save(*a, **k)


class Batch(models.Model):
    name = models.CharField(max_length=120, unique=True)
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="batches")
    staff = models.ForeignKey(Staff, null=True, blank=True, on_delete=models.SET_NULL, related_name="batches")
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    days = models.CharField(max_length=30, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    capacity = models.PositiveIntegerField(default=30)
    mode = models.CharField(max_length=10, default="Online")
    status = models.CharField(max_length=10, default="Upcoming")
    class Meta: ordering = ["-id"]


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="enrollments")
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="enrollments")
    mode = models.CharField(max_length=10, default="Offline")
    enrolled_on = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=10, default="Active")
    class Meta:
        ordering = ["-id"]
        unique_together = [("student", "batch")]


class Attendance(models.Model):
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="attendance")
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="attendance")
    date = models.DateField()
    status = models.CharField(max_length=8)
    class Meta:
        ordering = ["-date"]
        unique_together = [("batch", "student", "date")]


class ClassSession(models.Model):
    """A scheduled live/offline class (timetable)."""
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="sessions")
    title = models.CharField(max_length=200)
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    link = models.CharField(max_length=300, blank=True)  # Zoom / Meet / room
    status = models.CharField(max_length=12, default="Scheduled")
    class Meta: ordering = ["date", "start_time"]


class Material(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="materials")
    title = models.CharField(max_length=200)
    kind = models.CharField(max_length=10, default="Link")  # Video PDF Link Slides Code
    url = models.CharField(max_length=400)
    description = models.TextField(blank=True)
    added_on = models.DateField(default=timezone.localdate)
    class Meta: ordering = ["-id"]


class Assignment(models.Model):
    title = models.CharField(max_length=200)
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="assignments")
    due_date = models.DateField()
    max_marks = models.PositiveIntegerField(default=100)
    submitted = models.PositiveIntegerField(default=0)
    total = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=10, default="Open")
    description = models.TextField(blank=True)
    class Meta: ordering = ["-due_date"]


class Assessment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="assessments")
    batch = models.ForeignKey(Batch, on_delete=models.CASCADE, related_name="assessments")
    title = models.CharField(max_length=150)
    date = models.DateField(default=timezone.localdate)
    marks = models.PositiveIntegerField(default=0)
    max_marks = models.PositiveIntegerField(default=100)
    grade = models.CharField(max_length=3, blank=True)
    class Meta: ordering = ["-date", "-id"]
    def save(self, *a, **k):
        p = round(self.marks / self.max_marks * 100) if self.max_marks else 0
        self.grade = "A+" if p >= 90 else "A" if p >= 80 else "B+" if p >= 70 else "B" if p >= 60 else "C" if p >= 50 else "F"
        super().save(*a, **k)


class Fee(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="fees")
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="fees")
    total = models.PositiveIntegerField(default=0)
    paid = models.PositiveIntegerField(default=0)
    due_date = models.DateField(null=True, blank=True)
    mode = models.CharField(max_length=20, default="UPI")
    status = models.CharField(max_length=10, default="Pending")
    last_payment_on = models.DateField(null=True, blank=True)
    class Meta: ordering = ["-id"]
    def save(self, *a, **k):
        self.status = "Paid" if self.total and self.paid >= self.total else "Partial" if self.paid > 0 else "Pending"
        super().save(*a, **k)


class Payment(models.Model):
    fee = models.ForeignKey(Fee, on_delete=models.CASCADE, related_name="payments")
    amount = models.PositiveIntegerField()
    mode = models.CharField(max_length=20, default="UPI")
    paid_on = models.DateField(default=timezone.localdate)
    class Meta: ordering = ["-id"]


class Certificate(models.Model):
    certificate_no = models.CharField(max_length=20, unique=True, blank=True)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.PROTECT, related_name="certificates")
    issued_on = models.DateField(default=timezone.localdate)
    grade = models.CharField(max_length=10, blank=True)
    remarks = models.CharField(max_length=200, blank=True)
    class Meta: ordering = ["-id"]
    def save(self, *a, **k):
        if not self.certificate_no: self.certificate_no = next_code(Certificate, "certificate_no", "CERT-", 5)
        super().save(*a, **k)


class Announcement(models.Model):
    title = models.CharField(max_length=200)
    audience = models.CharField(max_length=20, default="Everyone")
    message = models.TextField()
    date = models.DateField(default=timezone.localdate)
    status = models.CharField(max_length=10, default="Active")
    class Meta: ordering = ["-date", "-id"]
