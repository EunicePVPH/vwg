import type { Inv, Place } from './packTypes';
import type { UserState, CollState } from '../state/store';
import { INV } from '../data/pack';
import { PACKING } from '../data/seed';

export const isNN = (i: { notNeeded?: boolean; shop?: string }) => !!i.notNeeded || i.shop === 'Not Needed';
export const packedQty = (i: Inv) => i.places.reduce((n, p) => n + p.packed, 0);
export const itemDone = (i: Inv) => !!i.worn || (i.places.length > 0 && packedQty(i) >= i.qty);
export const placeDone = (p: Place) => p.qty > 0 && p.packed >= p.qty;
export const shopReady = (i: Inv) => i.shop === 'Already Have' || i.shop === 'Received';
/** Optional items only count toward totals once they are packed / ready; Not Needed never counts. */
export const countsFor = (i: Inv, done: boolean) => !isNN(i) && (i.required || done);

export interface Tally { done: number; total: number }
export function tally(rows: { done: boolean; counts: boolean }[]): Tally {
  const r = rows.filter((x) => x.counts);
  return { done: r.filter((x) => x.done).length, total: r.length };
}
/** Whole-trip packing progress (used on Home). */
export function overallPack(items: Inv[]): Tally {
  const rows: { done: boolean; counts: boolean }[] = [];
  for (const i of items) {
    if (isNN(i)) continue;
    if (i.worn) rows.push({ done: true, counts: true });
    else if (i.places.length) for (const p of i.places) rows.push({ done: placeDone(p), counts: i.required || placeDone(p) });
    else if (i.group === 'clothes') rows.push({ done: false, counts: i.required });
  }
  return tally(rows);
}

// ---------- one-time, non-destructive migration of the old flat packing list ----------
const STOP = new Set(['extra', 'and', 'the', 'for', 'a', 'of', 'to', 'if', 'needed', 'your', 'all', 'with']);
const tokens = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w && !STOP.has(w)).map((w) => w.replace(/s$/, '')));
function similar(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return false;
  const inter = [...a].filter((x) => b.has(x)).length;
  return inter / Math.max(a.size, b.size) >= 0.6 || (Math.min(a.size, b.size) >= 2 && inter === Math.min(a.size, b.size));
}
const GROUP_MAP: Record<string, { cat: string; bag: string }> = {
  Documents: { cat: 'Documents & travel prep', bag: 'kcabin' },
  'Aya\'s backpack (Gilbert carries)': { cat: 'Aya: hygiene, feeding & comfort', bag: 'aya' },
  'Keren\'s feeding items': { cat: 'Only if currently used', bag: 'kcabin' },
  Clothes: { cat: 'Clothes (earlier list)', bag: 'main' },
  Gadgets: { cat: 'Electronics & connectivity', bag: 'kcabin' },
  'Health & toiletries': { cat: 'Medicines & first aid', bag: 'kcabin' },
  Stroller: { cat: 'Stroller', bag: 'stroller' },
};
const emptyCol = (): CollState => ({ patch: {}, added: [], removed: [] });

export function migratePacking(s: UserState): UserState {
  if (s.packMigrated) return s;
  const old = s.col.packing ?? emptyCol();
  const removed = new Set(old.removed);
  const oldItems = [
    ...PACKING.filter((p) => !removed.has(p.id)).map((p) => ({ ...p, ...(old.patch[p.id] as object | undefined) })),
    ...old.added.filter((a) => !removed.has((a as { id: string }).id)).map((a) => ({ ...(a as object), ...(old.patch[(a as { id: string }).id] as object | undefined) })),
  ] as { id: string; label: string; group: string; owner?: string }[];

  const inv: CollState = { patch: { ...(s.col.inv?.patch ?? {}) }, added: [...(s.col.inv?.added ?? [])], removed: [...(s.col.inv?.removed ?? [])] };
  const taken = new Set<string>();
  for (const o of oldItems) {
    const packed = !!s.checks['pack:' + o.id];
    const isCustom = !PACKING.some((p) => p.id === o.id);
    const renamed = old.patch[o.id]?.label !== undefined;
    const ot = tokens(o.label);
    const match = INV.find((i) => i.group === 'general' && !taken.has(i.id) && similar(ot, tokens(i.name)));
    if (match) {
      taken.add(match.id);
      if (renamed || isCustom) inv.patch[match.id] = { ...(inv.patch[match.id] ?? {}), name: o.label };
      if (packed) {
        const places: Place[] = match.places.length ? match.places.map((p) => ({ ...p, packed: p.qty })) : [{ bag: 'main', qty: match.qty, packed: match.qty }];
        inv.patch[match.id] = { ...(inv.patch[match.id] ?? {}), places, ...(match.shop === 'Not Reviewed' ? { shop: 'Already Have' } : {}) };
      }
    } else if (packed || isCustom || renamed) {
      const g = GROUP_MAP[o.group] ?? { cat: 'Other', bag: 'main' };
      inv.added.push({
        id: 'o-' + o.id, name: o.label, qty: 1, cat: g.cat, person: (['Keren', 'Gilbert', 'Aya'].includes(o.owner ?? '') ? o.owner : 'Shared') as Inv['person'], required: true, priority: 'normal', group: 'general',
        shop: packed ? 'Already Have' : 'Not Reviewed', currency: 'PHP', places: [{ bag: g.bag, qty: 1, packed: packed ? 1 : 0 }], shopListed: true,
        notes: 'Carried over from your earlier packing list.',
      } satisfies Inv);
    }
  }
  return { ...s, col: { ...s.col, inv }, packMigrated: true };
}
