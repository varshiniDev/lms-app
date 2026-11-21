import { Layers, Radio, CalendarClock, Users } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb, useLookup } from "../../hooks/useDb";
import { useAuth } from "../../context/AuthContext";
import { BATCH_MODES, DAYS } from "../../config/constants";
import { fmtDate, todayISO } from "../../lib/format";

export default function Batches() {
  const { user } = useAuth();
  const db = useDb(); const courses = useLookup("courses"); const staff = useLookup("staff");
  const enrolled = (b) => db.enrollments.filter((e) => e.batchId === b.id && e.status === "Active").length;
  const columns = [
    { key: "name", label: "Batch", render: (r) => <b className="text-slate-900">{r.name}</b>, export: (r) => r.name },
    { key: "course", label: "Course", render: (r) => courses.get(r.courseId)?.name, export: (r) => courses.get(r.courseId)?.name || "" },
    { key: "trainer", label: "Instructor", hide: "md", render: (r) => staff.get(r.staffId)?.name, export: (r) => staff.get(r.staffId)?.name || "" },
    { key: "sched", label: "Schedule", hide: "md", render: (r) => `${r.days} ${r.startTime}-${r.endTime}`, export: (r) => `${r.days} ${r.startTime}-${r.endTime}` },
    { key: "mode", label: "Mode", hide: "lg" },
    { key: "seats", label: "Seats", render: (r) => <span className={enrolled(r) >= r.capacity ? "font-bold text-red-600" : ""}>{enrolled(r)}/{r.capacity}</span>, export: (r) => `${enrolled(r)}/${r.capacity}`, sort: enrolled },
    { key: "startDate", label: "Start", hide: "lg", render: (r) => fmtDate(r.startDate), export: (r) => r.startDate }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "name", label: "Batch name", required: true }, { key: "courseId", label: "Course", type: "select", required: true, options: db.courses.map((c) => ({ value: c.id, label: c.name })), display: (r) => courses.get(r.courseId)?.name },
    { key: "staffId", label: "Instructor", type: "select", options: db.staff.filter((s) => s.designation.includes("Instructor")).map((s) => ({ value: s.id, label: s.name })), display: (r) => staff.get(r.staffId)?.name },
    { key: "mode", label: "Mode", type: "select", options: BATCH_MODES }, { key: "days", label: "Class days", type: "select", options: DAYS },
    { key: "capacity", label: "Capacity", type: "number" }, { key: "startTime", label: "Start time (HH:MM)", placeholder: "09:30" }, { key: "endTime", label: "End time (HH:MM)", placeholder: "11:00" },
    { key: "startDate", label: "Start date", type: "date", required: true }, { key: "endDate", label: "End date", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Upcoming", "Active", "Completed"] },
  ];
  const stats = (rows) => [
    { label: "Batches", value: rows.length, icon: Layers, tone: "blue" }, { label: "Running", value: rows.filter((r) => r.status === "Active").length, icon: Radio, tone: "green" },
    { label: "Upcoming", value: rows.filter((r) => r.status === "Upcoming").length, icon: CalendarClock, tone: "yellow" }, { label: "Seats filled", value: `${rows.reduce((a, b) => a + enrolled(b), 0)}/${rows.reduce((a, b) => a + b.capacity, 0)}`, icon: Users, tone: "purple" },
  ];
  return <EntityPage title="Batches" subtitle="Schedules, trainers and seat capacity" singular="Batch" collection="batches" columns={user?.kind === "student" ? columns.filter((c) => c.key !== "seats") : columns} fields={fields} stats={stats} filters={[{ key: "status", label: "Status", options: ["Upcoming", "Active", "Completed"] }, { key: "mode", label: "Mode", options: BATCH_MODES }]}
    defaults={{ status: "Upcoming", capacity: 30, mode: "Online", days: DAYS[0], startTime: "10:00", endTime: "11:30", startDate: todayISO() }} />;
}
