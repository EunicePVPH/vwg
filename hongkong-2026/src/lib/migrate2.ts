// One-time, non-destructive migration to the Nov 27 plan. Nothing is deleted: your edits to the old plan are
// copied into a change log, your own added activities stay, and the old plan stays readable.
import { LEGACY_ACTIVITIES } from '../data/legacy';
import { EXPENSES } from '../data/seed';
import { V2_TITLES } from '../data/v2titles';
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

/** Second one-time step: the itinerary & directions supplement (Day 0, step-by-step directions, alternatives, Avenue of Stars…). Additive: your edits stay on top. */
export function migrateSupplement(s: UserState): UserState {
  if (s.itinV3) return s;
  const at = Date.now();
  const log: ChangeEntry[] = [...(s.changeLog ?? [])];
  log.push({ id: 'chg-v3', at, kind: 'update', title: 'Itinerary & directions supplement added (Nov 27)', detail: 'Added: Day 0 (before you leave), step-by-step offline directions for every leg, alternative routes, delay fallbacks, Avenue of Stars on Dec 8 (Bruce Lee statue + handprints, included), Hong Kong 1 as optional, airport procedures for Dec 7 and Dec 11, family-energy mode, delay shifting, route choice, a “Verify before departure” screen and a bigger booklet. Your own edits, expenses, checklists and documents were not touched.' });
  const patch = s.col.activities?.patch ?? {};
  const kept = Object.keys(patch).filter((id) => V2_TITLES[id]);
  if (kept.length) log.push({ id: 'chg-v3-kept', at, kind: 'update', title: `Your edits to ${kept.length} stop${kept.length > 1 ? 's' : ''} were kept`, detail: 'Your saved times, costs and notes still sit on top of the new text for: ' + kept.map((id) => V2_TITLES[id]).join(' · ') + '. Open the stop and use “Restore original” if you want the new wording instead.' });
  return { ...s, itinV3: true, changeLog: log };
}

/** Third one-time step: the Nov 27 v17 audit (verified official facts, conditional Peak timing, labels). Your own edits are never replaced. */
export const AUDIT_IDS: Record<string, string> = {
  'v2-2-01': 'Uber to the Peak', 'v2-2-02': 'Peak Tram — ride up', 'v2-2-03': 'Sky Terrace 428 (provisional, voucher-dependent)', 'v2-2-04': 'Peak → Ocean Park by MTR (Exit B same-level)', 'v2-2-05': 'Ocean Park entry (hours, no park app)',
  'v2-2-14': 'Central Winter Wonderland (7–11 PM, every 30 min)', 'v2-2-16': 'Star Ferry (HK$4 / HK$5, last ~23:30)', 'v2-2-17': 'Tsim Sha Tsui projections (7–11 PM)', 'v2-3-01': 'Minibus 88F (HK$4.30, short-working)',
  'v2-3-03': 'East TST Exit P2 (lift verified)', 'v2-3-04': 'Science Museum (Wednesday hours, free)', 'v2-3-09': 'Disneyland → Temple Street (decide on the day)', 'v2-3-10': 'Temple Street (easy to cut if tired)',
  'v2-4-06': 'Friendtastic! (~30 min)', 'v2-4-08': 'Momentous (~20 min, day-specific time to verify)', 'v2-5-03': 'HKIA T2 Aisle R (verified)', 'v2-5-04': 'T2 → T1 airport train (verified)',
};
export function migrateAudit(s: UserState): UserState {
  if (s.itinV4) return s;
  const at = Date.now();
  const log: ChangeEntry[] = [...(s.changeLog ?? [])];
  log.push({ id: 'chg-v4', at, kind: 'update', title: 'Audit corrections applied (Nov 27)', detail: 'Verified official facts were added and the Peak timing is now conditional on YOUR voucher (Branch A 8:30 / Branch B 10 AM). Fixed: 88F fare HK$4.30, Star Ferry HK$4/HK$5 and last sailing, Exit B same-level, Exit P2 lift, WinterFest dates and 7 PM shows, T2 Aisle R → T1 airport train, Momentous ~20 min, Friendtastic ~30 min, Disney → Temple Street now “decide on the day”, Temple Street marked easy to cut if tired, and new labels: Purchased per user / Provider day confirmed / Pending final ticket conditions / Verified as of Nov 27. Your expenses (₱108,585.90 paid), edits and documents were not touched.' });
  const patch = s.col.activities?.patch ?? {};
  const kept = Object.keys(patch).filter((id) => AUDIT_IDS[id]);
  if (kept.length) log.push({ id: 'chg-v4-kept', at, kind: 'update', title: `Your edits on ${kept.length} corrected stop${kept.length > 1 ? 's' : ''} were kept`, detail: 'The corrected wording is hidden behind your saved edit for: ' + kept.map((id) => AUDIT_IDS[id]).join(' · ') + '. Open the stop, tap Edit, and use “Restore original” to see the corrected text.' });
  return { ...s, itinV4: true, changeLog: log };
}

/** Fourth one-time step: booking documents checked (PAL, Cebu Pacific, Expedia, Klook). Nothing you entered is replaced. */
export function migrateBookings(s: UserState): UserState {
  if (s.itinV5) return s;
  const log: ChangeEntry[] = [...(s.changeLog ?? [])];
  log.push({ id: 'chg-v5', at: Date.now(), kind: 'update', title: 'Booking documents checked (Nov 27)', detail: 'Flights, hotel, Ocean Park and Observation Wheel details were compared with your original PDFs. Fixed: the hotel phone is +852 2129 1188; the Dec 11 Cebu Pacific flight now shows Terminal 2; the four flights are marked confirmed; the Cebu return seats are recorded (Keren 26G, Gilbert 26J, Aya 26H); the PAL e-tickets are recorded as having NO included checked baggage; the Observation Wheel voucher is valid on Dec 8 only with no time slot. Your Cebu Pacific tracker amount (₱42,087.93) was left as you entered it — the payment page shows ₱40,815.93, so please check your card statement. No expense was added, removed or changed.' });
  return { ...s, itinV5: true, changeLog: log };
}
