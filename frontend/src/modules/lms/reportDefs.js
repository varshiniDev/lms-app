import { ClipboardCheck, AlertTriangle, Award, BookOpen, Users, FileText, Wallet } from "lucide-react";
import { attStats, studentAtt, grade } from "../../lib/metrics";
import { pct, sum, fmtDate, money } from "../../lib/format";

const L = (rows) => new Map(rows.map((r) => [r.id, r]));
export const lmsReports = [
  { id: "batch-att", title: "Attendance by batch", description: "Present, late and absent totals", icon: ClipboardCheck, build: (db) => {
    const crs = L(db.courses);
    const rows = db.batches.map((b) => { const s = attStats(db.attendance.filter((a) => a.batchId === b.id)); return { batch: b.name, course: crs.get(b.courseId)?.name, present: s.present, late: s.late, absent: s.absent, pct: s.pct }; });
    return { columns: [{ key: "batch", label: "Batch" }, { key: "course", label: "Course" }, { key: "present", label: "Present" }, { key: "late", label: "Late" }, { key: "absent", label: "Absent" }, { key: "pct", label: "Attendance %", render: (r) => `${r.pct}%`, export: (r) => `${r.pct}%` }], rows, chart: { xKey: "batch", series: [{ key: "pct", name: "Attendance %" }] } };
  } },
  { id: "defaulters", title: "Low-attendance students", description: "Below 75% attendance - needs attention", icon: AlertTriangle, build: (db) => {
    const rows = db.students.map((s) => ({ student: s.name, id: s.studentCode, phone: s.phone, ...studentAtt(db.attendance, s.id) })).filter((r) => r.total && r.pct < 75).sort((a, b) => a.pct - b.pct).map((r) => ({ student: r.student, id: r.id, phone: r.phone, absent: r.absent, late: r.late, pct: r.pct }));
    return { columns: [{ key: "student", label: "Student" }, { key: "id", label: "ID" }, { key: "phone", label: "Phone" }, { key: "absent", label: "Absent days" }, { key: "late", label: "Late days" }, { key: "pct", label: "Attendance %", render: (r) => `${r.pct}%`, export: (r) => `${r.pct}%` }], rows };
  } },
  { id: "performance", title: "Student performance", description: "Average score and grade per student", icon: Award, build: (db) => {
    const rows = db.students.map((s) => { const a = db.assessments.filter((x) => x.studentId === s.id); const avg = a.length ? Math.round(sum(a, (x) => pct(x.marks, x.maxMarks)) / a.length) : 0; return { student: s.name, id: s.studentCode, tests: a.length, avg, grade: grade(avg) }; }).sort((a, b) => b.avg - a.avg);
    return { columns: [{ key: "student", label: "Student" }, { key: "id", label: "ID" }, { key: "tests", label: "Tests" }, { key: "avg", label: "Average %", render: (r) => `${r.avg}%`, export: (r) => `${r.avg}%` }, { key: "grade", label: "Grade" }], rows };
  } },
  { id: "course", title: "Course enrollment", description: "Students, batches and seat utilisation", icon: BookOpen, build: (db) => {
    const rows = db.courses.map((c) => { const b = db.batches.filter((x) => x.courseId === c.id); const ids = b.map((x) => x.id); const st = db.enrollments.filter((e) => ids.includes(e.batchId) && e.status === "Active").length; const cap = sum(b, (x) => x.capacity); return { course: c.name, batches: b.length, students: st, capacity: cap, util: pct(st, cap) }; });
    return { columns: [{ key: "course", label: "Course" }, { key: "batches", label: "Batches" }, { key: "students", label: "Active students" }, { key: "capacity", label: "Capacity" }, { key: "util", label: "Utilisation %", render: (r) => `${r.util}%`, export: (r) => `${r.util}%` }], rows, chart: { xKey: "course", series: [{ key: "students", name: "Students" }, { key: "capacity", name: "Capacity" }] } };
  } },
  { id: "workload", title: "Instructor workload", description: "Batches and learners per trainer", icon: Users, build: (db) => {
    const rows = db.staff.filter((s) => s.designation.includes("Instructor")).map((s) => { const b = db.batches.filter((x) => x.staffId === s.id); const ids = b.map((x) => x.id); return { trainer: s.name, designation: s.designation, batches: b.length, students: db.enrollments.filter((e) => ids.includes(e.batchId) && e.status === "Active").length }; });
    return { columns: [{ key: "trainer", label: "Instructor" }, { key: "designation", label: "Role" }, { key: "batches", label: "Batches" }, { key: "students", label: "Students" }], rows, chart: { xKey: "trainer", series: [{ key: "students", name: "Students" }, { key: "batches", name: "Batches" }] } };
  } },
  { id: "assignments", title: "Assignment tracker", description: "Submission rate per assignment", icon: FileText, build: (db) => {
    const b = L(db.batches);
    const rows = db.assignments.map((a) => ({ title: a.title, batch: b.get(a.batchId)?.name, due: fmtDate(a.dueDate), submitted: `${a.submitted}/${a.total}`, rate: pct(a.submitted, a.total), status: a.status }));
    return { columns: [{ key: "title", label: "Assignment" }, { key: "batch", label: "Batch" }, { key: "due", label: "Due" }, { key: "submitted", label: "Submitted" }, { key: "rate", label: "Rate %", render: (r) => `${r.rate}%`, export: (r) => `${r.rate}%` }, { key: "status", label: "Status" }], rows };
  } },
  { id: "fees", title: "Fee collection & dues", description: "Billed, collected and balance per student", icon: Wallet, build: (db) => {
    const stu = L(db.students); const crs = L(db.courses);
    const rows = db.fees.map((f) => ({ student: stu.get(f.studentId)?.name, course: crs.get(f.courseId)?.name, total: f.total, paid: f.paid, balance: f.total - f.paid, due: f.dueDate || "", status: f.status })).sort((a, b) => b.balance - a.balance);
    return { columns: [{ key: "student", label: "Student" }, { key: "course", label: "Course" }, { key: "total", label: "Total", render: (r) => money(r.total), export: (r) => r.total }, { key: "paid", label: "Paid", render: (r) => money(r.paid), export: (r) => r.paid }, { key: "balance", label: "Balance", render: (r) => money(r.balance), export: (r) => r.balance }, { key: "due", label: "Due date" }, { key: "status", label: "Status" }], rows };
  } },
];
