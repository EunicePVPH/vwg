// In-app reminders derived from the CURRENT itinerary (so edits re-evaluate automatically and alerts are never duplicated:
// every reminder has a stable id built from the activity id + type + offset). Hong Kong and the Philippines are both UTC+8.
import type { Activity, Day, Ticket } from '../types';
import { DEADLINES } from '../data/gates';

export type RKind = 'leave' | 'ticket' | 'meal' | 'nap' | 'restroom' | 'last' | 'passport' | 'next' | 'morning' | 'deadline';
export const RKIND_LABEL: Record<RKind, string> = { leave: 'Leave now', ticket: 'Ticket ready', meal: 'Meal break', nap: 'Nap break', restroom: 'Restroom / diaper bag', last: 'Last transport check', passport: 'Passport & baggage', next: 'Next stop', morning: 'Morning checklist', deadline: 'Deadlines (eTravel, check-in…)' };
export interface Reminder { id: string; at: number; kind: RKind; title: string; body: string; actId?: string; link?: string }
export interface RemindState { on: boolean; notify: boolean; offsets: number[]; types: Record<RKind, boolean>; snoozed: Record<string, number>; dismissed: Record<string, true>; fired: Record<string, true> }
export const DEFAULT_REMIND: RemindState = {
  on: false, notify: false, offsets: [60, 30, 0], snoozed: {}, dismissed: {}, fired: {},
  types: { leave: true, ticket: true, meal: true, nap: true, restroom: true, last: true, passport: true, next: true, morning: true, deadline: true },
};
export const atHK = (date: string, hhmm: string) => Date.parse(`${date}T${hhmm}:00+08:00`);

export function buildReminders(acts: Activity[], days: Day[], tickets: Ticket[], st: RemindState): Reminder[] {
  const out: Reminder[] = [];
  const dateOf = (d: number) => days.find((x) => x.id === d)?.date ?? '2026-12-07';
  const push = (r: Reminder) => { if (st.types[r.kind]) out.push(r); };
  const sorted = [...acts].sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
  for (const d of days) {
    const first = sorted.find((a) => a.day === d.id);
    if (first && d.id > 1) push({ id: `morning:${d.id}`, at: atHK(d.date, first.start), kind: 'morning', title: `Morning checklist · Day ${d.id}`, body: 'Passports/phones, Wise & Octopus, today’s tickets, power bank, diapers & snacks, jackets, medications.' });
  }
  for (const a of sorted) {
    const base = atHK(dateOf(a.day), a.start);
    const r = a.remind ?? [];
    const place = a.address || a.place || '';
    if (r.includes('leave') || a.kind === 'travel' && a.mode && a.mode !== 'walk' && r.length) {
      for (const off of st.offsets) push({ id: `${a.id}:leave:${off}`, at: base - off * 60000, kind: 'leave', actId: a.id, title: off > 0 ? `Leave in ${off} min — ${a.title}` : `Time to leave — ${a.title}`, body: [place && `To: ${place}`, a.route, a.travel].filter(Boolean).join(' · ') });
    }
    if (r.includes('ticket')) { const t = tickets.find((x) => x.id === a.ticketId); push({ id: `${a.id}:ticket`, at: base - 45 * 60000, kind: 'ticket', actId: a.id, title: `Have ${t?.name ?? 'your ticket'} ready`, body: 'Open the original in the Tickets tab and raise screen brightness.' }); }
    if (r.includes('meal')) push({ id: `${a.id}:meal`, at: base - 15 * 60000, kind: 'meal', actId: a.id, title: `Meal break soon — ${a.title}`, body: 'Snacks and water within reach for Aya.' });
    if (r.includes('nap')) push({ id: `${a.id}:nap`, at: base - 10 * 60000, kind: 'nap', actId: a.id, title: 'Nap window starting', body: a.title });
    if (r.includes('restroom')) push({ id: `${a.id}:restroom`, at: base - 10 * 60000, kind: 'restroom', actId: a.id, title: 'Restroom + diaper bag stop', body: a.title });
    if (r.includes('last')) push({ id: `${a.id}:last`, at: base - 30 * 60000, kind: 'last', actId: a.id, title: `Last-transport check — ${a.title}`, body: 'Confirm the last train / ferry / pickup before committing.' });
    if (r.includes('passport')) push({ id: `${a.id}:pass`, at: base - 30 * 60000, kind: 'passport', actId: a.id, title: 'Passports & baggage check', body: a.title });
    if (a.kind !== 'rest' && a.kind !== 'travel' && a.kind !== 'flight') push({ id: `${a.id}:next`, at: base - 10 * 60000, kind: 'next', actId: a.id, title: `Next stop in 10 min — ${a.title}`, body: [place, a.skip && `Skip option: ${a.skip}`].filter(Boolean).join(' · ') });
  }
  for (const d of DEADLINES) push({ id: d.id, at: Date.parse(d.at), kind: 'deadline', title: d.title, body: d.body, link: d.link });
  return out.sort((a, b) => a.at - b.at || a.id.localeCompare(b.id));
}

const active = (r: Reminder, st: RemindState, now: number) => !st.dismissed[r.id] && (st.snoozed[r.id] ?? 0) <= now;
/** Due in the last `windowMin` minutes and not dismissed / snoozed. */
export const dueNow = (all: Reminder[], st: RemindState, now: number, windowMin = 90) => all.filter((r) => r.at <= now && now - r.at <= windowMin * 60000 && active(r, st, now));
export const upcoming = (all: Reminder[], st: RemindState, now: number) => all.filter((r) => r.at > now && !st.dismissed[r.id]);
