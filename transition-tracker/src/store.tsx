import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { DEFAULT_ROUTINES, DEFAULT_SETTINGS, cloneRoutines } from './lib/defaults';
import { kvDel, kvGet, kvSet, requestPersistence, storageMode, type StorageMode } from './lib/db';
import { generateDemoObservations } from './lib/demo';
import { localDateStr, uid } from './lib/format';
import { endSession, pauseSession, recoverSession, resumeSession, startSession as timerStart, elapsedMs } from './lib/timer';
import { planImport, type ImportPlan } from './lib/backup';
import type { ActiveSession, AuditEntry, ObsStatus, Observation, Phase, Routine, Settings } from './lib/types';

export type View = 'dashboard' | 'routines' | 'research' | 'reports' | 'settings';

export interface Toast { id: number; msg: string; kind: 'ok' | 'warn' | 'error' }
export interface Blocker { id: 'readiness' | 'posttest'; text: string; fixView: View }

export interface Store {
  ready: boolean;
  settings: Settings;
  routines: Routine[];
  /** observations of the CURRENT dataset (demo or real). The two are never mixed. */
  obs: Observation[];
  isDemo: boolean;
  active: ActiveSession | null;
  lastSavedAt: number | null;
  storage: StorageMode;
  toasts: Toast[];
  view: View;
  sessionOpen: boolean;
  draftRoutineId: string | null;
  draftTargetSec: number;
  // ui
  go: (v: View) => void;
  openSession: (routineId?: string) => void;
  closeSession: () => void;
  setDraftTarget: (sec: number) => void;
  setDraftRoutine: (id: string) => void;
  toast: (msg: string, kind?: Toast['kind']) => void;
  // settings
  updateSettings: (p: Partial<Settings>) => void;
  setDemoMode: (on: boolean) => void;
  // routines
  saveRoutine: (r: Routine) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => void;
  resetRoutines: () => void;
  // session
  trackerShownFor: (phase: Phase) => boolean;
  blockers: Blocker[];
  startSession: () => void;
  pause: () => void;
  resume: () => void;
  classReady: () => void;
  cancelSession: (save: boolean) => void;
  restartSession: () => void;
  finishSession: () => void;
  // observations
  patchObservation: (id: string, patch: Partial<Observation>) => void;
  editObservation: (id: string, patch: Partial<Observation>, reason: string) => void;
  addManual: (o: ManualInput) => void;
  applyImport: (plan: ImportPlan, overwriteConflicts: boolean) => void;
  previewImport: (incoming: Observation[]) => ImportPlan;
  clearRealData: () => void;
  reseedDemo: () => void;
  restoreConfig: (s: Partial<Settings>, r: Routine[]) => void;
}

export interface ManualInput {
  date: string;
  time: string; // HH:MM
  phase: Phase;
  routineId: string;
  durationSec: number;
  remindersCount: number | null;
  present: number | null;
  ready: number | null;
  notes: string;
  reason: string;
}

const Ctx = createContext<Store | null>(null);
export const useStore = (): Store => {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoreProvider missing');
  return s;
};

const AUDITED: (keyof Observation)[] = ['durationMs', 'status', 'statusReason', 'phase', 'date', 'targetSec'];

