import { NavLink } from "react-router-dom";
import { LogOut } from "lucide-react";
import Logo from "../common/Logo";
import { BRAND } from "../../config/brand";
import { visibleNav } from "../../lib/access";
import { useAuth } from "../../context/AuthContext";
export default function Sidebar({ open, onClose }) {
  const { logout, user } = useAuth();
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-ink p-4 transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <Logo className="w-full" height={42} /><div className="mt-3 rounded-lg bg-white/10 px-3 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-brand">{user?.kind === "student" ? "Student portal" : user?.kind === "trainer" ? "Trainer portal" : BRAND.product}</div>
        <nav className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
          {visibleNav(user).map((g) => (
            <div key={g.group}>
              <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">{g.group}</div>
              <div className="space-y-0.5">{g.items.map((i) => <NavLink key={i.to} to={i.to} end={i.end} onClick={onClose} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><i.icon size={18} />{i.label}</NavLink>)}</div>
            </div>
          ))}
        </nav>
        <button className="nav-link mt-3 border-t border-white/10 pt-3" onClick={logout}><LogOut size={18} />Log out</button>
      </aside>
    </>
  );
}
