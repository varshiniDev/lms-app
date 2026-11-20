import { CalendarDays, CalendarCheck, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb, useLookup } from "../../hooks/useDb";
import { fmtDate, todayISO } from "../../lib/format";

export default function Schedule() {
  const db = useDb(); const batches = useLookup("batches"); const today = todayISO();
  const columns = [
    { key: "title", label: "Class", render: (r) => <div><b className="text-slate-900">{r.title}</b><div className="text-xs text-slate-500">{batches.get(r.batchId)?.name}</div></div>, export: (r) => r.title },
    { key: "batch", label: "Batch", exportOnly: true, export: (r) => batches.get(r.batchId)?.name || "" },
    { key: "date", label: "Date", render: (r) => <span className={r.date === today ? "font-bold text-brand" : ""}>{fmtDate(r.date)}{r.date === today && " (today)"}</span>, export: (r) => r.date },
    { key: "time", label: "Time", hide: "md", render: (r) => `${r.startTime || ""}${r.endTime ? ` - ${r.endTime}` : ""}`, export: (r) => `${r.startTime || ""} - ${r.endTime || ""}` },
    { key: "link", label: "Join link / room", hide: "md", render: (r) => (/^https?:/.test(r.link) ? <a className="inline-flex items-center gap-1 text-sky-600 hover:underline" href={r.link} target="_blank" rel="noreferrer">Join <ExternalLink size={12} /></a> : r.link || "-"), export: (r) => r.link },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "title", label: "Class / topic", required: true, full: true }, { key: "batchId", label: "Batch", type: "select", required: true, options: db.batches.map((b) => ({ value: b.id, label: b.name })), display: (r) => batches.get(r.batchId)?.name },
    { key: "date", label: "Date", type: "date", required: true }, { key: "startTime", label: "Start time (HH:MM)", placeholder: "10:00" }, { key: "endTime", label: "End time (HH:MM)", placeholder: "11:30" },
    { key: "link", label: "Meeting link or room", full: true }, { key: "status", label: "Status", type: "select", options: ["Scheduled", "Completed", "Cancelled"] },
  ];
  const stats = (rows) => [{ label: "Classes", value: rows.length, icon: CalendarDays, tone: "blue" }, { label: "Today", value: rows.filter((r) => r.date === today).length, icon: CalendarCheck, tone: "yellow" }, { label: "Completed", value: rows.filter((r) => r.status === "Completed").length, icon: CheckCircle2, tone: "green" }, { label: "Cancelled", value: rows.filter((r) => r.status === "Cancelled").length, icon: XCircle, tone: "red" }];
  return <EntityPage title="Class schedule" subtitle="Timetable of live and offline classes with join links" singular="Class" collection="sessions" screen="schedule" columns={columns} fields={fields} stats={stats} defaults={{ status: "Scheduled", date: today }}
    filters={[{ key: "status", label: "Status", options: ["Scheduled", "Completed", "Cancelled"] }, { key: "batchId", label: "Batch", options: db.batches.map((b) => ({ value: b.id, label: b.name })) }]} />;
}
