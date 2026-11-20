import { useEffect, useState } from "react";
import { Save, CheckCheck, UserCheck, Clock, UserX, HelpCircle } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import DataTable from "../../components/common/DataTable";
import { PersonCell } from "../../components/common/Avatar";
import { useDb } from "../../hooks/useDb";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../lib/access";
import api, { errMsg } from "../../services/api";
import { refresh } from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { studentAtt } from "../../lib/metrics";
import { todayISO } from "../../lib/format";

const OPTS = [["Present", "P", "bg-emerald-500"], ["Late", "L", "bg-amber-500"], ["Absent", "A", "bg-red-500"]];
export default function Attendance() {
  const db = useDb(); const toast = useToast(); const { user } = useAuth(); const canMark = can(user, "attendance", "add");
  const active = db.batches.filter((b) => b.status === "Active");
  const [batchId, setBatchId] = useState(active[0]?.id || ""); const [date, setDate] = useState(todayISO()); const [draft, setDraft] = useState({});
  const roster = db.enrollments.filter((e) => e.batchId === batchId && e.status === "Active").map((e) => db.students.find((s) => s.id === e.studentId)).filter(Boolean);
  useEffect(() => { setDraft(Object.fromEntries(db.attendance.filter((a) => a.batchId === batchId && a.date === date).map((a) => [a.studentId, a.status]))); /* eslint-disable-next-line */ }, [batchId, date]);
  const rows = roster.map((s) => ({ id: s.id, name: s.name, studentId: s.studentCode, status: draft[s.id] || "Not marked", overall: studentAtt(db.attendance, s.id).pct }));
  const count = (st) => rows.filter((r) => r.status === st).length;
  const save = async () => { try { await api.post("/attendance/bulk/", { batchId, date, entries: roster.filter((s) => draft[s.id]).map((s) => ({ studentId: s.id, status: draft[s.id] })) }); await refresh("attendance"); toast("Attendance saved"); } catch (e) { toast(errMsg(e), "error"); } };
  const columns = [
    { key: "name", label: "Student", render: (r) => <PersonCell name={r.name} sub={r.studentId} />, export: (r) => r.name }, { key: "studentId", label: "Student ID", exportOnly: true },
    { key: "overall", label: "Overall %", render: (r) => <b className={r.overall < 75 ? "text-red-600" : "text-emerald-600"}>{r.overall}%</b>, export: (r) => `${r.overall}%` },
    { key: "status", label: `Status on ${date}`, sortable: false, render: (r) => (
      <div className="flex gap-1.5">{OPTS.map(([st, ch, c]) => <button key={st} title={st} disabled={!canMark} onClick={() => setDraft((d) => ({ ...d, [r.id]: st }))} className={`h-8 w-8 rounded-lg text-xs font-bold transition ${r.status === st ? `${c} text-white` : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{ch}</button>)}</div>), export: (r) => r.status },
  ];
  return (
    <div className="space-y-5 w-full">
      <PageHeader title="Attendance" subtitle="Mark daily attendance by batch - Present, Late or Absent">
        <select className="input !w-auto" value={batchId} onChange={(e) => setBatchId(Number(e.target.value))}>{active.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
        <input type="date" className="input !w-auto" value={date} max={todayISO()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        {canMark && <button className="btn btn-ghost" onClick={() => setDraft(Object.fromEntries(roster.map((s) => [s.id, "Present"])))}><CheckCheck size={16} />All present</button>}
        {canMark && <button className="btn btn-primary" onClick={save}><Save size={16} />Save</button>}
      </PageHeader>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Present" value={count("Present")} icon={UserCheck} tone="green" /><StatCard label="Late" value={count("Late")} icon={Clock} tone="yellow" />
        <StatCard label="Absent" value={count("Absent")} icon={UserX} tone="red" /><StatCard label="Not marked" value={count("Not marked")} icon={HelpCircle} tone="blue" />
      </div>
      <DataTable columns={columns} rows={rows} exportName={`attendance-${date}`} exportTitle={`Attendance - ${db.batches.find((b) => b.id === batchId)?.name} - ${date}`} emptyText="No active students in this batch" />
    </div>
  );
}
