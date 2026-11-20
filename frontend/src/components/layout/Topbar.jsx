import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../common/Avatar";
export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const date = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
  return (
    <header className="app-top sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur sm:px-6">
      <button className="icon-btn lg:hidden" onClick={onMenu}><Menu size={20} /></button>
      <div className="min-w-0"><div className="truncate font-bold text-slate-900">Welcome, {user?.name}</div><div className="text-xs text-slate-500">{date}</div></div>
      <div className="ml-auto flex items-center gap-3">
        <Avatar name={user?.name} size={36} />
        <div className="hidden text-sm leading-tight sm:block"><div className="font-semibold">{user?.username}</div><div className="text-xs text-slate-500">{user?.role}</div></div>
        <button title="Log out" className="icon-btn text-slate-500" onClick={logout}><LogOut size={18} /></button>
      </div>
    </header>
  );
}
