import { Library, Video, FileText, ExternalLink } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { useDb, useLookup } from "../../hooks/useDb";
import { MATERIAL_KINDS } from "../../config/constants";
import { fmtDate, todayISO } from "../../lib/format";

export default function Materials() {
  const db = useDb(); const courses = useLookup("courses");
  const columns = [
    { key: "title", label: "Material", render: (r) => <div><b className="text-slate-900">{r.title}</b><div className="text-xs text-slate-500">{courses.get(r.courseId)?.name}</div></div>, export: (r) => r.title },
    { key: "course", label: "Course", exportOnly: true, export: (r) => courses.get(r.courseId)?.name || "" }, { key: "kind", label: "Type", render: (r) => <Badge>{r.kind}</Badge> },
    { key: "url", label: "Open", render: (r) => <a className="inline-flex items-center gap-1 text-sky-600 hover:underline" href={r.url} target="_blank" rel="noreferrer">Open <ExternalLink size={12} /></a>, export: (r) => r.url },
    { key: "addedOn", label: "Added", hide: "md", render: (r) => fmtDate(r.addedOn), export: (r) => r.addedOn },
  ];
  const fields = [
    { key: "title", label: "Title", required: true, full: true }, { key: "courseId", label: "Course", type: "select", required: true, options: db.courses.map((c) => ({ value: c.id, label: c.name })), display: (r) => courses.get(r.courseId)?.name },
    { key: "kind", label: "Type", type: "select", options: MATERIAL_KINDS }, { key: "url", label: "Link / URL", required: true, full: true }, { key: "description", label: "Description", type: "textarea" },
  ];
  const stats = (rows) => [{ label: "Materials", value: rows.length, icon: Library, tone: "blue" }, { label: "Videos", value: rows.filter((r) => r.kind === "Video").length, icon: Video, tone: "red" }, { label: "Documents", value: rows.filter((r) => ["PDF", "Slides"].includes(r.kind)).length, icon: FileText, tone: "yellow" }];
  return <EntityPage title="Study materials" subtitle="Videos, PDFs, slides and links for every course" singular="Material" collection="materials" columns={columns} fields={fields} stats={stats} defaults={{ kind: "Link", addedOn: todayISO() }}
    filters={[{ key: "courseId", label: "Course", options: db.courses.map((c) => ({ value: c.id, label: c.name })) }, { key: "kind", label: "Type", options: MATERIAL_KINDS }]} />;
}
