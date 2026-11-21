import PermissionMatrix from "./PermissionMatrix";
// field: { key, label, type: text|email|tel|number|date|select|textarea, options, required, full, placeholder }
export default function FormFields({ fields, values, onChange, errors = {} }) {
  const opt = (o) => (typeof o === "object" ? o : { value: o, label: o });
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {fields.filter((f) => !f.showIf || f.showIf(values)).map((f) => (
        <div key={f.key} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
          <label className="label">{f.label}{f.required && <span className="text-red-500"> *</span>}</label>
          {f.type === "matrix" ? <PermissionMatrix screens={f.options} value={values[f.key] || {}} onChange={(v) => onChange(f.key, v)} />
          : f.type === "checks" ? (
            <div className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
              {f.options.map((o) => { const arr = values[f.key] || []; const on = arr.includes(o.value); return (
                <label key={o.value} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-[#FF5A44]" checked={on} onChange={() => onChange(f.key, on ? arr.filter((x) => x !== o.value) : [...arr, o.value])} />{o.label}</label>); })}
            </div>
          ) : f.type === "select" ? (
            <select className="input" value={values[f.key] ?? ""} onChange={(e) => { const m = f.options.map(opt).find((o) => String(o.value) === e.target.value); onChange(f.key, m ? m.value : ""); }}>
              <option value="">Select...</option>
              {f.options.map(opt).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : f.type === "textarea" ? (
            <textarea rows={3} className="input" value={values[f.key] ?? ""} placeholder={f.placeholder} onChange={(e) => onChange(f.key, e.target.value)} />
          ) : (
            <input className="input" type={f.type || "text"} value={values[f.key] ?? ""} placeholder={f.placeholder} min={f.type === "number" ? 0 : undefined}
              onChange={(e) => onChange(f.key, f.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)} />
          )}
          {errors[f.key] && <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>}
        </div>
      ))}
    </div>
  );
}
