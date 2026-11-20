import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { fmtDate, todayISO } from "../../lib/format";
export default function Announcements() {
  const columns = [
    { key: "title", label: "Title", render: (r) => <b className="text-slate-900">{r.title}</b>, export: (r) => r.title }, { key: "audience", label: "Audience" },
    { key: "message", label: "Message", hide: "md" }, { key: "date", label: "Date", render: (r) => fmtDate(r.date), export: (r) => r.date }, { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "title", label: "Title", required: true, full: true }, { key: "audience", label: "Audience", type: "select", options: ["Everyone", "Students", "Staff", "Leads"] }, { key: "date", label: "Date", type: "date" },
    { key: "status", label: "Status", type: "select", options: ["Active", "Closed"] }, { key: "message", label: "Message", type: "textarea", required: true },
  ];
  return <EntityPage title="Announcements" subtitle="Notices for students, staff and prospective leads" singular="Announcement" collection="announcements" columns={columns} fields={fields} defaults={{ audience: "Everyone", status: "Active", date: todayISO() }} />;
}
