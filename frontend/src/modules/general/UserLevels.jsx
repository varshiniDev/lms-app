import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { NAV } from "../../config/navigation";

const SCREENS = [...new Map(NAV.flatMap((g) => g.items).filter((i) => !["settings", "users", "levels"].includes(i.key)).map((i) => [i.key, { value: i.key, label: i.label }])).values()];
const summary = (p = {}) => { const k = Object.keys(p); return k.length ? k.map((s) => `${SCREENS.find((x) => x.value === s)?.label || s} (${p[s].join("/")})`).join(", ") : "No access"; };

// Admin-only. A "user level" = a named set of permissions: for every screen choose View / Add / Edit / Delete.
export default function UserLevels() {
  const columns = [
    { key: "name", label: "User level", render: (r) => <div><b className="text-slate-900">{r.name}</b>{(r.isSystem || r.kind !== "custom") && <Badge tone="purple">Built-in</Badge>}<div className="text-xs text-slate-500">{r.description}</div></div>, export: (r) => r.name },
    { key: "description", label: "Description", exportOnly: true },
    { key: "userCount", label: "Users" },
    { key: "screens", label: "Screens", hide: "md", render: (r) => (r.isSystem ? "All screens, full access" : r.kind !== "custom" ? "Portal: own data only" : `${Object.keys(r.permissions || {}).length} of ${SCREENS.length} screens`), export: (r) => (r.isSystem ? "All" : Object.keys(r.permissions || {}).length) },
    { key: "access", label: "Access", hide: "lg", sortable: false, render: (r) => <span className="line-clamp-2 max-w-md text-xs text-slate-600">{r.isSystem ? "Everything + user management" : r.kind === "student" ? "Own classes, attendance, assignments, results, fees, certificates (read-only)" : r.kind === "trainer" ? "Own batches and students; mark attendance; manage assignments, results, materials, classes" : summary(r.permissions)}</span>, export: (r) => (r.isSystem ? "Everything" : summary(r.permissions)) },
  ];
  const fields = [
    { key: "name", label: "Level name (e.g. Manager, Sales Executive, Front Desk)", required: true, full: true }, { key: "description", label: "Description", full: true },
    { key: "permissions", label: "What can this level do on each screen?", type: "matrix", options: SCREENS, display: (r) => (r.isSystem ? "Everything" : summary(r.permissions)) },
  ];
  return <EntityPage title="User Levels" subtitle="Define who can view, add, edit or delete on every screen. Student and Trainer are built-in portal levels." singular="User level" collection="roles" screen="levels" columns={columns} fields={fields}
    defaults={{ permissions: {} }} rowEditable={(r) => !r.isSystem && r.kind === "custom"} rowDeletable={(r) => !r.isSystem && r.kind === "custom"} />;
}