function cloneRoutine<T>(r: T): T {
  return JSON.parse(JSON.stringify(r));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [routines, setRoutines] = useState<Routine[]>(() => cloneRoutines(DEFAULT_ROUTINES));
  const [obsReal, setObsReal] = useState<Observation[]>([]);
  const [obsDemo, setObsDemo] = useState<Observation[]>([]);
  const [active, setActive] = useState<ActiveSession | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [storage, setStorage] = useState<StorageMode>('indexeddb');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [draftRoutineId, setDraftRoutineId] = useState<string | null>(null);
  const [draftTargetSec, setDraftTargetSec] = useState(120);

  const toastId = useRef(0);
  const toast = useCallback((msg: string, kind: Toast['kind'] = 'ok') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  /* ---------- load ---------- */
  useEffect(() => {
    (async () => {
      const [s, r, or, od, a] = await Promise.all([
        kvGet<Settings>('settings'),
        kvGet<Routine[]>('routines'),
        kvGet<Observation[]>('obs:real'),
        kvGet<Observation[]>('obs:demo'),
        kvGet<ActiveSession>('active'),
      ]);
      const merged = { ...DEFAULT_SETTINGS, ...(s ?? {}) };
      setSettings(merged);
      if (r && r.length) setRoutines(r);
      setObsReal(or ?? []);
      if (od) setObsDemo(od);
      else if (merged.demoMode) setObsDemo(generateDemoObservations());
      if (a) {
        const rec = recoverSession(a);
        if (rec) {
          setActive(rec);
          setSessionOpen(true);
        } else {
          void kvDel('active');
        }
      }
      setStorage(storageMode());
      setReady(true);
      void requestPersistence();
    })();
  }, []);

  /* ---------- persist ---------- */
  const persist = useCallback(async (key: string, value: unknown) => {
    await kvSet(key, value);
    setStorage(storageMode());
    setLastSavedAt(Date.now());
  }, []);
  useEffect(() => { if (ready) void persist('settings', settings); }, [settings, ready, persist]);
  useEffect(() => { if (ready) void persist('routines', routines); }, [routines, ready, persist]);
  useEffect(() => { if (ready) void persist('obs:real', obsReal); }, [obsReal, ready, persist]);
  useEffect(() => { if (ready && (obsDemo.length || settings.demoMode)) void persist('obs:demo', obsDemo); }, [obsDemo, ready, persist, settings.demoMode]);
  useEffect(() => {
    if (!ready) return;
    if (active) void persist('active', active);
    else void kvDel('active');
  }, [active, ready, persist]);

  /* ---------- motion preference ---------- */
  useEffect(() => {
    const apply = () => {
      const sys = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
      const reduced = settings.motion === 'reduced' || (settings.motion === 'system' && sys);
      document.documentElement.dataset.motion = reduced ? 'reduced' : 'full';
    };
    apply();
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    mq?.addEventListener?.('change', apply);
    return () => mq?.removeEventListener?.('change', apply);
  }, [settings.motion]);

  const isDemo = settings.demoMode;
  const obs = isDemo ? obsDemo : obsReal;
  const setObsFor = useCallback(
    (demo: boolean, fn: (o: Observation[]) => Observation[]) => (demo ? setObsDemo(fn) : setObsReal(fn)),
    [],
  );

  /* ---------- helpers ---------- */
  const trackerShownFor = useCallback(
    (phase: Phase) => phase === 'intervention' || (phase === 'posttest' && settings.posttestUse === 'with-tracker'),
    [settings.posttestUse],
  );

  const blockers: Blocker[] = useMemo(() => {
    const b: Blocker[] = [];
    if (!isDemo && !settings.readinessConfirmed) {
      b.push({ id: 'readiness', text: 'Confirm the readiness criterion (what counts as "most pupils are ready") before recording real observations.', fixView: 'research' });
    }
    if (settings.phase === 'posttest' && settings.posttestUse === 'unset') {
      b.push({ id: 'posttest', text: 'Choose how the tracker is used during posttest (with or without the pupil display).', fixView: 'research' });
    }
    return b;
  }, [isDemo, settings.readinessConfirmed, settings.phase, settings.posttestUse]);

  const buildObservation = useCallback(
    (s: ActiveSession, status: ObsStatus, reason: string, flags: string[]): Observation => {
      const nowIso = new Date().toISOString();
      const dur = elapsedMs(s, s.endedAtMs ?? Date.now());
      return {
        id: s.id,
        isDemo: s.demo,
        className: settings.className + (s.demo ? ' (demo)' : ''),
        schoolName: settings.schoolName,
        date: localDateStr(s.startedAtMs),
        phase: s.phase,
        routineId: s.routine.id,
        routineName: s.routine.title,
        routineSnapshot: cloneRoutine(s.routine),
        startedAt: new Date(s.startedAtMs).toISOString(),
        endedAt: new Date(s.endedAtMs ?? Date.now()).toISOString(),
        durationMs: dur,
        originalDurationMs: null,
        pausedMs: s.pausedTotalMs,
        pauseCount: s.pauseCount,
        targetSec: s.trackerShown ? s.targetSec : null,
        trackerShown: s.trackerShown,
        remindersCount: null,
        reminderSec: null,
        present: null,
        ready: null,
        readinessType: settings.readinessConfirmed ? settings.readinessType : null,
        readinessValue: settings.readinessConfirmed ? settings.readinessValue : null,
        notes: '',
        status,
        statusReason: reason,
        source: 'timer',
        flags,
        createdAt: nowIso,
        updatedAt: nowIso,
        audit: [],
      };
    },
    [settings],
  );

  /* ---------- ui actions ---------- */
  const go = useCallback((v: View) => { setView(v); window.scrollTo?.({ top: 0 }); }, []);
  const openSession = useCallback((routineId?: string) => {
    if (active) { setSessionOpen(true); return; }
    const rid = routineId ?? draftRoutineId ?? routines[0]?.id ?? null;
    const r = routines.find((x) => x.id === rid) ?? routines[0];
    setDraftRoutineId(r?.id ?? null);
    setDraftTargetSec(r?.targetSec ?? settings.defaultTargetSec);
    setSessionOpen(true);
  }, [active, draftRoutineId, routines, settings.defaultTargetSec]);
  const closeSession = useCallback(() => setSessionOpen(false), []);
  const setDraftRoutine = useCallback((id: string) => {
    setDraftRoutineId(id);
    const r = routines.find((x) => x.id === id);
    if (r) setDraftTargetSec(r.targetSec);
  }, [routines]);

  /* ---------- settings ---------- */
  const updateSettings = useCallback((p: Partial<Settings>) => setSettings((s) => ({ ...s, ...p })), []);
  const setDemoMode = useCallback((on: boolean) => {
    if (active) { toast('Finish or cancel the running transition before switching Demo Mode.', 'warn'); return; }
    setSettings((s) => ({ ...s, demoMode: on }));
    if (on && obsDemo.length === 0) setObsDemo(generateDemoObservations());
    toast(on ? 'Demo Mode on. Showing sample data only.' : 'Demo Mode off. Showing your real records.', on ? 'warn' : 'ok');
  }, [active, obsDemo.length, toast]);

  /* ---------- routines ---------- */
  const saveRoutine = useCallback((r: Routine) => {
    setRoutines((list) => (list.some((x) => x.id === r.id) ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r]));
    toast('Routine saved. Past observations keep their original settings.');
  }, [toast]);
  const deleteRoutine = useCallback((id: string) => {
    setRoutines((l) => l.filter((x) => x.id !== id));
    toast('Routine deleted. Saved observations keep their copy of it.');
  }, [toast]);
  const duplicateRoutine = useCallback((id: string) => {
    setRoutines((l) => {
      const r = l.find((x) => x.id === id);
      if (!r) return l;
      return [...l, { ...cloneRoutine(r), id: uid('r'), title: r.title + ' (copy)' }];
    });
    toast('Routine duplicated.');
  }, [toast]);
  const resetRoutines = useCallback(() => {
    setRoutines(cloneRoutines(DEFAULT_ROUTINES));
    toast('Routines reset to the four suggested defaults.');
  }, [toast]);

  /* ---------- session ---------- */
  const startSession = useCallback(() => {
    if (active || blockers.length) return;
    const r = routines.find((x) => x.id === draftRoutineId);
    if (!r) return;
    const phase = settings.phase;
    const shown = trackerShownFor(phase);
    const snap = { ...cloneRoutine(r), targetSec: draftTargetSec };
    setActive(timerStart({ id: uid('obs'), demo: isDemo, phase, trackerShown: shown, routine: snap, targetSec: draftTargetSec }, Date.now()));
  }, [active, blockers.length, routines, draftRoutineId, settings.phase, trackerShownFor, draftTargetSec, isDemo]);

  const pause = useCallback(() => setActive((s) => (s ? pauseSession(s, Date.now()) : s)), []);
  const resume = useCallback(() => setActive((s) => (s ? resumeSession(s, Date.now()) : s)), []);

  const classReady = useCallback(() => {
    const now = Date.now(); // captured first so UI work can never change the measurement
    if (!active || active.status === 'ended') return;
    const ended = endSession(active, now);
    const flags: string[] = [];
    let status: ObsStatus = 'valid';
    let reason = '';
    if (ended.recovered) { flags.push('recovered-after-reload'); status = 'review'; reason = 'Page was reloaded or closed during timing. Confirm the measured time is correct.'; }
    else if (ended.pauseCount > 0) { flags.push('paused'); status = 'review'; reason = 'Timer was paused during this transition. Confirm whether to include it.'; }
    const o = buildObservation(ended, status, reason, flags);
    setObsFor(ended.demo, (l) => [o, ...l.filter((x) => x.id !== o.id)]);
    setActive({ ...ended, savedObsId: o.id });
  }, [active, buildObservation, setObsFor]);

  const cancelSession = useCallback((save: boolean) => {
    const now = Date.now();
    if (!active) return;
    if (save && active.status !== 'ended') {
      const ended = endSession(active, now);
      const o = buildObservation(ended, 'interrupted', 'Cancelled by teacher before the class was ready.', ended.recovered ? ['recovered-after-reload'] : []);
      setObsFor(ended.demo, (l) => [o, ...l]);
      toast('Saved as interrupted. It is not counted in the statistics.', 'warn');
    } else {
      toast('Timing discarded. Nothing was saved.', 'warn');
    }
    setActive(null);
  }, [active, buildObservation, setObsFor, toast]);

  const restartSession = useCallback(() => {
    if (!active) return;
    const r = active.routine;
    setActive(timerStart({ id: uid('obs'), demo: active.demo, phase: active.phase, trackerShown: active.trackerShown, routine: r, targetSec: active.targetSec }, Date.now()));
    toast('Restarted. The previous timing was discarded.', 'warn');
  }, [active, toast]);

  const finishSession = useCallback(() => {
    setActive(null);
    setSessionOpen(false);
  }, []);

  /* ---------- observations ---------- */
  const patchObservation = useCallback((id: string, patch: Partial<Observation>) => {
    const apply = (l: Observation[]) => l.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o));
    setObsDemo(apply);
    setObsReal(apply);
  }, []);

  const editObservation = useCallback((id: string, patch: Partial<Observation>, reason: string) => {
    const apply = (l: Observation[]) =>
      l.map((o) => {
        if (o.id !== id) return o;
        const audit: AuditEntry[] = [...o.audit];
        const at = new Date().toISOString();
        const next: Observation = { ...o, ...patch, updatedAt: at };
        AUDITED.forEach((k) => {
          if (k in patch && String(patch[k]) !== String(o[k])) {
            audit.push({ at, field: k, from: String(o[k] ?? ''), to: String(patch[k] ?? ''), reason });
          }
        });
        if ('durationMs' in patch && o.originalDurationMs == null) next.originalDurationMs = o.durationMs;
        next.audit = audit;
        return next;
      });
    setObsDemo(apply);
    setObsReal(apply);
    toast('Observation updated. The change is recorded in its history.');
  }, [toast]);

  const addManual = useCallback((m: ManualInput) => {
    const r = routines.find((x) => x.id === m.routineId);
    if (!r) return;
    const [hh, mm] = m.time.split(':').map(Number);
    const [y, mo, d] = m.date.split('-').map(Number);
    const startMs = new Date(y, mo - 1, d, hh || 0, mm || 0, 0).getTime();
    const durMs = Math.round(m.durationSec * 1000);
    const nowIso = new Date().toISOString();
    const o: Observation = {
      id: uid('obs'),
      isDemo,
      className: settings.className + (isDemo ? ' (demo)' : ''),
      schoolName: settings.schoolName,
      date: m.date,
      phase: m.phase,
      routineId: r.id,
      routineName: r.title,
      routineSnapshot: cloneRoutine(r),
      startedAt: new Date(startMs).toISOString(),
      endedAt: new Date(startMs + durMs).toISOString(),
      durationMs: durMs,
      originalDurationMs: null,
      pausedMs: 0,
      pauseCount: 0,
      targetSec: null,
      trackerShown: m.phase === 'intervention' || (m.phase === 'posttest' && settings.posttestUse === 'with-tracker'),
      remindersCount: m.remindersCount,
      reminderSec: null,
      present: m.present,
      ready: m.ready,
      readinessType: settings.readinessConfirmed ? settings.readinessType : null,
      readinessValue: settings.readinessConfirmed ? settings.readinessValue : null,
      notes: m.notes,
      status: 'manual',
      statusReason: m.reason,
      source: 'manual',
      flags: ['manual-entry'],
      createdAt: nowIso,
      updatedAt: nowIso,
      audit: [],
    };
    setObsFor(isDemo, (l) => [o, ...l]);
    toast('Manual entry saved and clearly marked as manual.');
  }, [routines, isDemo, settings, setObsFor, toast]);

  const previewImport = useCallback((incoming: Observation[]) => planImport(obsReal, incoming), [obsReal]);
  const applyImport = useCallback((plan: ImportPlan, overwriteConflicts: boolean) => {
    setObsReal((l) => {
      let next = [...plan.added, ...l];
      if (overwriteConflicts) {
        const inc = new Map(plan.conflicts.map((c) => [c.incoming.id, c.incoming]));
        next = next.map((o) => inc.get(o.id) ?? o);
      }
      return next;
    });
    toast(`Imported ${plan.added.length} new record(s)${overwriteConflicts ? ` and replaced ${plan.conflicts.length}` : ''}.`);
  }, [toast]);

  const clearRealData = useCallback(() => {
    setObsReal([]);
    toast('All real observations were deleted from this device.', 'warn');
  }, [toast]);
  const reseedDemo = useCallback(() => {
    setObsDemo(generateDemoObservations());
    toast('Demo data reset to the original sample.');
  }, [toast]);

  const restoreConfig = useCallback((s: Partial<Settings>, r: Routine[]) => {
    setSettings((cur) => ({ ...cur, ...s, demoMode: false }));
    if (r.length) setRoutines(r);
    toast('Settings and routines restored from the backup.');
  }, [toast]);

  const value: Store = {
    ready, settings, routines, obs, isDemo, active, lastSavedAt, storage, toasts, view, sessionOpen,
    draftRoutineId, draftTargetSec,
    go, openSession, closeSession, setDraftTarget: setDraftTargetSec, setDraftRoutine, toast,
    updateSettings, setDemoMode, saveRoutine, deleteRoutine, duplicateRoutine, resetRoutines,
    trackerShownFor, blockers, startSession, pause, resume, classReady, cancelSession, restartSession, finishSession,
    patchObservation, editObservation, addManual, applyImport, previewImport, clearRealData, reseedDemo, restoreConfig,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
