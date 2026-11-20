import { TONES } from "../../config/constants";
const CLS = {
  green: "bg-emerald-100 text-emerald-700", blue: "bg-sky-100 text-sky-700", amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700", gray: "bg-slate-100 text-slate-600", indigo: "bg-indigo-100 text-indigo-700",
  purple: "bg-purple-100 text-purple-700", orange: "bg-orange-100 text-orange-700",
};
export default function Badge({ children, tone }) {
  const t = tone || TONES[children] || "gray";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${CLS[t]}`}>{children}</span>;
}
