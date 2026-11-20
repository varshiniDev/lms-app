import { useState } from "react";
import { IndianRupee, Wallet, Hourglass, AlertTriangle, Banknote } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import FormFields from "../../components/common/FormFields";
import { PersonCell } from "../../components/common/Avatar";
import { useDb, useLookup } from "../../hooks/useDb";
import api, { errMsg } from "../../services/api";
import { refresh } from "../../services/store";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { can } from "../../lib/access";
import { PAY_MODES } from "../../config/constants";
import { fmtDate, money, sum, todayISO } from "../../lib/format";

export default function Fees() {
  const db = useDb(); const students = useLookup("students"); const courses = useLookup("courses"); const toast = useToast(); const { user } = useAuth(); const today = todayISO();
  const [pay, setPay] = useState(null); const [p, setP] = useState({ amount: "", mode: "UPI" }); const [busy, setBusy] = useState(false);
  const bal = (r) => r.total - r.paid; const overdue = (r) => bal(r) > 0 && r.dueDate && r.dueDate < today;
  const columns = [
    { key: "student", label: "Student", render: (r) => <PersonCell name={students.get(r.studentId)?.name || "-"} sub={students.get(r.studentId)?.studentCode} />, export: (r) => students.get(r.studentId)?.name || "" },
    { key: "course", label: "Course", hide: "md", render: (r) => courses.get(r.courseId)?.name, export: (r) => courses.get(r.courseId)?.name || "" },
    { key: "total", label: "Total", render: (r) => money(r.total), export: (r) => r.total }, { key: "paid", label: "Paid", render: (r) => money(r.paid), export: (r) => r.paid },
    { key: "balance", label: "Balance", render: (r) => <b className={bal(r) > 0 ? "text-red-600" : "text-emerald-600"}>{money(bal(r))}</b>, export: bal, sort: bal },
    { key: "dueDate", label: "Due", hide: "lg", render: (r) => <span className={overdue(r) ? "font-bold text-red-600" : ""}>{fmtDate(r.dueDate)}</span>, export: (r) => r.dueDate || "" }, { key: "mode", label: "Last mode", hide: "lg" },
    { key: "status", label: "Status", render: (r) => <Badge>{overdue(r) ? "Overdue" : r.status}</Badge>, export: (r) => (overdue(r) ? "Overdue" : r.status) },
  ];
  const fields = [
    { key: "studentId", label: "Student", type: "select", required: true, options: db.students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentCode})` })), display: (r) => students.get(r.studentId)?.name },
    { key: "courseId", label: "Course", type: "select", required: true, options: db.courses.map((c) => ({ value: c.id, label: `${c.name} - ${money(c.fee)}` })), display: (r) => courses.get(r.courseId)?.name },
    { key: "total", label: "Total fee (INR) - blank = course fee", type: "number" }, { key: "dueDate", label: "Due date", type: "date" },
  ];
  const stats = (rows) => [
    { label: "Total billed", value: money(sum(rows, (r) => r.total)), icon: IndianRupee, tone: "blue" }, { label: "Collected", value: money(sum(rows, (r) => r.paid)), icon: Wallet, tone: "green" },
    { label: "Outstanding", value: money(sum(rows, bal)), icon: Hourglass, tone: "yellow" }, { label: "Overdue accounts", value: rows.filter(overdue).length, icon: AlertTriangle, tone: "red", hint: "Past due date" },
  ];
  const save = async (e) => { e.preventDefault(); setBusy(true); try { await api.post(`/fees/${pay.id}/pay/`, p); await refresh("fees"); toast("Payment recorded"); setPay(null); } catch (x) { toast(errMsg(x), "error"); } finally { setBusy(false); } };
  return (
    <>
      <EntityPage title="Fees & payments" subtitle="Course fees per student - record instalments as they are paid" singular="Fee record" collection="fees" columns={columns} fields={fields} stats={stats}
        filters={[{ key: "status", label: "Status", options: ["Paid", "Partial", "Pending"] }]} defaults={{ dueDate: today }}
        prepare={(v) => ({ ...v, total: v.total === "" || v.total == null ? courses.get(v.courseId)?.fee || 0 : Number(v.total) })}
        rowActions={(r) => (bal(r) > 0 && can(user, "fees", "edit") ? [{ icon: Banknote, title: "Record payment", cls: "text-emerald-600", onClick: (x) => { setPay(x); setP({ amount: bal(x), mode: "UPI" }); } }] : [])} />
      {pay && (
        <Modal size="sm" title="Record payment" onClose={() => setPay(null)} footer={<><button className="btn btn-ghost" onClick={() => setPay(null)}>Cancel</button><button form="pay" disabled={busy} className="btn btn-primary">{busy ? "Saving..." : "Save payment"}</button></>}>
          <p className="mb-3 text-sm text-slate-600">{students.get(pay.studentId)?.name} - balance <b>{money(bal(pay))}</b></p>
          <form id="pay" onSubmit={save}><FormFields fields={[{ key: "amount", label: "Amount (INR)", type: "number", required: true }, { key: "mode", label: "Mode", type: "select", options: PAY_MODES }]} values={p} onChange={(k, v) => setP((s) => ({ ...s, [k]: v }))} /></form>
        </Modal>
      )}
    </>
  );
}
