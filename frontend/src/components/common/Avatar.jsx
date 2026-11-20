import { COLORS } from "../../config/constants";
export default function Avatar({ name = "?", size = 34 }) {
  const c = COLORS[[...name].reduce((a, ch) => a + ch.charCodeAt(0), 0) % COLORS.length];
  return <span style={{ width: size, height: size, background: `${c}22`, color: c, fontSize: size * 0.4 }} className="inline-grid shrink-0 place-items-center rounded-full font-bold">{name.trim()[0]?.toUpperCase()}</span>;
}
export function PersonCell({ name, sub }) {
  return <div className="flex items-center gap-3 min-w-0"><Avatar name={name} /><div className="min-w-0"><div className="font-semibold text-slate-900 truncate">{name}</div>{sub && <div className="text-xs text-slate-500 truncate">{sub}</div>}</div></div>;
}
