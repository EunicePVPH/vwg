import type { Activity, Expense, ShoppingItem } from '../types';
import { catOf, normCat } from './trip';
import { toHKD, type Rates } from './money';

/** One place for the budget maths, used by both Home and Expenses. All values in HKD. */
export function computeBudget(acts: Activity[], exps: Expense[], shop: ShoppingItem[], checks: Record<string, boolean>, r: Rates) {
  const hk = (e: Expense) => (e.amount ? toHKD(e.amount, e.currency, r) : 0);
  const spend = exps.filter((e) => e.kind === 'spend');
  const prepaid = spend.filter((e) => e.status === 'paid').reduce((n, e) => n + hk(e), 0);
  const actual = spend.filter((e) => e.status === 'actual').reduce((n, e) => n + hk(e), 0);
  const paidTotal = prepaid + actual;
  // Still to spend: per category, planned minus what you already logged as spent (no double counting)
  const est: Record<string, number> = {}; const act: Record<string, number> = {};
  for (const a of acts) if (a.costHKD && a.priority !== 'optional') est[catOf(a)] = (est[catOf(a)] ?? 0) + a.costHKD;
  for (const i of shop) if (!checks['shop:' + i.id] && i.price) est['Shopping'] = (est['Shopping'] ?? 0) + toHKD(i.price, i.currency, r);
  for (const e of spend) if (e.amount) { if (e.status === 'estimated') est[normCat(e.category)] = (est[normCat(e.category)] ?? 0) + hk(e); if (e.status === 'actual') act[normCat(e.category)] = (act[normCat(e.category)] ?? 0) + hk(e); }
  const remaining = Object.keys(est).reduce((n, c) => n + Math.max(0, est[c] - (act[c] ?? 0)), 0);
  const optionalTotal = acts.filter((a) => a.priority === 'optional' && a.costHKD).reduce((n, a) => n + (a.costHKD ?? 0), 0) + spend.filter((e) => e.status === 'optional').reduce((n, e) => n + hk(e), 0);
  return { prepaid, actual, paidTotal, remaining, optionalTotal, everything: paidTotal + remaining };
}
