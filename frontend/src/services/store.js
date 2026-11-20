// Client cache of the server data. Every change goes to the Django API (the database) first, then the cache refreshes.
// There is NO static/demo data anywhere in this app.
import api from "./api";
import { COLLECTIONS } from "../config/collections";

const empty = () => Object.fromEntries(Object.keys(COLLECTIONS).map((k) => [k, []]));
let db = empty(); let status = { loaded: false, error: null };
const subs = new Set(); const emit = () => subs.forEach((f) => f());
export const subscribe = (cb) => { subs.add(cb); return () => subs.delete(cb); };
export const getDb = () => db; export const getStatus = () => status;

export async function refresh(name) {
  const { data } = await api.get(COLLECTIONS[name]);
  db = { ...db, [name]: data }; emit();
}
export async function loadAll() {
  const names = Object.keys(COLLECTIONS);
  const res = await Promise.allSettled(names.map((n) => api.get(COLLECTIONS[n])));
  const next = { ...db }; let failed = 0;
  res.forEach((r, i) => { if (r.status === "fulfilled") next[names[i]] = r.value.data; else failed++; });
  db = next; status = failed === names.length ? { loaded: false, error: "Cannot reach the server. Is the backend running?" } : { loaded: true, error: null }; emit();
}
export const clearDb = () => { db = empty(); status = { loaded: false, error: null }; emit(); };

export async function insert(name, row) { const { data } = await api.post(COLLECTIONS[name], row); await refresh(name); return data; }
export async function update(name, id, patch) { const { data } = await api.patch(`${COLLECTIONS[name]}${id}/`, patch); await refresh(name); return data; }
export async function remove(name, id) { await api.delete(`${COLLECTIONS[name]}${id}/`); await loadAll(); } // cascades happen in the database
