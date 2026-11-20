import { BadgeCheck, Download, GraduationCap, CalendarCheck } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import { PersonCell } from "../../components/common/Avatar";
import { useDb, useLookup } from "../../hooks/useDb";
import { downloadCertificate } from "../../services/certificate";
import { fmtDate, todayISO } from "../../lib/format";
import { useToast } from "../../context/ToastContext";

export default function Certificates() {
  const db = useDb(); const students = useLookup("students"); const courses = useLookup("courses"); const toast = useToast(); const month = todayISO().slice(0, 7);
  const columns = [
    { key: "certificateNo", label: "Certificate", render: (r) => <b className="text-slate-900">{r.certificateNo}</b>, export: (r) => r.certificateNo },
    { key: "student", label: "Student", render: (r) => <PersonCell name={students.get(r.studentId)?.name || "-"} sub={students.get(r.studentId)?.studentCode} />, export: (r) => students.get(r.studentId)?.name || "" },
    { key: "course", label: "Course", render: (r) => courses.get(r.courseId)?.name, export: (r) => courses.get(r.courseId)?.name || "" }, { key: "grade", label: "Grade", hide: "md" },
    { key: "issuedOn", label: "Issued", hide: "md", render: (r) => fmtDate(r.issuedOn), export: (r) => r.issuedOn }, { key: "remarks", label: "Remarks", hide: "lg" },
  ];
  const fields = [
    { key: "studentId", label: "Student", type: "select", required: true, options: db.students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentCode})` })), display: (r) => students.get(r.studentId)?.name },
    { key: "courseId", label: "Course", type: "select", required: true, options: db.courses.map((c) => ({ value: c.id, label: c.name })), display: (r) => courses.get(r.courseId)?.name },
    { key: "issuedOn", label: "Issue date", type: "date" }, { key: "grade", label: "Grade (e.g. A+)" }, { key: "remarks", label: "Remarks", full: true },
  ];
  const stats = (rows) => [{ label: "Certificates issued", value: rows.length, icon: BadgeCheck, tone: "green" }, { label: "This month", value: rows.filter((r) => r.issuedOn.startsWith(month)).length, icon: CalendarCheck, tone: "blue" }, { label: "Students certified", value: new Set(rows.map((r) => r.studentId)).size, icon: GraduationCap, tone: "purple" }];
  return <EntityPage title="Certificates" subtitle="Issue course-completion certificates and download them as PDF" singular="Certificate" collection="certificates" columns={columns} fields={fields} stats={stats} defaults={{ issuedOn: todayISO() }}
    rowActions={(r) => [{ icon: Download, title: "Download certificate PDF", cls: "text-emerald-600", onClick: async (x) => { try { await downloadCertificate({ certificateNo: x.certificateNo, studentName: students.get(x.studentId)?.name || "", courseName: courses.get(x.courseId)?.name || "", issuedOn: fmtDate(x.issuedOn), grade: x.grade }); toast("Certificate downloaded"); } catch { toast("Could not create PDF", "error"); } } }]} />;
}
