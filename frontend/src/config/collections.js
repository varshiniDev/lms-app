// UI collection name -> Django REST endpoint. users/roles are admin-only (other logins simply get none).
export const COLLECTIONS = {
  students: "/students/", staff: "/staff/", courses: "/courses/", topics: "/topics/", batches: "/batches/", enrollments: "/enrollments/",
  attendance: "/attendance/?days=120", sessions: "/sessions/", materials: "/materials/", assignments: "/assignments/", assessments: "/assessments/",
  fees: "/fees/", certificates: "/certificates/", announcements: "/announcements/", users: "/users/", roles: "/roles/",
};
