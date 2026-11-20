import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb } from "../../hooks/useDb";

export default function Syllabus() {
  const { id } = useParams(); const cid = Number(id); const db = useDb(); const course = db.courses.find((c) => c.id === cid);
  const columns = [
    { key: "week", label: "Week" }, { key: "title", label: "Topic", render: (r) => <b className="text-slate-900">{r.title}</b>, export: (r) => r.title },
    { key: "minutes", label: "Est. minutes", hide: "md" }, { key: "description", label: "Description", hide: "lg" }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "title", label: "Topic title", required: true, full: true }, { key: "week", label: "Week no.", type: "number" }, { key: "minutes", label: "Estimated minutes", type: "number" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }, { key: "description", label: "Description", type: "textarea" },
  ];
  if (!course) return <p className="p-10 text-center text-slate-500">Course not found. <Link className="text-brand" to="/courses">Back to courses</Link></p>;
  return (
    <EntityPage title={`Syllabus - ${course.name}`} subtitle={`${course.code} - ${course.weeks} weeks`} singular="Topic" collection="topics" screen="courses" columns={columns} fields={fields} baseFilter={(t) => t.courseId === cid}
      defaults={{ courseId: cid, status: "Active", week: 1, minutes: 240 }} prepare={(v) => ({ ...v, courseId: cid })} exportName={`syllabus-${course.code}`}
      headerExtra={<Link to="/courses" className="btn btn-ghost"><ArrowLeft size={16} />Courses</Link>} />
  );
}
