import { useEffect, useRef, useState } from "react";
import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useToast } from "../../context/ToastContext";
// Table export:     <ExportMenu columns rows filename title />
// Dashboard export: <ExportMenu sections filename title />   (sections: [{title, columns, rows}])
export default function ExportMenu({ columns, rows, sections, filename = "export", title = "Report", subtitle, label = "Download" }) {
  const [open, setOpen] = useState(false); const ref = useRef(null); const toast = useToast();
  useEffect(() => { const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false); document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }, []);
  const run = async (kind) => {
    setOpen(false);
    try {
      const x = await import("../../services/exporters");
      const stamp = `${filename}-${new Date().toISOString().slice(0, 10)}`;
      if (sections) kind === "pdf" ? x.exportSectionsPDF({ filename: stamp, title, subtitle, sections }) : x.exportSectionsExcel({ filename: stamp, sections });
      else kind === "pdf" ? x.exportPDF({ filename: stamp, title, columns, rows, subtitle }) : x.exportExcel({ filename: stamp, title, columns, rows });
      toast(`${kind === "pdf" ? "PDF" : "Excel"} downloaded`);
    } catch (e) { console.error(e); toast("Export failed", "error"); }
  };
  return (
    <div className="relative no-print" ref={ref}>
      <button className="btn btn-primary" onClick={() => setOpen(!open)}><Download size={16} />{label}<ChevronDown size={14} /></button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border bg-white shadow-xl">
          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => run("pdf")}><FileText size={16} className="text-red-500" />Download PDF</button>
          <button className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50" onClick={() => run("xlsx")}><FileSpreadsheet size={16} className="text-emerald-600" />Download Excel</button>
        </div>
      )}
    </div>
  );
}
