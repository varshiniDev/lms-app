import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb } from "../../hooks/useDb";
import { fmtDate } from "../../lib/format";

// Admin-only. Create logins and put each one on a user level (the level decides which screens/actions they get).
export default function Users() {
  const db = useDb();
  const columns = [
    { key: "name", label: "User", render: (r) => <PersonCell name={r.name} sub={`@${r.username}`} />, export: (r) => r.name },
    { key: "username", label: "Username", exportOnly: true }, { key: "email", label: "Email", hide: "md" },
    { key: "roleName", label: "User level", render: (r) => <Badge tone={r.roleName === "Administrator" ? "purple" : "blue"}>{r.roleName}</Badge>, export: (r) => r.roleName },
    { key: "lastLogin", label: "Last login", hide: "lg", render: (r) => (r.lastLogin ? fmtDate(r.lastLogin.slice(0, 10)) : "Never"), export: (r) => r.lastLogin?.slice(0, 10) || "Never" },
    { key: "isActive", label: "Status", render: (r) => <Badge>{r.isActive ? "Active" : "Inactive"}</Badge>, export: (r) => (r.isActive ? "Active" : "Disabled") },
  ];
  const fields = [
    { key: "name", label: "Full name", required: true }, { key: "username", label: "Username (login)", required: true },
    { key: "email", label: "Email", type: "email" }, { key: "roleId", label: "User level", type: "select", required: true, options: db.roles.map((r) => ({ value: r.id, label: r.name })), display: (r) => r.roleName },
    { key: "password", label: "Password (min 6) - leave blank on edit to keep it", type: "password", full: true, display: () => "********" },
    { key: "isActive", label: "Login status", type: "select", options: [{ value: true, label: "Active" }, { value: false, label: "Disabled" }], display: (r) => (r.isActive ? "Active" : "Disabled") },
  ];
  const stats = (rows) => [
    { label: "Logins", value: rows.length, icon: ShieldCheck, tone: "blue" }, { label: "Active", value: rows.filter((r) => r.isActive).length, icon: UserCheck, tone: "green" },
    { label: "Disabled", value: rows.filter((r) => !r.isActive).length, icon: UserX, tone: "red" }, { label: "User levels", value: db.roles.length, icon: ShieldCheck, tone: "purple" },
  ];
  return <EntityPage title="Users" subtitle="Create logins and assign each person a user level" singular="User" collection="users" screen="users" columns={columns} fields={fields} stats={stats}
    filters={[{ key: "roleName", label: "Level", options: db.roles.map((r) => r.name) }]} defaults={{ isActive: true }} prepare={(v) => { if (!v.password) delete v.password; return v; }} />;
}
