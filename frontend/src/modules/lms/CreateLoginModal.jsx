import { useState } from "react";
import Modal from "../../components/common/Modal";
import FormFields from "../../components/common/FormFields";
import { useDb } from "../../hooks/useDb";
import api, { errMsg } from "../../services/api";
import { loadAll } from "../../services/store";
import { useToast } from "../../context/ToastContext";

// Gives a Student or Instructor their own login (student portal / trainer portal).
export default function CreateLoginModal({ kind, record, onClose }) {
  const db = useDb(); const toast = useToast(); const role = db.roles.find((r) => r.kind === kind);
  const [v, setV] = useState({ username: String(record.studentCode || record.staffCode || record.name).toLowerCase().replace(/[^a-z0-9]/g, ""), password: "" }); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); if (!role) return toast("The built-in level is missing - run migrate on the backend.", "error"); setBusy(true);
    try { await api.post("/users/", { username: v.username, name: record.name, email: record.email || "", password: v.password, roleId: role.id, linkedId: record.id, isActive: true }); await loadAll(); toast(`Login created for ${record.name}`); onClose(); }
    catch (x) { toast(errMsg(x), "error"); } finally { setBusy(false); }
  };
  return (
    <Modal size="sm" title={`Create ${kind === "student" ? "student" : "trainer"} login`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button form="mk-login" disabled={busy} className="btn btn-primary">{busy ? "Creating..." : "Create login"}</button></>}>
      <p className="mb-3 rounded-xl bg-brand-soft p-3 text-sm text-slate-700"><b>{record.name}</b> will sign in with this username and password and will only see {kind === "student" ? "their own classes, attendance, assignments, results, fees and certificates" : "their own batches, students, attendance, assignments and results"}.</p>
      <form id="mk-login" onSubmit={submit}><FormFields fields={[{ key: "username", label: "Username", required: true, full: true }, { key: "password", label: "Password (min 6)", type: "password", required: true, full: true }]} values={v} onChange={(k, x) => setV((s) => ({ ...s, [k]: x }))} /></form>
    </Modal>
  );
}
