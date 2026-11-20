import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Logo from "../../components/common/Logo";
import { BRAND } from "../../config/brand";
import { useAuth } from "../../context/AuthContext";
import { errMsg } from "../../services/api";
export default function LoginPage() {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ username: "", password: "" }); const [show, setShow] = useState(false); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await login(f.username, f.password); nav("/"); } catch (x) { setErr(x.response?.status === 401 ? "Wrong username or password." : errMsg(x)); } finally { setBusy(false); }
  };
  return (
    <div className="grid min-h-full lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-10 lg:flex">
        <Logo height={64} className="self-start" />
        <div className="relative z-10 max-w-md">
          <span className="mb-4 inline-block rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">{BRAND.product}</span>
          <h1 className="text-4xl font-extrabold leading-tight text-white">{BRAND.tagline}</h1>
          <p className="mt-4 text-slate-300">{BRAND.sub}</p>
        </div>
        <p className="relative z-10 text-sm text-slate-400">&copy; {BRAND.year} {BRAND.name}</p>
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-brand/90" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand-orange/80 mix-blend-screen" />
      </div>
      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <Logo className="mb-8 border lg:hidden" height={52} />
        <form onSubmit={submit} className="w-full max-w-sm space-y-4">
          <div><h2 className="text-3xl font-extrabold text-slate-900">Sign in</h2><p className="text-sm text-slate-500">Enter your credentials to open the {BRAND.product} dashboard.</p></div>
          {err && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
          <div><label className="label">Username</label><input autoFocus className="input !h-11" value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
          <div><label className="label">Password</label>
            <div className="relative"><input className="input !h-11 !pr-10" type={show ? "text" : "password"} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
              <button type="button" className="absolute right-2 top-2 text-slate-400" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
          <button disabled={busy} className="btn btn-primary w-full !h-11">{busy ? "Signing in..." : "Sign in"}</button>
        </form>
      </div>
    </div>
  );
}
