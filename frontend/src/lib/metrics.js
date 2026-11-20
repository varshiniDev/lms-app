import { toISO, pct } from "./format";
export const attStats = (att) => {
  const present = att.filter((a) => a.status === "Present").length;
  const late = att.filter((a) => a.status === "Late").length;
  const absent = att.filter((a) => a.status === "Absent").length;
  const total = present + late + absent;
  return { present, late, absent, total, pct: pct(present + late, total) };
};
export const studentAtt = (att, id) => attStats(att.filter((a) => a.studentId === id));
export const grade = (p) => (p >= 90 ? "A+" : p >= 80 ? "A" : p >= 70 ? "B+" : p >= 60 ? "B" : p >= 50 ? "C" : "F");
export const feeStatus = (total, paid) => (paid >= total ? "Paid" : paid > 0 ? "Partial" : "Pending");
export const nextCode = (rows, field, prefix, pad = 4) => {
  const max = rows.reduce((m, r) => Math.max(m, parseInt(String(r[field] || "").replace(/\D/g, ""), 10) || 0), 0);
  return `${prefix}${String(max + 1).padStart(pad, "0")}`;
};
export const lastWorkingDays = (n, upto = new Date()) => {
  const out = []; const d = new Date(upto);
  while (out.length < n) { if (d.getDay() !== 0 && d.getDay() !== 6) out.unshift(toISO(d)); d.setDate(d.getDate() - 1); }
  return out;
};
export const lastMonths = (n) => {
  const out = []; const d = new Date(); d.setDate(1);
  for (let i = n - 1; i >= 0; i--) { const m = new Date(d.getFullYear(), d.getMonth() - i, 1); out.push({ key: toISO(m).slice(0, 7), label: m.toLocaleDateString("en-GB", { month: "short" }) }); }
  return out;
};
