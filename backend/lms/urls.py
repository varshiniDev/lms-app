from django.urls import include, path
from rest_framework.routers import DefaultRouter
from . import views as v

r = DefaultRouter()
for name, vs in [("courses", v.CourseVS), ("topics", v.TopicVS), ("staff", v.StaffVS), ("students", v.StudentVS), ("batches", v.BatchVS), ("enrollments", v.EnrollmentVS),
                 ("attendance", v.AttendanceVS), ("sessions", v.SessionVS), ("materials", v.MaterialVS), ("assignments", v.AssignmentVS), ("assessments", v.AssessmentVS),
                 ("fees", v.FeeVS), ("certificates", v.CertificateVS), ("announcements", v.AnnouncementVS)]:
    r.register(name, vs, basename=name)
urlpatterns = [path("", include(r.urls))]
