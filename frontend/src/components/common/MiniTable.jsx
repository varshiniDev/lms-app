import { Link } from "react-router-dom";
// compact table for dashboard widgets
export default function MiniTable({ title, columns, rows, more, empty = "Nothing to show" }) {
  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2"><h3 className="font-bold text-slate-900">{title}</h3>{more && <Link to={more} className="text-xs font-semibold text-brand hover:underline no-print">View all</Link>}</div>
      <div className="overflow-auto max-h-72">
        <table className="w-full min-w-max"><thead><tr>{columns.map((c, i) => <th key={i} className="th">{c.label}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">{rows.map((r, i) => <tr key={r.id ?? i}>{columns.map((c, j) => <td key={j} className="td">{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}
            {!rows.length && <tr><td colSpan={columns.length} className="py-8 text-center text-sm text-slate-400">{empty}</td></tr>}</tbody></table>
      </div>
    </div>
  );
}
