import { useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import Modal from "./Modal";
import { insert, loadAll } from "../../services/store";
import { errMsg } from "../../services/api";
import { useToast } from "../../context/ToastContext";

// Import rows from an Excel/CSV file. Column headers must match the field labels (or keys) of the form.
export default function ImportModal({ title, fields, defaults = {}, collection, onClose }) {
  const toast = useToast(); const [rows, setRows] = useState([]); const [busy, setBusy] = useState(false); const [errs, setErrs] = useState([]);
  const cols = fields.filter((f) => !["select", "checks", "matrix", "textarea"].includes(f.type) || f.importable);
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
  const read = async (file) => {
    const XLSX = await import("xlsx"); const wb = XLSX.read(await file.arrayBuffer(), { cellDates: false });
    const raw = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "", raw: false });
    setRows(raw.map((r) => { const o = {}; Object.entries(r).forEach(([h, v]) => { const f = cols.find((c) => norm(c.label) === norm(h) || norm(c.key) === norm(h)); if (f && v !== "") o[f.key] = f.type === "number" ? Number(String(v).replace(/[^0-9.]/g, "")) : String(v).trim(); }); return o; }).filter((o) => Object.keys(o).length));
  };
  const template = async () => { const XLSX = await import("xlsx"); const ws = XLSX.utils.aoa_to_sheet([cols.map((c) => c.label)]); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Import"); XLSX.writeFile(wb, `${collection}-import-template.xlsx`); };
  const run = async () => {
    setBusy(true); const bad = []; let ok = 0;
    for (const [i, r] of rows.slice(0, 500).entries()) { try { await insert(collection, { ...defaults, ...r }); ok++; } catch (e) { bad.push(`Row ${i + 2}: ${errMsg(e)}`); } }
    await loadAll(); setBusy(false); setErrs(bad); toast(`${ok} imported${bad.length ? `, ${bad.length} failed` : ""}`, bad.length && !ok ? "error" : "success"); if (!bad.length) onClose();
  };
  return (
    <Modal title={`Import ${title}`} onClose={onClose} footer={<><button className="btn btn-ghost" onClick={onClose}>Close</button><button className="btn btn-primary" disabled={!rows.length || busy} onClick={run}><Upload size={16} />{busy ? "Importing..." : `Import ${rows.length} rows`}</button></>}>
      <p className="mb-3 text-sm text-slate-600">Upload an Excel or CSV file. First row = column names: <b>{cols.map((c) => c.label).join(", ")}</b>. Max 500 rows.</p>
      <div className="flex flex-wrap items-center gap-3"><input type="file" accept=".xlsx,.xls,.csv" className="text-sm" onChange={(e) => e.target.files[0] && read(e.target.files[0])} /><button className="btn btn-ghost !h-8 text-xs" onClick={template}><FileSpreadsheet size={14} />Download template</button></div>
      {rows.length > 0 && <p className="mt-3 text-sm text-emerald-700">{rows.length} rows ready to import.</p>}
      {errs.length > 0 && <ul className="mt-3 max-h-40 overflow-auto rounded-xl bg-red-50 p-3 text-xs text-red-700">{errs.map((e, i) => <li key={i}>{e}</li>)}</ul>}
    </Modal>
  );
}
