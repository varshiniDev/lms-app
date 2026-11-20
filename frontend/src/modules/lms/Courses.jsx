import { BookOpen, ListTree, IndianRupee, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb } from "../../hooks/useDb";
import { money, sum } from "../../lib/format";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export default function Courses() {
  const db = useDb(); const nav = useNavigate();
  const columns = [
    { key: "name", label: "Course", render: (r) => <b className="text-slate-900">{r.name}</b>, export: (r) => r.name }, { key: "code", label: "Code" }, { key: "level", label: "Level", hide: "md" },
    { key: "weeks", label: "Weeks" }, { key: "fee", label: "Fee", render: (r) => money(r.fee), export: (r) => r.fee },
    { key: "topics", label: "Topics", hide: "md", render: (r) => db.topics.filter((t) => t.courseId === r.id).length, export: (r) => db.topics.filter((t) => t.courseId === r.id).length },
    { key: "batches", label: "Batches", hide: "lg", render: (r) => db.batches.filter((b) => b.courseId === r.id).length, export: (r) => db.batches.filter((b) => b.courseId === r.id).length },
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "name", label: "Course name", required: true }, { key: "code", label: "Code", required: true }, { key: "level", label: "Level", type: "select", options: LEVELS },
    { key: "weeks", label: "Duration (weeks)", type: "number" }, { key: "fee", label: "Fee (INR)", type: "number", required: true }, { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
    { key: "description", label: "Description", type: "textarea" },
  ];
  const stats = (rows) => [
    { label: "Courses", value: rows.length, icon: BookOpen, tone: "blue" }, { label: "Active", value: rows.filter((r) => r.status === "Active").length, icon: BookOpen, tone: "green" },
    { label: "Syllabus topics", value: db.topics.length, icon: ListTree, tone: "purple" }, { label: "Avg fee", value: money(rows.length ? Math.round(sum(rows, (r) => r.fee) / rows.length) : 0), icon: IndianRupee, tone: "yellow" },
  ];
  return <EntityPage title="Courses & Syllabus" subtitle="Course catalogue - open the syllabus icon to manage topics" singular="Course" collection="courses" columns={columns} fields={fields} stats={stats} filters={[{ key: "level", label: "Level", options: LEVELS }]} defaults={{ status: "Active", level: "Beginner", weeks: 12 }}
    rowActions={(r) => [{ icon: ListTree, title: "Syllabus", onClick: () => nav(`/courses/${r.id}/syllabus`) }]} />;
}
