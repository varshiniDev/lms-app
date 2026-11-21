import { ShieldCheck, UserCheck, UserX } from "lucide-react";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb } from "../../hooks/useDb";
import { fmtDate } from "../../lib/format";

// Admin-only. Create logins and put each one on a user level. "Student" and "Trainer" levels are portal logins:
// they are linked to one Student / Instructor record and only ever see that person's own data.
export default function Users() {
  const db = useDb(); const kindOf = (id) => db.roles.find((r) => r.id === id)?.kind;
  const columns = [
    { key: "name", label: "User", render: (r) => <PersonCell name={r.name} sub={`@${r.username}`} />, export: (r) => r.name },
    { key: "username", label: "Username", exportOnly: true },
    { key: "roleName", label: "User level", render: (r) => <Badge tone={r.roleName === "Administrator" ? "purple" : r.roleKind !== "custom" ? "green" : "blue"}>{r.roleName}</Badge>, export: (r) => r.roleName },
    { key: "linkedName", label: "Linked record", hide: "md", render: (r) => r.linkedName || "-", export: (r) => r.linkedName || "" },
    { key: "lastLogin", label: "Last login", hide: "lg", render: (r) => (r.lastLogin ? fmtDate(r.lastLogin.slice(0, 10)) : "Never"), export: (r) => r.lastLogin?.slice(0, 10) || "Never" },
    { key: "isActive", label: "Status", render: (r) => <Badge>{r.isActive ? "Active" : "Inactive"}</Badge>, export: (r) => (r.isActive ? "Active" : "Disabled") },
  ];
  const fields = [
    { key: "name", label: "Full name", required: true }, { key: "username", label: "Username (login)", required: true },
    { key: "email", label: "Email", type: "email" }, { key: "roleId", label: "User level", type: "select", required: true, options: db.roles.map((r) => ({ value: r.id, label: r.kind === "custom" ? r.name : `${r.name} (portal login)` })), display: (r) => r.roleName },
    { key: "studentLink", label: "Which student is this login for?", type: "select", full: true, showIf: (v) => kindOf(v.roleId) === "student", options: db.students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentCode})` })), display: (r) => r.linkedName },
    { key: "staffLink", label: "Which instructor is this login for?", type: "select", full: true, showIf: (v) => kindOf(v.roleId) === "trainer", options: db.staff.map((s) => ({ value: s.id, label: `${s.name} (${s.staffCode})` })), display: (r) => r.linkedName },
    { key: "password", label: "Password (min 6) - leave blank on edit to keep it", type: "password", full: true, display: () => "********" },
    { key: "isActive", label: "Login status", type: "select", options: [{ value: true, label: "Active" }, { value: false, label: "Disabled" }], display: (r) => (r.isActive ? "Active" : "Disabled") },
  ];
  const stats = (rows) => [
    { label: "Logins", value: rows.length, icon: ShieldCheck, tone: "blue" }, { label: "Student logins", value: rows.filter((r) => r.roleKind === "student").length, icon: UserCheck, tone: "green" },
    { label: "Trainer logins", value: rows.filter((r) => r.roleKind === "trainer").length, icon: UserCheck, tone: "purple" }, { label: "Disabled", value: rows.filter((r) => !r.isActive).length, icon: UserX, tone: "red" },
  ];
  return <EntityPage title="Users" subtitle="Staff, trainer and student logins - each on a user level" singular="User" collection="users" screen="users" columns={columns} fields={fields} stats={stats}
    filters={[{ key: "roleName", label: "Level", options: db.roles.map((r) => r.name) }]} defaults={{ isActive: true }}
    toForm={(r) => ({ ...r, studentLink: r.roleKind === "student" ? r.linkedId : "", staffLink: r.roleKind === "trainer" ? r.linkedId : "" })}
    prepare={(v) => { const k = kindOf(v.roleId); v.linkedId = k === "student" ? v.studentLink : k === "trainer" ? v.staffLink : null; if (!v.password) delete v.password; return v; }} />;
}
