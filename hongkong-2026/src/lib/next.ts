import type { Activity } from '../types';
import { actState, actWindow, nowAbs, sortActs } from './trip';
import { nowMs } from './time';

export interface NextStop { a: Activity; state: 'current' | 'upcoming'; minutes: number; started: boolean }
/** The next (or current) stop. Before the trip this is the first stop of Day 1; no live location is used. */
export function nextStop(acts: Activity[], done: Record<string, boolean>, ms = nowMs(), opts: { destinationOnly?: boolean } = {}): NextStop | null {
  const list = sortActs(acts).filter((a) => !opts.destinationOnly || !!(a.place || a.address));
  for (const a of list) {
    const st = actState(a, acts, !!done['done:' + a.id], ms);
    if (st === 'done') continue;
    const w = actWindow(a, acts); const n = nowAbs(ms);
    return { a, state: st, minutes: w.s - n, started: n >= w.s };
  }
  return null;
}
export const minsText = (m: number) => { const x = Math.abs(Math.round(m)); const d = Math.floor(x / 1440), h = Math.floor((x % 1440) / 60), mm = x % 60; return d ? `${d} d ${h} h` : h ? `${h} h ${mm} min` : `${mm} min`; };
