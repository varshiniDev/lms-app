// PDF + Excel generation. Loaded lazily (dynamic import) so the first page load stays fast.
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { BRAND } from "../config/brand";

const cols = (columns) => columns.filter((c) => !c.noExport);
const val = (c, r) => { const v = c.export ? c.export(r) : r[c.key]; return v == null ? "" : v; };
const safe = (s) => String(s).replace(/[\\/:*?[\]]/g, " ").slice(0, 31) || "Sheet";

function header(doc, title, subtitle) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(255, 90, 68); doc.rect(0, 0, w, 8, "F");
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(32, 32, 32); doc.text(BRAND.name, 14, 19);
  doc.setFontSize(11); doc.text(title, 14, 26);
  doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(110, 110, 110);
  doc.text(`Generated ${new Date().toLocaleString("en-IN")}${subtitle ? `  |  ${subtitle}` : ""}`, 14, 31);
}
function footers(doc) {
  const n = doc.internal.getNumberOfPages(); const w = doc.internal.pageSize.getWidth(); const h = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= n; i++) { doc.setPage(i); doc.setFontSize(8); doc.setTextColor(130); doc.text(`${BRAND.name}  |  Page ${i} of ${n}`, w - 14, h - 8, { align: "right" }); }
}
const tableOpts = (head, body) => ({ head: [head], body, styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" }, headStyles: { fillColor: [32, 32, 32], textColor: 255 }, alternateRowStyles: { fillColor: [252, 247, 246] }, margin: { left: 14, right: 14 } });

export function exportPDF({ filename, title, columns, rows, subtitle }) {
  const c = cols(columns);
  const doc = new jsPDF({ orientation: c.length > 6 ? "landscape" : "portrait", unit: "mm", format: "a4" });
  header(doc, title, subtitle || `${rows.length} records`);
  autoTable(doc, { ...tableOpts(c.map((x) => x.label), rows.map((r) => c.map((x) => String(val(x, r))))), startY: 36 });
  footers(doc); doc.save(`${filename}.pdf`);
}
export function exportExcel({ filename, title, columns, rows }) {
  const c = cols(columns);
  const data = rows.map((r) => Object.fromEntries(c.map((x) => [x.label, val(x, r)])));
  const ws = XLSX.utils.json_to_sheet(data.length ? data : [Object.fromEntries(c.map((x) => [x.label, ""]))]);
  ws["!cols"] = c.map((x) => ({ wch: Math.max(x.label.length + 2, ...rows.slice(0, 200).map((r) => String(val(x, r)).length + 2), 10) }));
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, safe(title)); XLSX.writeFile(wb, `${filename}.xlsx`);
}
// sections: [{ title, columns, rows }]  -> multi-table PDF / multi-sheet workbook (dashboards)
export function exportSectionsPDF({ filename, title, subtitle, sections }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  header(doc, title, subtitle); let y = 38;
  sections.forEach((s) => {
    const c = cols(s.columns);
    if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 20; }
    doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(32); doc.text(s.title, 14, y);
    autoTable(doc, { ...tableOpts(c.map((x) => x.label), s.rows.map((r) => c.map((x) => String(val(x, r))))), startY: y + 3 });
    y = doc.lastAutoTable.finalY + 10;
  });
  footers(doc); doc.save(`${filename}.pdf`);
}
export function exportSectionsExcel({ filename, sections }) {
  const wb = XLSX.utils.book_new();
  sections.forEach((s) => {
    const c = cols(s.columns);
    const ws = XLSX.utils.json_to_sheet(s.rows.map((r) => Object.fromEntries(c.map((x) => [x.label, val(x, r)]))));
    ws["!cols"] = c.map((x) => ({ wch: Math.max(x.label.length + 2, 14) }));
    XLSX.utils.book_append_sheet(wb, ws, safe(s.title));
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
export function downloadText(filename, text, mime = "application/json") {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type: mime })); a.download = filename; a.click(); URL.revokeObjectURL(a.href);
}
