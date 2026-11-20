import PageHeader from "../../components/common/PageHeader";
import { BRAND } from "../../config/brand";
import { useAuth } from "../../context/AuthContext";
import { useRemote } from "../../hooks/useDb";
import { API } from "../../services/api";
const Row = ({ k, v }) => <div className="flex justify-between gap-4 border-b py-3 text-sm last:border-0"><span className="text-slate-500">{k}</span><b className="text-right break-all">{v}</b></div>;
export default function Settings() {
  const { user } = useAuth(); const st = useRemote("/system/status/"); const s = Array.isArray(st.data) ? {} : st.data;
  return (
    <div className="space-y-5 w-full">
      <PageHeader title="Settings" subtitle="Company, your account and system information" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5"><h3 className="mb-2 font-bold">Company</h3><Row k="Name" v={BRAND.name} /><Row k="Product" v={BRAND.product} /><Row k="Logo file" v="public/logo.svg" /><Row k="Company name setting" v="frontend/.env  ->  VITE_COMPANY_NAME" /></div>
        <div className="card p-5"><h3 className="mb-2 font-bold">Signed in</h3><Row k="Name" v={user?.name} /><Row k="Username" v={user?.username} /><Row k="User level" v={user?.role} /></div>
        <div className="card p-5 lg:col-span-2"><h3 className="mb-2 font-bold">System</h3><Row k="API" v={API} /><Row k="Database engine" v={s.database || "..."} /></div>
      </div>
    </div>
  );
}
