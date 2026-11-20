import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { subscribe, getDb, getStatus } from "../services/store";
import api, { errMsg } from "../services/api";
export const useDb = () => useSyncExternalStore(subscribe, getDb);
export const useStatus = () => useSyncExternalStore(subscribe, getStatus);
export const useLookup = (name) => { const rows = useDb()[name]; return useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows]); };
// one-off GET (e.g. data owned by the other system, fetched through our backend)
export function useRemote(path) {
  const [s, setS] = useState({ data: [], loading: true, error: null });
  useEffect(() => { let on = true; api.get(path).then((r) => on && setS({ data: r.data, loading: false, error: null })).catch((e) => on && setS({ data: [], loading: false, error: errMsg(e) })); return () => { on = false; }; }, [path]);
  return s;
}
