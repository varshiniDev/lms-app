import { GraduationCap, UserCheck, Award, UserX } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb, useLookup } from "../../hooks/useDb";
import { studentAtt } from "../../lib/metrics";
import { todayISO } from "../../lib/format";

export default function Students() {
  const db = useDb(); const batches = useLookup("batches"); const courses = useLookup("courses");
  const info = (id) => { const e = db.enrollments.find((x) => x.studentId === id && x.status === "Active"); const b = e && batches.get(e.batchId); return { batch: b?.name || "-", course: b ? courses.get(b.courseId)?.name : "-" }; };
  const feeStatus = (id) => { const f = db.fees.filter((x) => x.studentId === id); if (!f.length) return "-"; return f.every((x) => x.status === "Paid") ? "Paid" : f.some((x) => x.paid > 0) ? "Partial" : "Pending"; };
  const columns = [
    { key: "name", label: "Student", render: (r) => <PersonCell name={r.name} sub={`${r.studentCode} - ${r.email || ""}`} />, export: (r) => r.name },
    { key: "studentCode", label: "Student ID", exportOnly: true }, { key: "email", label: "Email", exportOnly: true }, { key: "guardian", label: "Guardian", exportOnly: true },
    { key: "phone", label: "Phone", hide: "md" }, { key: "city", label: "City", hide: "lg" },
    { key: "batch", label: "Batch", render: (r) => info(r.id).batch, export: (r) => info(r.id).batch }, { key: "course", label: "Course", hide: "md", render: (r) => info(r.id).course, export: (r) => info(r.id).course },
    { key: "att", label: "Attendance", render: (r) => { const s = studentAtt(db.attendance, r.id); return s.total ? <b className={s.pct < 75 ? "text-red-600" : "text-emerald-600"}>{s.pct}%</b> : "-"; }, export: (r) => `${studentAtt(db.attendance, r.id).pct}%`, sort: (r) => studentAtt(db.attendance, r.id).pct },
    { key: "fees", label: "Fees", hide: "md", render: (r) => (feeStatus(r.id) === "-" ? "-" : <Badge>{feeStatus(r.id)}</Badge>), export: (r) => feeStatus(r.id) },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "name", label: "Full name", required: true }, { key: "phone", label: "Phone", type: "tel", required: true }, { key: "email", label: "Email", type: "email" }, { key: "city", label: "City" },
    { key: "guardian", label: "Parent / guardian" }, { key: "joinedOn", label: "Joined on", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Active", "Completed", "Dropped"] },
  ];
  const stats = (rows) => [
    { label: "Students", value: rows.length, icon: GraduationCap, tone: "blue" }, { label: "Active", value: rows.filter((r) => r.status === "Active").length, icon: UserCheck, tone: "green" },
    { label: "Completed", value: rows.filter((r) => r.status === "Completed").length, icon: Award, tone: "purple" }, { label: "Dropped", value: rows.filter((r) => r.status === "Dropped").length, icon: UserX, tone: "red" },
  ];
  return <EntityPage title="Students" subtitle="Admit learners, track their batch, attendance and fees" singular="Student" collection="students" columns={columns} fields={fields} stats={stats} importFields={["name", "phone", "email", "city", "guardian"]}
    filters={[{ key: "status", label: "Status", options: ["Active", "Completed", "Dropped"] }]} defaults={{ status: "Active", joinedOn: todayISO() }} />;
}
