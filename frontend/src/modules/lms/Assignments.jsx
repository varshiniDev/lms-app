import { FileText, FolderOpen, CheckCircle2, TrendingUp } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb, useLookup } from "../../hooks/useDb";
import { fmtDate, pct, sum } from "../../lib/format";

export default function Assignments() {
  const db = useDb(); const batches = useLookup("batches");
  const columns = [
    { key: "title", label: "Assignment", render: (r) => <b className="text-slate-900">{r.title}</b>, export: (r) => r.title },
    { key: "batch", label: "Batch", render: (r) => batches.get(r.batchId)?.name, export: (r) => batches.get(r.batchId)?.name || "" },
    { key: "dueDate", label: "Due", render: (r) => fmtDate(r.dueDate), export: (r) => r.dueDate }, { key: "maxMarks", label: "Max marks", hide: "md" },
    { key: "sub", label: "Submitted", sort: (r) => pct(r.submitted, r.total), export: (r) => `${r.submitted}/${r.total}`, render: (r) => <div className="min-w-28"><div className="text-xs font-semibold">{r.submitted}/{r.total}</div><div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${pct(r.submitted, r.total)}%` }} /></div></div> },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "title", label: "Title", required: true, full: true }, { key: "batchId", label: "Batch", type: "select", required: true, options: db.batches.map((b) => ({ value: b.id, label: b.name })), display: (r) => batches.get(r.batchId)?.name },
    { key: "dueDate", label: "Due date", type: "date", required: true }, { key: "maxMarks", label: "Max marks", type: "number" }, { key: "total", label: "Total students", type: "number" },
    { key: "submitted", label: "Submissions", type: "number" }, { key: "status", label: "Status", type: "select", options: ["Open", "Closed"] }, { key: "description", label: "Instructions", type: "textarea" },
  ];
  const stats = (rows) => [
    { label: "Assignments", value: rows.length, icon: FileText, tone: "blue" }, { label: "Open", value: rows.filter((r) => r.status === "Open").length, icon: FolderOpen, tone: "yellow" },
    { label: "Closed", value: rows.filter((r) => r.status === "Closed").length, icon: CheckCircle2, tone: "green" }, { label: "Submission rate", value: `${pct(sum(rows, (r) => r.submitted), sum(rows, (r) => r.total))}%`, icon: TrendingUp, tone: "purple" },
  ];
  return <EntityPage title="Assignments" subtitle="Tasks issued to each batch with submission tracking" singular="Assignment" collection="assignments" columns={columns} fields={fields} stats={stats} filters={[{ key: "status", label: "Status", options: ["Open", "Closed"] }, { key: "batchId", label: "Batch", options: db.batches.map((b) => ({ value: b.id, label: b.name })) }]} defaults={{ status: "Open", maxMarks: 100, total: 20, submitted: 0 }} />;
}
