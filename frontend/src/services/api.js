import axios from "axios";
export const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const snake = (s) => s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const camel = (s) => s.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
const conv = (v, f) => (Array.isArray(v) ? v.map((x) => conv(x, f)) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).map(([k, x]) => [f(k), conv(x, f)])) : v);

// The UI uses camelCase (courseId); the Django API uses snake_case (course_id). Converted here, once.
const api = axios.create({ baseURL: API });
api.interceptors.request.use((c) => {
  const t = localStorage.getItem("access"); if (t) c.headers.Authorization = `Bearer ${t}`;
  if (c.data && typeof c.data === "object") c.data = conv(c.data, snake);
  return c;
});
api.interceptors.response.use((r) => { if (r.data && typeof r.data === "object") r.data = conv(r.data, camel); return r; }, async (e) => {
  const orig = e.config;
  if (e.response?.status === 401 && !orig._retry && localStorage.getItem("refresh") && !orig.url.includes("/auth/")) {
    orig._retry = true;
    try {
      const { data } = await axios.post(`${API}/auth/refresh/`, { refresh: localStorage.getItem("refresh") });
      localStorage.setItem("access", data.access); orig.headers.Authorization = `Bearer ${data.access}`;
      const body = typeof orig.data === "string" ? JSON.parse(orig.data) : orig.data; // already snake_case
      return axios({ method: orig.method, url: API + orig.url, params: orig.params, data: body, headers: orig.headers }).then((r) => { r.data = conv(r.data, camel); return r; });
    } catch { localStorage.clear(); window.location = "/login"; }
  }
  if (e.response?.data && typeof e.response.data === "object") e.response.data = conv(e.response.data, camel);
  return Promise.reject(e);
});
export default api;

export function errMsg(e) {
  if (!e.response) return "Cannot reach the server. Is the backend running?";
  const d = e.response.data;
  if (d?.detail) return d.detail;
  if (d && typeof d === "object") return Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`).join(" | ");
  return `Server error (${e.response.status})`;
}
export const fieldErrors = (e) => { const d = e.response?.data; return d && typeof d === "object" && !d.detail ? Object.fromEntries(Object.entries(d).map(([k, v]) => [k, [].concat(v).join(" ")])) : {}; };
