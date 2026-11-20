export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0"><h1 className="text-2xl font-extrabold text-slate-900">{title}</h1>{subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}</div>
      {children && <div className="flex flex-wrap items-center gap-2 no-print">{children}</div>}
    </div>
  );
}
