import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);
export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const toast = useCallback((message, type = "success") => {
    const id = Math.random(); setItems((s) => [...s, { id, message, type }]);
    setTimeout(() => setItems((s) => s.filter((x) => x.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] space-y-2 no-print">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-xl bg-ink text-white text-sm px-4 py-3 shadow-lg animate-[fadeIn_.2s]">
            {t.type === "error" ? <AlertCircle size={16} className="text-red-400" /> : <CheckCircle2 size={16} className="text-emerald-400" />}{t.message}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
