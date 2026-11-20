import { Award, TrendingUp, Trophy, AlertTriangle } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb, useLookup } from "../../hooks/useDb";
import { fmtDate, pct, sum, todayISO } from "../../lib/format";

export default function Assessments() {
  const db = useDb(); const students = useLookup("students"); const batches = useLookup("batches");
  const p = (r) => pct(r.marks, r.maxMarks);
  const columns = [
    { key: "student", label: "Student", render: (r) => <PersonCell name={students.get(r.studentId)?.name || "-"} sub={students.get(r.studentId)?.studentCode} />, export: (r) => students.get(r.studentId)?.name || "" },
    { key: "title", label: "Assessment" }, { key: "batch", label: "Batch", hide: "md", render: (r) => batches.get(r.batchId)?.name, export: (r) => batches.get(r.batchId)?.name || "" },
    { key: "date", label: "Date", hide: "lg", render: (r) => fmtDate(r.date), export: (r) => r.date }, { key: "marks", label: "Marks", render: (r) => `${r.marks}/${r.maxMarks}`, export: (r) => `${r.marks}/${r.maxMarks}`, sort: (r) => r.marks },
    { key: "pct", label: "%", render: (r) => `${p(r)}%`, export: (r) => `${p(r)}%`, sort: p }, { key: "grade", label: "Grade", render: (r) => <Badge tone={r.grade === "F" ? "red" : r.grade.startsWith("A") ? "green" : "blue"}>{r.grade}</Badge> },
  ];
  const fields = [
    { key: "studentId", label: "Student", type: "select", required: true, options: db.students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentId})` })), display: (r) => students.get(r.studentId)?.name },
    { key: "batchId", label: "Batch", type: "select", required: true, options: db.batches.map((b) => ({ value: b.id, label: b.name })), display: (r) => batches.get(r.batchId)?.name },
    { key: "title", label: "Assessment title", required: true }, { key: "date", label: "Date", type: "date" }, { key: "marks", label: "Marks obtained", type: "number", required: true }, { key: "maxMarks", label: "Maximum marks", type: "number", required: true },
  ];
  const stats = (rows) => [
    { label: "Results", value: rows.length, icon: Award, tone: "blue" }, { label: "Average score", value: `${rows.length ? Math.round(sum(rows, p) / rows.length) : 0}%`, icon: TrendingUp, tone: "purple" },
    { label: "Distinction (A+/A)", value: rows.filter((r) => p(r) >= 80).length, icon: Trophy, tone: "green" }, { label: "Needs support (<50%)", value: rows.filter((r) => p(r) < 50).length, icon: AlertTriangle, tone: "red" },
  ];
  return <EntityPage title="Assessments" subtitle="Exam and test results with automatic grading" singular="Result" collection="assessments" columns={columns} fields={fields} stats={stats} filters={[{ key: "title", label: "Assessment", options: ["Unit Test 1", "Mid-term Exam"] }, { key: "batchId", label: "Batch", options: db.batches.map((b) => ({ value: b.id, label: b.name })) }]}
    defaults={{ date: todayISO(), maxMarks: 100 }} prepare={(v) => ({ ...v, marks: Number(v.marks), maxMarks: Number(v.maxMarks) })} />;
}
