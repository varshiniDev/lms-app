import { Layers, GraduationCap, CalendarDays, FileText, AlertTriangle, ClipboardCheck, ExternalLink } from "lucide-react";
import DashboardHeader from "../../components/common/DashboardHeader";
import StatCard from "../../components/common/StatCard";
import MiniTable from "../../components/common/MiniTable";
import Badge from "../../components/common/Badge";
import { ChartCard, Bars } from "../../components/charts/Charts";
import { useDb, useLookup } from "../../hooks/useDb";
import { useAuth } from "../../context/AuthContext";
import { attStats, studentAtt, lastWorkingDays } from "../../lib/metrics";
import { fmtDate, pct, sum, todayISO } from "../../lib/format";

// Trainer portal home - only this instructor's batches/students (the API enforces it)
export default function TrainerDashboard() {
  const db = useDb(); const { user } = useAuth(); const batches = useLookup("batches"); const today = todayISO();
  const active = db.batches.filter((b) => b.status === "Active"); const todayAtt = attStats(db.attendance.filter((a) => a.date === today)); const expected = db.enrollments.filter((e) => e.status === "Active").length;
  const week = lastWorkingDays(7).map((d) => { const s = attStats(db.attendance.filter((a) => a.date === d)); return { name: fmtDate(d).slice(0, 6), Present: s.present, Late: s.late, Absent: s.absent }; });
  const perBatch = db.batches.map((b) => ({ name: b.name, Students: db.enrollments.filter((e) => e.batchId === b.id && e.status === "Active").length }));
  const avgBatch = db.batches.map((b) => { const a = db.assessments.filter((x) => x.batchId === b.id); return { name: b.name, "Avg score %": a.length ? Math.round(sum(a, (x) => pct(x.marks, x.maxMarks)) / a.length) : 0 }; });
  const risk = db.students.map((s) => ({ s, ...studentAtt(db.attendance, s.id) })).filter((x) => x.total >= 3 && x.pct < 75).sort((a, b) => a.pct - b.pct);
  const classes = db.sessions.filter((s) => s.date >= today && s.status === "Scheduled").slice(0, 8); const tasks = db.assignments.filter((a) => a.status === "Open").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  const sections = [
    { title: "Summary", columns: [{ key: "k", label: "Item" }, { key: "v", label: "Value" }], rows: [{ k: "Trainer", v: user?.name }, { k: "Active batches", v: active.length }, { k: "Students", v: db.students.length }, { k: "Attendance today", v: `${todayAtt.total} of ${expected} marked` }] },
    { title: "Students per batch", columns: [{ key: "name", label: "Batch" }, { key: "Students", label: "Students" }], rows: perBatch },
    { title: "Low attendance (<75%)", columns: [{ key: "n", label: "Student", export: (r) => r.s.name }, { key: "pct", label: "Attendance %" }], rows: risk },
  ];
  return (
    <div className="space-y-5 w-full">
      <DashboardHeader title={`Welcome, ${user?.name}`} subtitle={`Your classes, students and tasks - ${fmtDate(today)}`} sections={sections} filename="trainer-summary" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="My batches" value={active.length} icon={Layers} tone="purple" hint={`${db.batches.length} in total`} /><StatCard label="My students" value={db.students.length} icon={GraduationCap} tone="green" />
        <StatCard label="Classes ahead" value={classes.length} icon={CalendarDays} tone="blue" hint={`${db.sessions.filter((s) => s.date === today).length} today`} /><StatCard label="Attendance today" value={`${todayAtt.total}/${expected}`} icon={ClipboardCheck} tone={todayAtt.total >= expected && expected ? "green" : "yellow"} hint="Marked / enrolled" />
        <StatCard label="Open assignments" value={tasks.length} icon={FileText} tone="orange" /><StatCard label="Low attendance" value={risk.length} icon={AlertTriangle} tone="red" hint="Students below 75%" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Attendance - last 7 working days" subtitle="Across my batches" className="xl:col-span-2"><Bars stacked data={week} series={[{ key: "Present", color: "#4F9D85" }, { key: "Late", color: "#F2B84B" }, { key: "Absent", color: "#FF5A44" }]} /></ChartCard>
        <ChartCard title="Students per batch"><Bars data={perBatch} series={[{ key: "Students", color: "#6366F1" }]} horizontal /></ChartCard>
        <ChartCard title="Average score by batch" className="xl:col-span-3"><Bars data={avgBatch} series={[{ key: "Avg score %", color: "#F59E0B" }]} /></ChartCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <MiniTable title="Upcoming classes" more="/schedule" empty="No classes scheduled" rows={classes} columns={[{ label: "Class", render: (r) => <b>{r.title}</b> }, { label: "Batch", render: (r) => batches.get(r.batchId)?.name }, { label: "Date", render: (r) => fmtDate(r.date) }, { label: "Join", render: (r) => (/^https?:/.test(r.link) ? <a className="inline-flex items-center gap-1 text-sky-600" href={r.link} target="_blank" rel="noreferrer">Open <ExternalLink size={12} /></a> : r.link || "-") }]} />
        <MiniTable title="Students needing attention" more="/students" empty="Everyone is above 75%" rows={risk.slice(0, 8)} columns={[{ label: "Student", render: (r) => <b>{r.s.name}</b> }, { label: "Phone", render: (r) => r.s.phone }, { label: "Attendance", render: (r) => <Badge tone="red">{r.pct}%</Badge> }]} />
        <MiniTable title="Assignments" more="/assignments" empty="No open assignments" rows={tasks} columns={[{ label: "Title", render: (r) => <b>{r.title}</b> }, { label: "Batch", render: (r) => batches.get(r.batchId)?.name }, { label: "Due", render: (r) => fmtDate(r.dueDate) }]} />
      </div>
    </div>
  );
}
