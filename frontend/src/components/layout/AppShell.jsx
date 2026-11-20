import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { loadAll } from "../../services/store";
import { useStatus } from "../../hooks/useDb";
export default function AppShell() {
  const [open, setOpen] = useState(false); const { pathname } = useLocation(); const { loaded, error } = useStatus();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { loadAll(); }, []);
  return (
    <div className="flex h-full">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setOpen(true)} />
        <main key={pathname} className="page flex-1 overflow-y-auto p-4 sm:p-6">
          {loaded ? <Outlet /> : error ? (
            <div className="card mx-auto mt-16 max-w-md p-8 text-center"><p className="mb-4 font-semibold text-slate-800">{error}</p><button className="btn btn-primary" onClick={loadAll}><RefreshCw size={16} />Retry</button></div>
          ) : <p className="p-10 text-center text-slate-500">Loading data...</p>}
        </main>
      </div>
    </div>
  );
}
