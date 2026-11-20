import { useMemo, useState } from "react";
import { Search, ArrowUp, ArrowDown, Inbox } from "lucide-react";
import Pagination from "./Pagination";
import ExportMenu from "./ExportMenu";

// columns: [{ key, label, render(row), export(row), sort(row), align, hide: "sm"|"md"|"lg", exportOnly, noExport }]
// - scrolls inside its own box (sticky header) so long data never stretches the page
// - search / sort / pagination / PDF + Excel export (exports ALL filtered rows, not just the current page)
export default function DataTable({ columns, rows, actions, toolbar, exportName = "data", exportTitle = "Report", searchPlaceholder = "Search...", sizes = [10, 25, 50, 100], initialSize = 10, noExport, emptyText = "No records found", maxH = "calc(100vh - 360px)" }) {
  const [q, setQ] = useState(""); const [sort, setSort] = useState({ key: null, dir: 1 }); const [page, setPage] = useState(1); const [size, setSize] = useState(initialSize);
  const text = (c, r) => String(c.export ? c.export(r) : r[c.key] ?? "");
  const visible = columns.filter((c) => !c.exportOnly);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let out = s ? rows.filter((r) => columns.some((c) => text(c, r).toLowerCase().includes(s))) : rows;
    if (sort.key) { const c = columns.find((x) => x.key === sort.key); const v = (r) => (c.sort ? c.sort(r) : c.export ? c.export(r) : r[c.key]); out = [...out].sort((a, b) => { const x = v(a), y = v(b); return (typeof x === "number" && typeof y === "number" ? x - y : String(x ?? "").localeCompare(String(y ?? ""))) * sort.dir; }); }
    return out;
  }, [rows, q, sort, columns]);
  const pages = Math.max(1, Math.ceil(filtered.length / size)); const cur = Math.min(page, pages);
  const slice = filtered.slice((cur - 1) * size, cur * size);
  const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell" };
  const toggle = (c) => c.key && c.sortable !== false && setSort((s) => (s.key === c.key ? { key: c.key, dir: -s.dir } : { key: c.key, dir: 1 }));
  return (
    <div className="card overflow-hidden w-full">
      <div className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative w-full sm:w-72"><Search size={16} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input className="input !pl-9" placeholder={searchPlaceholder} value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} /></div>
        {toolbar}
        {!noExport && <div className="ml-auto"><ExportMenu columns={columns} rows={filtered} filename={exportName} title={exportTitle} /></div>}
      </div>
      <div className="overflow-auto border-t" style={{ maxHeight: maxH, minHeight: 160 }}>
        <table className="w-full min-w-max border-collapse">
          <thead><tr>
            {visible.map((c, i) => (
              <th key={i} className={`th ${c.hide ? hide[c.hide] : ""}`} style={{ textAlign: c.align || "left" }} onClick={() => toggle(c)}>
                <span className={`inline-flex items-center gap-1 ${c.key && c.sortable !== false ? "cursor-pointer select-none" : ""}`}>{c.label}{sort.key === c.key && (sort.dir === 1 ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}</span>
              </th>
            ))}
            {actions && <th className="th text-center no-print">Actions</th>}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {slice.map((r, ri) => (
              <tr key={r.id ?? ri} className="hover:bg-slate-50/70">
                {visible.map((c, i) => <td key={i} className={`td ${c.hide ? hide[c.hide] : ""}`} style={{ textAlign: c.align || "left" }}>{c.render ? c.render(r) : r[c.key] ?? "-"}</td>)}
                {actions && <td className="td no-print"><div className="flex items-center justify-center gap-1">{actions(r)}</div></td>}
              </tr>
            ))}
            {!slice.length && <tr><td colSpan={visible.length + 1} className="py-14 text-center text-slate-400"><Inbox className="mx-auto mb-2" />{emptyText}</td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination page={cur} pages={pages} total={filtered.length} size={size} sizes={sizes} onPage={setPage} onSize={(s) => { setSize(s); setPage(1); }} />
    </div>
  );
}
