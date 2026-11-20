const TONE = { green: "bg-[#E3EEE8] border-[#cfe0d6] text-emerald-700", blue: "bg-[#E4ECF7] border-[#cfdcf0] text-sky-700", red: "bg-[#FBE6E3] border-[#f3cfca] text-red-600", yellow: "bg-[#FBF3D5] border-[#efe3b4] text-amber-600", purple: "bg-[#EEE7F8] border-[#ddd0f0] text-purple-600", orange: "bg-[#FDEBDD] border-[#f6d6bb] text-orange-600" };
export default function StatCard({ label, value, icon: Icon, tone = "blue", hint }) {
  return (
    <div className={`rounded-2xl border p-4 min-w-0 ${TONE[tone].split(" ").slice(0, 2).join(" ")}`}>
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white ${TONE[tone].split(" ")[2]}`}>{Icon && <Icon size={20} />}</span>
        <div className="min-w-0"><div className="text-2xl font-extrabold text-slate-900 leading-none truncate">{value}</div><div className="mt-1 text-sm font-semibold text-slate-700 truncate">{label}</div></div>
      </div>
      {hint && <div className="mt-3 border-t border-black/5 pt-2 text-xs text-slate-500 truncate">{hint}</div>}
    </div>
  );
}
