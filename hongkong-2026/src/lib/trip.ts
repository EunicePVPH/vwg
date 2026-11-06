import type { Activity, Day, Expense, Kind } from '../types';
import { hkParts, nowMs, toMin, TRIP_START } from './time';
import { toHKD, type Rates } from './money';
import { DAYS } from '../data/seed';

export const dayOf = (id: number): Day => DAYS.find((d) => d.id === id) ?? DAYS[0];
export const sortActs = (a: Activity[]) => [...a].sort((x, y) => x.day - y.day || toMin(x.start) - toMin(y.start));

const absMin = (date: string, hhmm: number) => Math.round((Date.parse(date + 'T00:00:00Z') - Date.parse(TRIP_START + 'T00:00:00Z')) / 60000) + hhmm;
export const nowAbs = (ms = nowMs()) => { const p = hkParts(ms); return absMin(p.date, p.minutes); };

export type ActState = 'done' | 'current' | 'upcoming';
export function actWindow(a: Activity, all: Activity[]) {
  const date = dayOf(a.day).date;
  const s = absMin(date, toMin(a.start));
  const sameDay = sortActs(all.filter((x) => x.day === a.day));
  const i = sameDay.findIndex((x) => x.id === a.id);
  const endMin = a.end ? toMin(a.end) : i >= 0 && sameDay[i + 1] ? toMin(sameDay[i + 1].start) : toMin(a.start) + 30;
  return { s, e: Math.max(absMin(date, endMin), s + 5) };
}
export function actState(a: Activity, all: Activity[], done: boolean, ms = nowMs()): ActState {
  if (done) return 'done';
  const n = nowAbs(ms); const w = actWindow(a, all);
  return n >= w.e ? 'done' : n >= w.s ? 'current' : 'upcoming';
}

export const KIND_CAT: Record<Kind, string> = { travel: 'Transport', flight: 'Flights', meal: 'Food', sight: 'Activities & Attractions', show: 'Activities & Attractions', rest: 'Other', hotel: 'Hotel', task: 'Other' };
export const CATEGORIES = ['Flights', 'Hotel', 'Food', 'Transport', 'Activities & Attractions', 'Disney PhotoPass', 'Shopping', 'Essentials', 'OOTD', 'Other'];
/** Old category names are folded into the current list so nothing you entered is lost. */
export const normCat = (c: string) => ({ Attractions: 'Activities & Attractions', 'SIM / eSIM': 'Essentials', Health: 'Essentials', Cash: 'Other' } as Record<string, string>)[c] ?? c;
export const catOf = (a: Activity) => normCat(a.cat ?? KIND_CAT[a.kind]);

export const dayEstimate = (acts: Activity[], day: number) => acts.filter((a) => a.day === day && a.costHKD).reduce((n, a) => n + (a.costHKD ?? 0), 0);
export const unpricedCount = (acts: Activity[], day: number) => acts.filter((a) => a.day === day && a.costHKD === null).length;

/** Spend made on the trip (not pre-paid, not deposit, not cash withdrawal) in HKD */
export function tripSpend(exps: Expense[], r: Rates, day?: number) {
  return exps.filter((e) => e.kind === 'spend' && e.status === 'actual' && e.amount && (day === undefined || e.day === day)).reduce((n, e) => n + toHKD(e.amount!, e.currency, r), 0);
}
export const prepaid = (exps: Expense[], r: Rates) => exps.filter((e) => e.kind === 'spend' && e.status === 'paid' && e.amount).reduce((n, e) => n + toHKD(e.amount!, e.currency, r), 0);
