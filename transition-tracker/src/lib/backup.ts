import type { Observation, Routine, Settings } from './types';

export interface BackupFile {
  app: 'transition-tracker';
  version: 1;
  dataset: 'real' | 'demo';
  exportedAt: string;
  label: string;
  settings: Settings;
  routines: Routine[];
  observations: Observation[];
}

export function buildBackup(
  dataset: 'real' | 'demo',
  settings: Settings,
  routines: Routine[],
  observations: Observation[],
): BackupFile {
  return {
    app: 'transition-tracker',
    version: 1,
    dataset,
    exportedAt: new Date().toISOString(),
    label: dataset === 'demo' ? 'DEMONSTRATION DATA — NOT ACTUAL RESEARCH RESULTS' : 'Actual research records',
    settings,
    routines,
    observations,
  };
}

export type ParseResult = { ok: true; file: BackupFile } | { ok: false; error: string };

export function parseBackup(text: string): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, error: 'This file is not valid JSON.' };
  }
  const f = raw as Partial<BackupFile>;
  if (!f || f.app !== 'transition-tracker' || !Array.isArray(f.observations)) {
    return { ok: false, error: 'This is not a Transition Tracker backup file.' };
  }
  const obs = f.observations.filter(
    (o): o is Observation =>
      !!o && typeof o.id === 'string' && typeof o.durationMs === 'number' && isFinite(o.durationMs) && typeof o.phase === 'string',
  );
  if (obs.length !== f.observations.length) {
    return { ok: false, error: `${f.observations.length - obs.length} record(s) in the file are malformed. Nothing was imported.` };
  }
  return { ok: true, file: { ...(f as BackupFile), observations: obs } };
}

export interface ImportPlan {
  added: Observation[];
  identical: number;
  conflicts: { existing: Observation; incoming: Observation }[];
}

/** Guards against duplicates and overwrites: same id + same updatedAt = skipped; same id + different = conflict. */
export function planImport(existing: Observation[], incoming: Observation[]): ImportPlan {
  const byId = new Map(existing.map((o) => [o.id, o]));
  const plan: ImportPlan = { added: [], identical: 0, conflicts: [] };
  incoming.forEach((o) => {
    const e = byId.get(o.id);
    if (!e) plan.added.push({ ...o, isDemo: false });
    else if (e.updatedAt === o.updatedAt && e.durationMs === o.durationMs && e.status === o.status) plan.identical++;
    else plan.conflicts.push({ existing: e, incoming: { ...o, isDemo: false } });
  });
  return plan;
}
