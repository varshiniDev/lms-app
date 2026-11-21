import { UserCheck, Clock, UserX, Percent } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import Badge from "../../components/common/Badge";
import { ChartCard, Donut } from "../../components/charts/Charts";
import { useDb, useLookup } from "../../hooks/useDb";
import { attStats } from "../../lib/metrics";
import { fmtDate } from "../../lib/format";

// Student portal: the student's own attendance (the API only ever returns their rows)
export default function MyAttendance() {
  const db = useDb(); const batches = useLookup("batches"); const s = attStats(db.attendance);
  const columns = [
    { key: "date", label: "Date", render: (r) => fmtDate(r.date), export: (r) => r.date }, { key: "batch", label: "Batch", render: (r) => batches.get(r.batchId)?.name, export: (r) => batches.get(r.batchId)?.name || "" },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  return (
    <div className="space-y-5 w-full">
      <PageHeader title="My attendance" subtitle="Your attendance record for the last 120 days" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4"><StatCard label="Attendance" value={`${s.pct}%`} icon={Percent} tone={s.pct < 75 ? "red" : "green"} hint={s.pct < 75 ? "Below the 75% minimum" : "Keep it up"} /><StatCard label="Present" value={s.present} icon={UserCheck} tone="green" /><StatCard label="Late" value={s.late} icon={Clock} tone="yellow" /><StatCard label="Absent" value={s.absent} icon={UserX} tone="red" /></div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Summary" className="xl:col-span-1"><Donut data={[{ name: "Present", value: s.present, color: "#4F9D85" }, { name: "Late", value: s.late, color: "#F2B84B" }, { name: "Absent", value: s.absent, color: "#FF5A44" }]} center={{ value: `${s.pct}%`, label: "attendance" }} /></ChartCard>
        <div className="xl:col-span-2"><DataTable columns={columns} rows={db.attendance} exportName="my-attendance" exportTitle="My attendance" maxH="calc(100vh - 420px)" /></div>
      </div>
    </div>
  );
}
