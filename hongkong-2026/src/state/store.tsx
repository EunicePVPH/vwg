import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { dbGet, dbPut, dbClear } from '../lib/db';
import { decryptJson, encryptJson } from '../lib/crypto';
import { DEFAULT_RATES, type Rates } from '../lib/money';
import { setSimulatedNow } from '../lib/time';
import { HOTEL } from '../data/seed';
import type { Hotel } from '../types';

export interface CollState { patch: Record<string, Record<string, unknown>>; added: Record<string, unknown>[]; removed: string[] }
export interface Settings {
  motion: 'system' | 'off';
  rates: Rates;
  simulatedNow: string | null;
  capPHP?: number; // total trip budget cap in pesos
  ratesAsked?: boolean;
}
export interface UserState {
  v: 1;
  col: Record<string, CollState>;
  hotel: Partial<Hotel>;
  checks: Record<string, boolean>;
  notes: Record<string, string>;
  settings: Settings;
  lastBackupAt?: number;
}
const emptyCol = (): CollState => ({ patch: {}, added: [], removed: [] });
export const initialState = (): UserState => ({
  v: 1, col: {}, hotel: {}, checks: {}, notes: {},
  settings: { motion: 'system', rates: DEFAULT_RATES, simulatedNow: null },
});

interface Ctx {
  state: UserState;
  setState: (fn: (s: UserState) => UserState) => void;
  replaceAll: (s: UserState) => void;
  resetTrip: () => void;
  hotel: Hotel;
  saved: boolean;
}
const StateCtx = createContext<Ctx | null>(null);
export const useAppState = () => { const c = useContext(StateCtx); if (!c) throw new Error('state'); return c; };

export function StateProvider({ dataKey, children }: { dataKey: CryptoKey; children: ReactNode }) {
  const [state, set] = useState<UserState | null>(null);
  const [saved, setSaved] = useState(true);
  const timer = useRef<number | undefined>(undefined);
  const latest = useRef<UserState | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      const raw = await dbGet<{ iv: Uint8Array; data: ArrayBuffer }>('kv', 'state');
      let s = initialState();
      if (raw) { try { s = { ...initialState(), ...(await decryptJson<UserState>(dataKey, raw.iv, raw.data)) }; } catch { /* corrupted → fresh */ } }
      if (!cancel) { latest.current = s; setSimulatedNow(s.settings.simulatedNow); set(s); }
    })();
    return () => { cancel = true; };
  }, [dataKey]);

  const persist = useCallback((s: UserState) => {
    setSaved(false);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      const e = await encryptJson(dataKey, s);
      await dbPut('kv', 'state', { iv: e.iv, data: e.data });
      setSaved(true);
    }, 350);
  }, [dataKey]);

  const setState = useCallback((fn: (s: UserState) => UserState) => {
    const next = fn(latest.current ?? initialState());
    latest.current = next;
    setSimulatedNow(next.settings.simulatedNow);
    set(next); persist(next);
  }, [persist]);

  // flush on hide so nothing is lost when the phone is locked
  useEffect(() => {
    const flush = async () => {
      if (latest.current) { const e = await encryptJson(dataKey, latest.current); await dbPut('kv', 'state', { iv: e.iv, data: e.data }); }
    };
    const h = () => { if (document.visibilityState === 'hidden') void flush(); };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [dataKey]);

  const ctx = useMemo<Ctx | null>(() => state && ({
    state, setState, saved,
    replaceAll: (s) => setState(() => ({ ...initialState(), ...s })),
    resetTrip: () => setState((o) => ({ ...initialState(), settings: o.settings })),
    hotel: { ...HOTEL, ...state.hotel },
  }), [state, setState, saved]);

  if (!ctx) return <div className="min-h-dvh grid place-items-center bg-navy text-white">Opening…</div>;
  return <StateCtx.Provider value={ctx}>{children}</StateCtx.Provider>;
}

/** Generic editable collection: seed rows + your edits, additions and removals. */
export function useCollection<T extends { id: string }>(name: string, seed: T[]) {
  const { state, setState } = useAppState();
  const c = state.col[name] ?? emptyCol();
  const items = useMemo(() => {
    const removed = new Set(c.removed);
    const base = seed.filter((s) => !removed.has(s.id)).map((s) => (c.patch[s.id] ? ({ ...s, ...c.patch[s.id] } as T) : s));
    const added = c.added.filter((a) => !removed.has((a as T).id)).map((a) => (c.patch[(a as T).id] ? { ...a, ...c.patch[(a as T).id] } : a) as T);
    return [...base, ...added];
  }, [seed, c]);
  const mut = (fn: (c: CollState) => CollState) => setState((s) => ({ ...s, col: { ...s.col, [name]: fn(s.col[name] ?? emptyCol()) } }));
  const seedIds = useMemo(() => new Set(seed.map((s) => s.id)), [seed]);
  return {
    items,
    update: (id: string, patch: Partial<T>) => mut((c) => ({ ...c, patch: { ...c.patch, [id]: { ...(c.patch[id] ?? {}), ...patch } } })),
    add: (item: T) => mut((c) => ({ ...c, added: [...c.added, item] })),
    remove: (id: string) => mut((c) => ({ ...c, removed: [...c.removed, id], added: c.added.filter((a) => (a as T).id !== id) })),
    restore: (id: string) => mut((c) => { const p = { ...c.patch }; delete p[id]; return { ...c, patch: p, removed: c.removed.filter((r) => r !== id) }; }),
    isEdited: (id: string) => !!c.patch[id],
    isSeed: (id: string) => seedIds.has(id),
    removedItems: seed.filter((s) => c.removed.includes(s.id)),
  };
}

export function useChecks() {
  const { state, setState } = useAppState();
  return {
    checks: state.checks,
    toggle: (k: string) => setState((s) => ({ ...s, checks: { ...s.checks, [k]: !s.checks[k] } })),
    set: (k: string, v: boolean) => setState((s) => ({ ...s, checks: { ...s.checks, [k]: v } })),
  };
}
export function useNote(key: string): [string, (v: string) => void] {
  const { state, setState } = useAppState();
  return [state.notes[key] ?? '', (v) => setState((s) => ({ ...s, notes: { ...s.notes, [key]: v } }))];
}
export function useSettings() {
  const { state, setState } = useAppState();
  return { settings: state.settings, setSettings: (p: Partial<Settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...p } })) };
}
export const wipeLocalData = async () => { await dbClear('kv'); await dbClear('docs'); await dbClear('photos'); try { localStorage.removeItem('hk26.fail'); } catch { /* */ } };
