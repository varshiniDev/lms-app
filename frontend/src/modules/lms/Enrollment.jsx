import { UserPlus, UserCheck, UserX, Award } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb, useLookup } from "../../hooks/useDb";
import { fmtDate, todayISO } from "../../lib/format";

export default function Enrollment() {
  const db = useDb(); const students = useLookup("students"); const batches = useLookup("batches"); const courses = useLookup("courses");
  const columns = [
    { key: "student", label: "Student", render: (r) => <PersonCell name={students.get(r.studentId)?.name || "-"} sub={students.get(r.studentId)?.studentCode} />, export: (r) => students.get(r.studentId)?.name || "" },
    { key: "batch", label: "Batch", render: (r) => batches.get(r.batchId)?.name, export: (r) => batches.get(r.batchId)?.name || "" },
    { key: "course", label: "Course", hide: "md", render: (r) => courses.get(batches.get(r.batchId)?.courseId)?.name, export: (r) => courses.get(batches.get(r.batchId)?.courseId)?.name || "" },
    { key: "mode", label: "Mode", hide: "md" }, { key: "enrolledOn", label: "Enrolled on", hide: "lg", render: (r) => fmtDate(r.enrolledOn), export: (r) => r.enrolledOn }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "studentId", label: "Student", type: "select", required: true, options: db.students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentId})` })), display: (r) => students.get(r.studentId)?.name },
    { key: "batchId", label: "Batch", type: "select", required: true, options: db.batches.map((b) => ({ value: b.id, label: `${b.name} - ${courses.get(b.courseId)?.name}` })), display: (r) => batches.get(r.batchId)?.name },
    { key: "mode", label: "Mode", type: "select", options: ["Online", "Offline"] }, { key: "enrolledOn", label: "Enrolled on", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Active", "Completed", "Dropped"] },
  ];
  const stats = (rows) => [
    { label: "Enrollments", value: rows.length, icon: UserPlus, tone: "blue" }, { label: "Active", value: rows.filter((r) => r.status === "Active").length, icon: UserCheck, tone: "green" },
    { label: "Completed", value: rows.filter((r) => r.status === "Completed").length, icon: Award, tone: "purple" }, { label: "Dropped", value: rows.filter((r) => r.status === "Dropped").length, icon: UserX, tone: "red" },
  ];
  return <EntityPage title="Enrollment" subtitle="Which student studies in which batch" singular="Enrollment" collection="enrollments" screen="enrollment" columns={columns} fields={fields} stats={stats} filters={[{ key: "status", label: "Status", options: ["Active", "Completed", "Dropped"] }, { key: "batchId", label: "Batch", options: db.batches.map((b) => ({ value: b.id, label: b.name })) }]} defaults={{ mode: "Offline", status: "Active", enrolledOn: todayISO() }} />;
}
