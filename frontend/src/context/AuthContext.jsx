import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api, { API } from "../services/api";
import { clearDb } from "../services/store";
const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("access")) return setReady(true);
    api.get("/auth/me/").then((r) => setUser(r.data)).catch(() => localStorage.clear()).finally(() => setReady(true));
  }, []);
  const login = async (username, password) => {
    const { data } = await axios.post(`${API}/auth/login/`, { username: username.trim(), password });
    localStorage.setItem("access", data.access); localStorage.setItem("refresh", data.refresh);
    setUser((await api.get("/auth/me/")).data);
  };
  const logout = () => { localStorage.clear(); clearDb(); setUser(null); };
  return <Ctx.Provider value={{ user, ready, login, logout }}>{children}</Ctx.Provider>;
}
