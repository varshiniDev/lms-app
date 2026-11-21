import { useState } from "react";
import { Users, BookOpenCheck, Headset, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CreateLoginModal from "./CreateLoginModal";
import EntityPage from "../../components/common/EntityPage";
import Badge from "../../components/common/Badge";
import { PersonCell } from "../../components/common/Avatar";
import { useDb } from "../../hooks/useDb";
import { todayISO } from "../../lib/format";

const ROLES = ["Instructor", "Senior Instructor", "Coordinator", "Counselor", "Accountant"];
export default function Staff() {
  const db = useDb(); const { user } = useAuth(); const [lg, setLg] = useState(null); const loginOf = (id) => db.users.find((u) => u.roleKind === "trainer" && u.linkedId === id); const nB = (r) => db.batches.filter((b) => b.staffId === r.id).length;
  const columns = [
    { key: "name", label: "Instructor / staff", render: (r) => <PersonCell name={r.name} sub={r.staffCode} />, export: (r) => r.name }, { key: "staffCode", label: "Staff ID", exportOnly: true },
    { key: "designation", label: "Designation" }, { key: "email", label: "Email", hide: "md" }, { key: "phone", label: "Phone", hide: "md" }, { key: "batches", label: "Batches", hide: "lg", render: nB, export: nB, sort: nB },
    ...(user?.isAdmin ? [{ key: "login", label: "Portal login", hide: "lg", render: (r) => (loginOf(r.id) ? <Badge tone="purple">@{loginOf(r.id).username}</Badge> : "-"), export: (r) => loginOf(r.id)?.username || "" }] : []),
    { key: "status", label: "Status", render: (r) => <Badge>{r.status}</Badge> },
  ];
  const fields = [
    { key: "name", label: "Full name", required: true }, { key: "designation", label: "Designation", type: "select", required: true, options: ROLES }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Phone", type: "tel" },
    { key: "joinedOn", label: "Joining date", type: "date" }, { key: "status", label: "Status", type: "select", options: ["Active", "Inactive"] },
  ];
  const stats = (rows) => [{ label: "Total staff", value: rows.length, icon: Users, tone: "blue" }, { label: "Instructors", value: rows.filter((r) => r.designation.includes("Instructor")).length, icon: BookOpenCheck, tone: "green" }, { label: "Other roles", value: rows.filter((r) => !r.designation.includes("Instructor")).length, icon: Headset, tone: "purple" }];
  return (<>
    <EntityPage title="Instructors" subtitle="Instructors and academic staff" singular="Instructor" collection="staff" columns={columns} fields={fields} stats={stats} filters={[{ key: "designation", label: "Role", options: ROLES }]} defaults={{ status: "Active", designation: "Instructor", joinedOn: todayISO() }}
      rowActions={(r) => (user?.isAdmin && !loginOf(r.id) ? [{ icon: KeyRound, title: "Create trainer login", cls: "text-purple-600", onClick: setLg }] : [])} />
    {lg && <CreateLoginModal kind="trainer" record={lg} onClose={() => setLg(null)} />}
  </>);
}
