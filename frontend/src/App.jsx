import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { canSee, firstPath } from "./lib/access";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./modules/auth/LoginPage";

const AdminDash = lazy(() => import("./modules/dashboard/LmsDashboard"));
const StudentDash = lazy(() => import("./modules/dashboard/StudentDashboard"));
const TrainerDash = lazy(() => import("./modules/dashboard/TrainerDashboard"));
const MyAttendance = lazy(() => import("./modules/lms/MyAttendance"));
const Students = lazy(() => import("./modules/lms/Students"));
const Staff = lazy(() => import("./modules/lms/Staff"));
const Courses = lazy(() => import("./modules/lms/Courses"));
const Syllabus = lazy(() => import("./modules/lms/Syllabus"));
const Batches = lazy(() => import("./modules/lms/Batches"));
const Enrollment = lazy(() => import("./modules/lms/Enrollment"));
const Schedule = lazy(() => import("./modules/lms/Schedule"));
const Attendance = lazy(() => import("./modules/lms/Attendance"));
const Assignments = lazy(() => import("./modules/lms/Assignments"));
const Assessments = lazy(() => import("./modules/lms/Assessments"));
const Materials = lazy(() => import("./modules/lms/Materials"));
const Fees = lazy(() => import("./modules/lms/Fees"));
const Certificates = lazy(() => import("./modules/lms/Certificates"));
const Announcements = lazy(() => import("./modules/general/Announcements"));
const Reports = lazy(() => import("./modules/lms/LmsReports"));
const Users = lazy(() => import("./modules/general/Users"));
const UserLevels = lazy(() => import("./modules/general/UserLevels"));
const Settings = lazy(() => import("./modules/general/Settings"));

// A screen opens only if the user's level allows it (the API enforces the same rule)
const Allow = ({ k, children }) => { const { user } = useAuth(); if (canSee(user, k)) return children; const to = firstPath(user); return to ? <Navigate to={to} replace /> : <p className="p-10 text-center text-slate-500">No screens assigned to your user level. Ask the administrator.</p>; };
const Guard = () => { const { user, ready } = useAuth(); if (!ready) return <p className="p-10 text-center text-slate-500">Loading...</p>; return user ? <AppShell /> : <Navigate to="/login" replace />; };
// Same screens, different home / attendance page depending on the kind of login
const Dash = () => { const { user } = useAuth(); return user.kind === "student" ? <StudentDash /> : user.kind === "trainer" ? <TrainerDash /> : <AdminDash />; };
const AttendanceByRole = () => { const { user } = useAuth(); return user.kind === "student" ? <MyAttendance /> : <Attendance />; };
const R = ({ k, el: El }) => <Allow k={k}><El /></Allow>;
export default function App() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-slate-500">Loading...</p>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<Guard />}>
          <Route index element={<R k="dashboard" el={Dash} />} />
          <Route path="students" element={<R k="students" el={Students} />} /><Route path="staff" element={<R k="staff" el={Staff} />} />
          <Route path="courses" element={<R k="courses" el={Courses} />} /><Route path="courses/:id/syllabus" element={<R k="courses" el={Syllabus} />} />
          <Route path="batches" element={<R k="batches" el={Batches} />} /><Route path="enrollment" element={<R k="enrollment" el={Enrollment} />} />
          <Route path="schedule" element={<R k="schedule" el={Schedule} />} /><Route path="attendance" element={<R k="attendance" el={AttendanceByRole} />} />
          <Route path="assignments" element={<R k="assignments" el={Assignments} />} /><Route path="assessments" element={<R k="assessments" el={Assessments} />} /><Route path="materials" element={<R k="materials" el={Materials} />} />
          <Route path="fees" element={<R k="fees" el={Fees} />} /><Route path="certificates" element={<R k="certificates" el={Certificates} />} />
          <Route path="announcements" element={<R k="announcements" el={Announcements} />} /><Route path="reports" element={<R k="reports" el={Reports} />} />
          <Route path="users" element={<R k="users" el={Users} />} /><Route path="levels" element={<R k="levels" el={UserLevels} />} /><Route path="settings" element={<R k="settings" el={Settings} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
