// Access-level editor: one row per screen, tick View / Add / Edit / Delete.
const ACTIONS = ["view", "add", "edit", "delete"];
export default function PermissionMatrix({ screens, value, onChange }) {
  const toggle = (screen, a) => {
    const cur = value[screen] || []; let next;
    if (cur.includes(a)) next = a === "view" ? [] : cur.filter((x) => x !== a); // un-view clears the row
    else next = a === "view" ? [...cur, "view"] : [...new Set([...cur, "view", a])]; // add/edit/delete imply view
    const out = { ...value }; if (next.length) out[screen] = next; else delete out[screen]; onChange(out);
  };
  const all = () => onChange(Object.fromEntries(screens.map((s) => [s.value, [...ACTIONS]])));
  const viewOnly = () => onChange(Object.fromEntries(screens.map((s) => [s.value, ["view"]])));
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-2 text-xs"><button type="button" className="btn btn-ghost !h-8 !px-3 text-xs" onClick={all}>Full access</button><button type="button" className="btn btn-ghost !h-8 !px-3 text-xs" onClick={viewOnly}>View only</button><button type="button" className="btn btn-ghost !h-8 !px-3 text-xs" onClick={() => onChange({})}>Clear</button></div>
      <div className="max-h-80 overflow-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-max text-sm">
          <thead><tr><th className="th">Screen</th>{ACTIONS.map((a) => <th key={a} className="th text-center capitalize">{a}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {screens.map((s) => (
              <tr key={s.value}><td className="td font-medium">{s.label}</td>
                {ACTIONS.map((a) => <td key={a} className="td text-center"><input type="checkbox" className="h-4 w-4 accent-[#FF5A44]" checked={(value[s.value] || []).includes(a)} onChange={() => toggle(s.value, a)} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-slate-500">Add / Edit / Delete automatically include View.</p>
    </div>
  );
}
