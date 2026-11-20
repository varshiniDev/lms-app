import { useState } from "react";
import { BRAND } from "../../config/brand";
// Logo on a white rounded card (as in your reference) so it reads on dark and light backgrounds.
export default function Logo({ className = "", height = 44 }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`inline-flex items-center justify-center rounded-2xl bg-white px-3 py-2 ${className}`}>
      {broken ? <span className="font-extrabold text-brand-orange">{BRAND.name}</span>
        : <img src={BRAND.logo} alt={BRAND.name} style={{ height }} className="object-contain max-w-full" onError={() => setBroken(true)} />}
    </div>
  );
}
