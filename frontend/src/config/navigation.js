import { LayoutDashboard, GraduationCap, Users, BookOpen, Layers, UserPlus, ClipboardCheck, CalendarDays, FileText, Award, Library, Wallet, BadgeCheck, Bell, FileBarChart, Settings, ShieldCheck, KeyRound } from "lucide-react";
// key = screen permission key (same names as backend settings.SCREENS)
export const NAV = [
  { group: "Learning", items: [
    { key: "dashboard", to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
    { key: "students", to: "/students", label: "Students", icon: GraduationCap },
    { key: "staff", to: "/staff", label: "Instructors", icon: Users },
    { key: "courses", to: "/courses", label: "Courses & Syllabus", icon: BookOpen },
    { key: "batches", to: "/batches", label: "Batches", icon: Layers },
    { key: "enrollment", to: "/enrollment", label: "Enrollment", icon: UserPlus },
  ] },
  { group: "Classroom", items: [
    { key: "schedule", to: "/schedule", label: "Class schedule", icon: CalendarDays },
    { key: "attendance", to: "/attendance", label: "Attendance", icon: ClipboardCheck },
    { key: "assignments", to: "/assignments", label: "Assignments", icon: FileText },
    { key: "assessments", to: "/assessments", label: "Assessments", icon: Award },
    { key: "materials", to: "/materials", label: "Study materials", icon: Library },
  ] },
  { group: "Institute", items: [
    { key: "fees", to: "/fees", label: "Fees & payments", icon: Wallet }, { key: "certificates", to: "/certificates", label: "Certificates", icon: BadgeCheck },
    { key: "announcements", to: "/announcements", label: "Announcements", icon: Bell }, { key: "reports", to: "/reports", label: "Reports", icon: FileBarChart },
  ] },
  { group: "Admin", items: [
    { key: "users", to: "/users", label: "Users", icon: ShieldCheck }, { key: "levels", to: "/levels", label: "User levels", icon: KeyRound }, { key: "settings", to: "/settings", label: "Settings", icon: Settings },
  ] },
];
