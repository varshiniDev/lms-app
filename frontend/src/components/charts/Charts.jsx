import { ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { COLORS } from "../../config/constants";
export function ChartCard({ title, subtitle, children, className = "", height = 260 }) {
  return (
    <div className={`card p-4 sm:p-5 min-w-0 ${className}`}>
      <h3 className="font-bold text-slate-900">{title}</h3>{subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      <div className="mt-3 w-full" style={{ height }}>{children}</div>
    </div>
  );
}
const axis = { tick: { fontSize: 11, fill: "#64748b" }, axisLine: false, tickLine: false };
export function Bars({ data, series, xKey = "name", stacked, horizontal }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: horizontal ? 20 : -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} horizontal={!horizontal} />
        {horizontal ? <><XAxis type="number" {...axis} allowDecimals={false} /><YAxis type="category" dataKey={xKey} width={90} {...axis} /></> : <><XAxis dataKey={xKey} {...axis} /><YAxis {...axis} allowDecimals={false} /></>}
        <Tooltip cursor={{ fill: "#f1f5f9" }} />{series.length > 1 && <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />}
        {series.map((s, i) => <Bar key={s.key} dataKey={s.key} name={s.name || s.key} stackId={stacked ? "a" : undefined} fill={s.color || COLORS[i]} radius={stacked ? 0 : [6, 6, 0, 0]} maxBarSize={36} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}
export function Lines({ data, series, xKey = "name" }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ left: -20, right: 8 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey={xKey} {...axis} /><YAxis {...axis} allowDecimals={false} />
        <Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
        {series.map((s, i) => <Line key={s.key} type="monotone" dataKey={s.key} name={s.name || s.key} stroke={s.color || COLORS[i]} strokeWidth={3} dot={{ r: 3 }} />)}
      </LineChart>
    </ResponsiveContainer>
  );
}
export function Donut({ data, center }) {
  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="90%" paddingAngle={2} stroke="none">{data.map((d, i) => <Cell key={i} fill={d.color || COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} /></PieChart>
      </ResponsiveContainer>
      {center && <div className="pointer-events-none absolute inset-0 -mt-4 grid place-items-center text-center"><div><div className="text-3xl font-extrabold text-slate-900">{center.value}</div><div className="text-xs text-slate-500">{center.label}</div></div></div>}
    </div>
  );
}
