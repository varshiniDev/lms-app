import { useState } from "react";
import PageHeader from "../../components/common/PageHeader";
import FormFields from "../../components/common/FormFields";
import api, { errMsg } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { BRAND } from "../../config/brand";
import { useAuth } from "../../context/AuthContext";
import { useRemote } from "../../hooks/useDb";
import { API } from "../../services/api";
const Row = ({ k, v }) => <div className="flex justify-between gap-4 border-b py-3 text-sm last:border-0"><span className="text-slate-500">{k}</span><b className="text-right break-all">{v}</b></div>;
function ChangePassword() {
  const toast = useToast(); const [v, setV] = useState({ oldPassword: "", newPassword: "", confirm: "" }); const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault(); if (v.newPassword !== v.confirm) return toast("New passwords do not match", "error"); setBusy(true);
    try { await api.post("/auth/change-password/", { oldPassword: v.oldPassword, newPassword: v.newPassword }); toast("Password changed"); setV({ oldPassword: "", newPassword: "", confirm: "" }); } catch (x) { toast(errMsg(x), "error"); } finally { setBusy(false); }
  };
  return (
    <div className="card p-5 lg:col-span-2"><h3 className="mb-3 font-bold">Change my password</h3>
      <form onSubmit={save} className="max-w-xl space-y-4"><FormFields fields={[{ key: "oldPassword", label: "Current password", type: "password", required: true, full: true }, { key: "newPassword", label: "New password (min 6)", type: "password", required: true }, { key: "confirm", label: "Confirm new password", type: "password", required: true }]} values={v} onChange={(k, x) => setV((s) => ({ ...s, [k]: x }))} /><button disabled={busy} className="btn btn-primary">{busy ? "Saving..." : "Update password"}</button></form>
    </div>
  );
}

export default function Settings() {
  const { user } = useAuth(); const st = useRemote("/system/status/"); const s = Array.isArray(st.data) ? {} : st.data;
  return (
    <div className="space-y-5 w-full">
      <PageHeader title="Settings" subtitle="Company, your account and system information" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5"><h3 className="mb-2 font-bold">Company</h3><Row k="Name" v={BRAND.name} /><Row k="Product" v={BRAND.product} /><Row k="Logo file" v="public/logo.svg" /><Row k="Company name setting" v="frontend/.env  ->  VITE_COMPANY_NAME" /></div>
        <div className="card p-5"><h3 className="mb-2 font-bold">Signed in</h3><Row k="Name" v={user?.name} /><Row k="Username" v={user?.username} /><Row k="User level" v={user?.role} /></div>
        <ChangePassword />
        <div className="card p-5 lg:col-span-2"><h3 className="mb-2 font-bold">System</h3><Row k="API" v={API} /><Row k="Database engine" v={s.database || "..."} /></div>
      </div>
    </div>
  );
}
