import { Link } from "react-router-dom";
import { Percent, CalendarDays, FileText, Hourglass, Award, BadgeCheck, ExternalLink } from "lucide-react";
import DashboardHeader from "../../components/common/DashboardHeader";
import StatCard from "../../components/common/StatCard";
import MiniTable from "../../components/common/MiniTable";
import Badge from "../../components/common/Badge";
import { ChartCard, Bars, Donut } from "../../components/charts/Charts";
import { useDb, useLookup } from "../../hooks/useDb";
import { useAuth } from "../../context/AuthContext";
import { attStats } from "../../lib/metrics";
import { fmtDate, money, pct, sum, todayISO } from "../../lib/format";

// Student portal home - every list below is already limited to this student by the API
export default function StudentDashboard() {
  const db = useDb(); const { user } = useAuth(); const batches = useLookup("batches"); const today = todayISO();
  const att = attStats(db.attendance); const balance = sum(db.fees, (f) => f.total - f.paid);
  const classes = db.sessions.filter((s) => s.date >= today && s.status === "Scheduled").sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const tasks = db.assignments.filter((a) => a.status === "Open" && a.dueDate >= today).sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
  const results = [...db.assessments].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8); const avg = results.length ? Math.round(sum(db.assessments, (r) => pct(r.marks, r.maxMarks)) / db.assessments.length) : 0;
  const myBatches = db.batches.map((b) => b.name).join(", ") || "-"; const myCourses = db.courses.map((c) => c.name).join(", ") || "-";
  const sections = [
    { title: "Summary", columns: [{ key: "k", label: "Item" }, { key: "v", label: "Value" }], rows: [{ k: "Student", v: user?.name }, { k: "Courses", v: myCourses }, { k: "Batches", v: myBatches }, { k: "Attendance", v: `${att.pct}%` }, { k: "Average score", v: `${avg}%` }, { k: "Fee balance (INR)", v: balance }] },
    { title: "Results", columns: [{ key: "title", label: "Assessment" }, { key: "marks", label: "Marks" }, { key: "maxMarks", label: "Out of" }, { key: "grade", label: "Grade" }], rows: db.assessments },
  ];
  return (
    <div className="space-y-5 w-full">
      <DashboardHeader title={`Welcome, ${user?.name}`} subtitle={`${myCourses} - ${myBatches}`} sections={sections} filename="my-progress" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Attendance" value={`${att.pct}%`} icon={Percent} tone={att.total && att.pct < 75 ? "red" : "green"} hint={att.total ? `${att.present + att.late} of ${att.total} classes` : "No records yet"} />
        <StatCard label="Classes ahead" value={classes.length} icon={CalendarDays} tone="blue" hint="Scheduled" /><StatCard label="Assignments due" value={tasks.length} icon={FileText} tone="yellow" hint="Open tasks" />
        <StatCard label="Average score" value={`${avg}%`} icon={Award} tone="purple" hint={`${db.assessments.length} results`} /><StatCard label="Fee balance" value={money(balance)} icon={Hourglass} tone={balance ? "orange" : "green"} hint={balance ? "Please clear dues" : "All paid"} />
        <StatCard label="Certificates" value={db.certificates.length} icon={BadgeCheck} tone="green" hint="Earned" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="My attendance"><Donut data={[{ name: "Present", value: att.present, color: "#4F9D85" }, { name: "Late", value: att.late, color: "#F2B84B" }, { name: "Absent", value: att.absent, color: "#FF5A44" }]} center={{ value: `${att.pct}%`, label: "attendance" }} /></ChartCard>
        <ChartCard title="My results" subtitle="Score % per assessment" className="xl:col-span-2"><Bars data={[...db.assessments].reverse().map((r) => ({ name: r.title, "Score %": pct(r.marks, r.maxMarks) }))} series={[{ key: "Score %", color: "#6366F1" }]} /></ChartCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <MiniTable title="Upcoming classes" more="/schedule" empty="No classes scheduled" rows={classes} columns={[{ label: "Class", render: (r) => <b>{r.title}</b> }, { label: "Date", render: (r) => fmtDate(r.date) }, { label: "Time", render: (r) => r.startTime || "-" }, { label: "Join", render: (r) => (/^https?:/.test(r.link) ? <a className="inline-flex items-center gap-1 text-sky-600" href={r.link} target="_blank" rel="noreferrer">Join <ExternalLink size={12} /></a> : r.link || "-") }]} />
        <MiniTable title="Assignments due" more="/assignments" empty="Nothing due" rows={tasks} columns={[{ label: "Assignment", render: (r) => <b>{r.title}</b> }, { label: "Batch", render: (r) => batches.get(r.batchId)?.name }, { label: "Due", render: (r) => fmtDate(r.dueDate) }]} />
        <MiniTable title="Recent results" more="/assessments" empty="No results yet" rows={results} columns={[{ label: "Assessment", render: (r) => <b>{r.title}</b> }, { label: "Marks", render: (r) => `${r.marks}/${r.maxMarks}` }, { label: "Grade", render: (r) => <Badge tone={r.grade === "F" ? "red" : "green"}>{r.grade}</Badge> }]} />
        <MiniTable title="Announcements" more="/announcements" empty="No announcements" rows={db.announcements.slice(0, 6)} columns={[{ label: "Title", render: (r) => <b>{r.title}</b> }, { label: "Date", render: (r) => fmtDate(r.date) }]} />
      </div>
      {balance > 0 && <p className="text-sm text-slate-500">Fee details are on <Link to="/fees" className="font-semibold text-brand">My fees</Link>.</p>}
    </div>
  );
}
