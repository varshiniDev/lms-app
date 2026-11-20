import { useState } from "react";
import { useDb } from "../../hooks/useDb";
import PageHeader from "./PageHeader";
import DataTable from "./DataTable";
import { ChartCard, Bars, Donut } from "../charts/Charts";
// reports: [{ id, title, description, icon, build(db) -> { columns, rows, chart?: { type:'bar'|'donut', xKey, series } } }]
export default function ReportsPage({ title, subtitle, reports, filename }) {
  const db = useDb(); const [id, setId] = useState(reports[0].id);
  const rep = reports.find((r) => r.id === id); const out = rep.build(db);
  return (
    <div className="space-y-5 w-full">
      <PageHeader title={title} subtitle={subtitle} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 no-print">
        {reports.map((r) => (
          <button key={r.id} onClick={() => setId(r.id)} className={`card flex items-start gap-3 p-4 text-left transition hover:border-brand/50 ${r.id === id ? "!border-brand ring-2 ring-brand/20" : ""}`}>
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${r.id === id ? "bg-brand text-white" : "bg-brand-soft text-brand"}`}><r.icon size={18} /></span>
            <span className="min-w-0"><span className="block font-bold text-slate-900">{r.title}</span><span className="block text-xs text-slate-500">{r.description}</span></span>
          </button>
        ))}
      </div>
      {out.chart && (
        <ChartCard title={rep.title} subtitle="Visual summary">
          {out.chart.type === "donut" ? <Donut data={out.chart.data} /> : <Bars data={out.rows} xKey={out.chart.xKey} series={out.chart.series} />}
        </ChartCard>
      )}
      <DataTable key={rep.id} columns={out.columns} rows={out.rows.map((r, i) => ({ id: i, ...r }))} exportName={`${filename}-${rep.id}`} exportTitle={rep.title} maxH="calc(100vh - 300px)" />
    </div>
  );
}
