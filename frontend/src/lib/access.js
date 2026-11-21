import { NAV } from "../config/navigation";
// Admin sees everything. Everyone else gets exactly what their user level grants per screen: view / add / edit / delete.
// "users" and "levels" (Users & Access) are admin-only; "settings" is open to every login.
const ADMIN_ONLY = ["users", "levels"];
export const can = (user, screen, action = "view") => {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (screen === "settings") return action === "view";
  if (ADMIN_ONLY.includes(screen)) return false;
  return (user.permissions?.[screen] || []).includes(action);
};
export const canSee = (user, key) => can(user, key, "view");
// Portal logins (student / trainer) can get friendlier menu names via `labels: { student: "My classes" }` in navigation.js
export const visibleNav = (user) => NAV.map((g) => ({ ...g, items: g.items.filter((i) => canSee(user, i.key)).map((i) => ({ ...i, label: i.labels?.[user?.kind] || i.label })) })).filter((g) => g.items.length);
export const firstPath = (user) => visibleNav(user)[0]?.items[0]?.to || null;
