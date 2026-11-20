import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
export default function Pagination({ page, pages, total, size, sizes, onPage, onSize }) {
  const from = total ? (page - 1) * size + 1 : 0; const to = Math.min(total, page * size);
  const win = []; for (let i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) win.push(i); else if (win[win.length - 1] !== "...") win.push("...");
  const B = ({ children, ...p }) => <button {...p} className="icon-btn border border-slate-200 disabled:opacity-40 disabled:hover:bg-transparent">{children}</button>;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm text-slate-600 no-print">
      <div className="flex items-center gap-3">
        <span>Showing <b>{from}-{to}</b> of <b>{total}</b></span>
        <select className="input !h-8 !w-auto !py-0 text-xs" value={size} onChange={(e) => onSize(Number(e.target.value))}>{sizes.map((s) => <option key={s} value={s}>{s} / page</option>)}</select>
      </div>
      <div className="flex items-center gap-1">
        <B disabled={page <= 1} onClick={() => onPage(1)}><ChevronsLeft size={16} /></B>
        <B disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft size={16} /></B>
        {win.map((p, i) => p === "..." ? <span key={`dots${i}`} className="px-1">...</span> : <button key={p} onClick={() => onPage(p)} className={`h-8 min-w-8 rounded-lg px-2 text-xs font-bold ${p === page ? "bg-brand text-white" : "hover:bg-slate-100"}`}>{p}</button>)}
        <B disabled={page >= pages} onClick={() => onPage(page + 1)}><ChevronRight size={16} /></B>
        <B disabled={page >= pages} onClick={() => onPage(pages)}><ChevronsRight size={16} /></B>
      </div>
    </div>
  );
}
