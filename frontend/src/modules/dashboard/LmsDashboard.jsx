import { useState } from "react";
import { GraduationCap, Layers, UserCheck, Hourglass, AlertTriangle, CalendarDays } from "lucide-react";
import DashboardHeader from "../../components/common/DashboardHeader";
import StatCard from "../../components/common/StatCard";
import MiniTable from "../../components/common/MiniTable";
import Badge from "../../components/common/Badge";
import { ChartCard, Bars, Donut } from "../../components/charts/Charts";
import { useDb, useLookup } from "../../hooks/useDb";
import { attStats, studentAtt, lastWorkingDays } from "../../lib/metrics";
import { fmtDate, money, pct, sum, todayISO } from "../../lib/format";

export default function LmsDashboard() {
  const db = useDb(); const [date, setDate] = useState(todayISO()); const today = todayISO(); const batches = useLookup("batches");
  const { students, staff, courses, attendance, assessments, enrollments, fees, sessions } = db;
  const day = attStats(attendance.filter((a) => a.date === date));
  const week = lastWorkingDays(7, new Date(`${date}T00:00:00`)).map((d) => { const s = attStats(attendance.filter((a) => a.date === d)); return { name: fmtDate(d).slice(0, 6), Present: s.present, Late: s.late, Absent: s.absent }; });
  const byCourse = courses.map((c) => { const ids = db.batches.filter((b) => b.courseId === c.id).map((b) => b.id); return { name: c.name.split(" ")[0], Students: enrollments.filter((e) => ids.includes(e.batchId) && e.status === "Active").length }; });
  const byBatch = db.batches.filter((b) => b.status === "Active").map((b) => { const a = assessments.filter((x) => x.batchId === b.id); return { name: b.name, "Avg score %": a.length ? Math.round(sum(a, (x) => pct(x.marks, x.maxMarks)) / a.length) : 0 }; });
  const risk = students.map((s) => ({ s, ...studentAtt(attendance, s.id) })).filter((x) => x.total >= 5 && x.pct < 75).sort((a, b) => a.pct - b.pct);
  const due = fees.filter((f) => f.total > f.paid).sort((a, b) => (a.dueDate || "9").localeCompare(b.dueDate || "9")).slice(0, 8); const stuMap = new Map(students.map((s) => [s.id, s]));
  const upcoming = sessions.filter((s) => s.date >= today && s.status === "Scheduled").slice(0, 8); const outstanding = sum(fees, (f) => f.total - f.paid);
  const sections = [
    { title: "Key metrics", columns: [{ key: "k", label: "Metric" }, { key: "v", label: "Value" }], rows: [{ k: "Students", v: students.length }, { k: "Instructors", v: staff.length }, { k: "Active batches", v: db.batches.filter((b) => b.status === "Active").length }, { k: "Courses", v: courses.length }, { k: `Attendance ${date}`, v: `${day.pct}%` }, { k: "Fees collected (INR)", v: sum(fees, (f) => f.paid) }, { k: "Fees outstanding (INR)", v: outstanding }] },
    { title: "Attendance - last 7 working days", columns: [{ key: "name", label: "Day" }, { key: "Present", label: "Present" }, { key: "Late", label: "Late" }, { key: "Absent", label: "Absent" }], rows: week },
    { title: "Students by course", columns: [{ key: "name", label: "Course" }, { key: "Students", label: "Students" }], rows: byCourse },
    { title: "Low attendance (<75%)", columns: [{ key: "n", label: "Student", export: (r) => r.s.name }, { key: "pct", label: "Attendance %" }], rows: risk },
  ];
  return (
    <div className="space-y-5 w-full">
      <DashboardHeader title="Dashboard" subtitle={`Learning and fees at a glance - ${fmtDate(date)}`} date={date} onDate={setDate} sections={sections} filename="lms-dashboard" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Students" value={students.length} icon={GraduationCap} tone="green" hint={`${staff.length} instructors`} /><StatCard label="Active batches" value={db.batches.filter((b) => b.status === "Active").length} icon={Layers} tone="purple" hint={`${courses.length} courses`} />
        <StatCard label="Attendance" value={`${day.pct}%`} icon={UserCheck} tone="blue" hint={day.total ? `${day.present} present, ${day.late} late` : "Not marked"} /><StatCard label="Fees outstanding" value={money(outstanding)} icon={Hourglass} tone="yellow" hint={`${money(sum(fees, (f) => f.paid))} collected`} />
        <StatCard label="Low attendance" value={risk.length} icon={AlertTriangle} tone="red" hint="Students below 75%" /><StatCard label="Classes ahead" value={upcoming.length} icon={CalendarDays} tone="orange" hint="Scheduled" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <ChartCard title="Attendance overview" subtitle="Last 7 working days" className="xl:col-span-2"><Bars stacked data={week} series={[{ key: "Present", color: "#4F9D85" }, { key: "Late", color: "#F2B84B" }, { key: "Absent", color: "#FF5A44" }]} /></ChartCard>
        <ChartCard title="Today's status" subtitle={fmtDate(date)}><Donut data={[{ name: "Present", value: day.present, color: "#4F9D85" }, { name: "Late", value: day.late, color: "#F2B84B" }, { name: "Absent", value: day.absent, color: "#FF5A44" }]} center={{ value: day.present + day.late, label: `of ${day.total} present` }} /></ChartCard>
        <ChartCard title="Students by course" className="xl:col-span-2"><Bars data={byCourse} series={[{ key: "Students", color: "#6366F1" }]} /></ChartCard>
        <ChartCard title="Average score by batch"><Bars data={byBatch} series={[{ key: "Avg score %", color: "#F59E0B" }]} horizontal /></ChartCard>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <MiniTable title="Upcoming classes" more="/schedule" rows={upcoming} columns={[{ label: "Class", render: (r) => <b>{r.title}</b> }, { label: "Batch", render: (r) => batches.get(r.batchId)?.name }, { label: "Date", render: (r) => fmtDate(r.date) }]} />
        <MiniTable title="Fee dues" more="/fees" rows={due} columns={[{ label: "Student", render: (r) => <b>{stuMap.get(r.studentId)?.name}</b> }, { label: "Balance", render: (r) => <b className="text-red-600">{money(r.total - r.paid)}</b> }, { label: "Due", render: (r) => fmtDate(r.dueDate) }]} />
        <MiniTable title="Low attendance" more="/reports" empty="Everyone is above 75%" rows={risk.slice(0, 8)} columns={[{ label: "Student", render: (r) => <b>{r.s.name}</b> }, { label: "Phone", render: (r) => r.s.phone }, { label: "Attendance", render: (r) => <Badge tone="red">{r.pct}%</Badge> }]} />
      </div>
    </div>
  );
}
