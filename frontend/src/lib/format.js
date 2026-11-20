const z = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const fmtDate = (s) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-");
export const money = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
export const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`; // PDF-safe
export const sum = (arr, f = (x) => x) => arr.reduce((a, b) => a + (Number(f(b)) || 0), 0);
export const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
