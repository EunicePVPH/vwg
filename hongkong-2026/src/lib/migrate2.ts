// One-time, non-destructive migration to the Nov 27 plan. Nothing is deleted: your edits to the old plan are
// copied into a change log, your own added activities stay, and the old plan stays readable.
import { LEGACY_ACTIVITIES } from '../data/legacy';
import { EXPENSES } from '../data/seed';
import type { UserState } from '../state/store';

export interface ChangeEntry {
  id: string; at: number; kind: 'update' | 'edit-superseded' | 'conflict'; title: string; detail: string;
  day?: number; coll?: string; itemId?: string; field?: string; yours?: string; plan?: string; resolved?: boolean;
}
const show = (v: unknown) => (v === null || v === undefined || v === '' ? '(empty)' : String(v));

export function migrateItinerary(s: UserState): UserState {
  if (s.itinV2) return s;
  const at = Date.now();
  const log: ChangeEntry[] = [...(s.changeLog ?? [])];
  log.push({ id: 'chg-update', at, kind: 'update', title: 'Itinerary updated to the Nov 27 draft', detail: 'Days 1–5, transport routes, quotes, reminders and the booklet were updated. Your own added activities, expenses and checklists were kept. The Nov 6 plan is still readable under “Previous plan”.' });
  const col = s.col.activities;
  if (col) {
    for (const [id, patch] of Object.entries(col.patch)) {
      const old = LEGACY_ACTIVITIES.find((a) => a.id === id);
      if (!old) continue;
      const bits = Object.entries(patch).map(([k, v]) => `${k}: ${show(v)}`).join(' · ');
      log.push({ id: 'chg-' + id, at, kind: 'edit-superseded', day: old.day, itemId: id, title: `You edited “${old.title}” (Day ${old.day})`, detail: `Your edit — ${bits}. The new plan replaced this stop; re-add it from “Previous plan” if you still want it.` });
    }
    for (const id of col.removed) {
      const old = LEGACY_ACTIVITIES.find((a) => a.id === id);
      if (old) log.push({ id: 'chg-rm-' + id, at, kind: 'edit-superseded', day: old.day, itemId: id, title: `You had removed “${old.title}” (Day ${old.day})`, detail: 'Not carried into the new plan.' });
    }
  }
  const ex = s.col.expenses;
  if (ex) {
    for (const [id, patch] of Object.entries(ex.patch)) {
      const seed = EXPENSES.find((e) => e.id === id) as unknown as Record<string, unknown> | undefined;
      if (!seed) continue;
      for (const f of ['status', 'amount', 'currency'] as const) {
        if (f in patch && patch[f] !== seed[f]) log.push({ id: `chg-x-${id}-${f}`, at, kind: 'conflict', coll: 'expenses', itemId: id, field: f, title: `Expense “${String(seed.label)}” — your ${f} differs`, detail: 'Your saved value was kept. Tap “Use new plan value” to switch.', yours: show(patch[f]), plan: show(seed[f]) });
      }
    }
  }
  return { ...s, itinV2: true, changeLog: log };
}
