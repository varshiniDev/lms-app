import { useEffect } from "react";
import { X } from "lucide-react";
export default function Modal({ title, onClose, children, footer, size = "md" }) {
  useEffect(() => { const h = (e) => e.key === "Escape" && onClose(); window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, [onClose]);
  const w = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" }[size];
  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card w-full ${w} max-h-[92vh] flex flex-col rounded-b-none sm:rounded-b-2xl page`}>
        <div className="flex items-center justify-between border-b px-5 py-4"><h2 className="text-lg font-bold">{title}</h2><button className="icon-btn" onClick={onClose}><X size={18} /></button></div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t bg-slate-50 px-5 py-3 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
