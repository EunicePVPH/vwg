import { COUNTED_STATUSES, type Observation, type Phase, type Routine } from './types';

export function isCounted(o: Observation): boolean {
  return COUNTED_STATUSES.includes(o.status);
}

export function mean(xs: number[]): number | null {
  if (xs.length === 0) return null;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n − 1). Null when fewer than 2 values. */
export function sd(xs: number[]): number | null {
  if (xs.length < 2) return null;
  const m = mean(xs) as number;
  const v = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

export function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export interface Summary {
  n: number;
  mean: number | null;
  sd: number | null;
  min: number | null;
  max: number | null;
  median: number | null;
}

/** Summary of raw numeric values (seconds). Returns n = 0 and nulls for empty input; never fakes numbers. */
export function summarize(values: number[]): Summary {
  return {
    n: values.length,
    mean: mean(values),
    sd: sd(values),
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    median: median(values),
  };
}

export const durSec = (o: Observation) => o.durationMs / 1000;

export function countedObs(obs: Observation[]): Observation[] {
  return obs.filter(isCounted);
}

export function summaryByPhase(obs: Observation[], routineId: string | 'all' = 'all'): Record<Phase, Summary> {
  const out = {} as Record<Phase, Summary>;
  (['baseline', 'intervention', 'posttest'] as Phase[]).forEach((p) => {
    out[p] = summarize(
      countedObs(obs)
        .filter((o) => o.phase === p && (routineId === 'all' || o.routineId === routineId))
        .map(durSec),
    );
  });
  return out;
}

/** (post − base) / base × 100. Null if baseline missing or zero. */
export function pctChange(base: number | null, post: number | null): number | null {
  if (base == null || post == null || base === 0) return null;
  return ((post - base) / base) * 100;
}

export interface RoutineRow {
  routineId: string;
  routineName: string;
  byPhase: Record<Phase, Summary>;
}

export function summaryByRoutine(obs: Observation[]): RoutineRow[] {
  const ids = new Map<string, string>();
  countedObs(obs).forEach((o) => ids.set(o.routineId, o.routineName));
  return [...ids.entries()].map(([routineId, routineName]) => ({
    routineId,
    routineName,
    byPhase: summaryByPhase(obs, routineId),
  }));
}

export interface TrendPoint {
  date: string;
  mean: number;
  n: number;
  /** phase of the observations that day (most common) */
  phase: Phase;
}

export function dailyTrend(obs: Observation[], routineId: string | 'all' = 'all'): TrendPoint[] {
  const groups = new Map<string, Observation[]>();
  countedObs(obs)
    .filter((o) => routineId === 'all' || o.routineId === routineId)
    .forEach((o) => {
      const g = groups.get(o.date) ?? [];
      g.push(o);
      groups.set(o.date, g);
    });
  return [...groups.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, g]) => {
      const counts: Record<string, number> = {};
      g.forEach((o) => (counts[o.phase] = (counts[o.phase] ?? 0) + 1));
      const phase = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] as Phase;
      return { date, mean: mean(g.map(durSec)) as number, n: g.length, phase };
    });
}

export interface SavingsRow {
  routineId: string;
  routineName: string;
  nBase: number;
  nPost: number;
  meanBase: number;
  meanPost: number;
  /** seconds saved per transition (baseline mean − posttest mean); negative = slower */
  perTransitionSec: number;
  /** per-transition saving × number of posttest observations of this routine */
  observedTotalSec: number;
}

export const MIN_N_FOR_ESTIMATE = 3;

/**
 * Like-for-like estimate: only routines with at least MIN_N valid baseline AND posttest
 * observations are included. This is an estimate of time recovered in the observed
 * transitions, not proof of any learning improvement.
 */
export function estimateSavings(obs: Observation[], minN = MIN_N_FOR_ESTIMATE): SavingsRow[] {
  return summaryByRoutine(obs)
    .filter((r) => r.byPhase.baseline.n >= minN && r.byPhase.posttest.n >= minN)
    .map((r) => {
      const b = r.byPhase.baseline.mean as number;
      const p = r.byPhase.posttest.mean as number;
      return {
        routineId: r.routineId,
        routineName: r.routineName,
        nBase: r.byPhase.baseline.n,
        nPost: r.byPhase.posttest.n,
        meanBase: b,
        meanPost: p,
        perTransitionSec: b - p,
        observedTotalSec: (b - p) * r.byPhase.posttest.n,
      };
    });
}

/* ---------------- paired t-test (only offered when a pairing rule is approved) ---------------- */

export interface Pair {
  routineId: string;
  routineName: string;
  base: Observation;
  post: Observation;
}

/**
 * Pairing rule "routine-order": within each routine, the k-th valid baseline observation
 * (by start time) is paired with the k-th valid posttest observation. Extra unmatched
 * observations are left out. This rule must be approved by the research adviser.
 */
export function buildPairs(obs: Observation[], rule: 'routine-order'): Pair[] {
  if (rule !== 'routine-order') return [];
  const pairs: Pair[] = [];
  const by = new Map<string, { base: Observation[]; post: Observation[]; name: string }>();
  countedObs(obs).forEach((o) => {
    if (o.phase === 'intervention') return;
    const g = by.get(o.routineId) ?? { base: [], post: [], name: o.routineName };
    (o.phase === 'baseline' ? g.base : g.post).push(o);
    by.set(o.routineId, g);
  });
  by.forEach((g, routineId) => {
    const sortFn = (a: Observation, b: Observation) => a.startedAt.localeCompare(b.startedAt);
    g.base.sort(sortFn);
    g.post.sort(sortFn);
    const k = Math.min(g.base.length, g.post.length);
    for (let i = 0; i < k; i++) {
      pairs.push({ routineId, routineName: g.name, base: g.base[i], post: g.post[i] });
    }
  });
  return pairs;
}

function lgamma(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
export function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return (bt * betacf(a, b, x)) / a;
  return 1 - (bt * betacf(b, a, 1 - x)) / b;
}

/** Two-tailed p-value for Student's t. */
export function tTwoTailedP(t: number, df: number): number {
  return ibeta(df / (df + t * t), df / 2, 0.5);
}

export interface PairedT {
  n: number;
  meanDiff: number; // post − base, seconds
  sdDiff: number;
  t: number;
  df: number;
  p: number;
}

/** Paired-samples t-test on (post − base) differences. Null if fewer than 2 pairs or zero variance. */
export function pairedT(base: number[], post: number[]): PairedT | null {
  if (base.length !== post.length || base.length < 2) return null;
  const diffs = post.map((p, i) => p - base[i]);
  const md = mean(diffs) as number;
  const s = sd(diffs) as number;
  if (s === 0) return null;
  const n = diffs.length;
  const t = md / (s / Math.sqrt(n));
  const df = n - 1;
  return { n, meanDiff: md, sdDiff: s, t, df, p: tTwoTailedP(t, df) };
}

export type TTestAvailability =
  | { ok: true; result: PairedT; pairs: Pair[] }
  | { ok: false; reason: string };

export function paired(
  obs: Observation[],
  rule: 'unset' | 'routine-order',
  approved: boolean,
): TTestAvailability {
  if (rule === 'unset') return { ok: false, reason: 'No pairing method has been chosen yet.' };
  if (!approved) return { ok: false, reason: 'The pairing method has not been marked as approved by the research adviser.' };
  const pairs = buildPairs(obs, rule);
  if (pairs.length < 2) return { ok: false, reason: `Only ${pairs.length} valid matched pair${pairs.length === 1 ? '' : 's'} so far. At least 2 are needed.` };
  const res = pairedT(pairs.map((p) => durSec(p.base)), pairs.map((p) => durSec(p.post)));
  if (!res) return { ok: false, reason: 'The differences between pairs have no spread, so the test cannot be computed.' };
  return { ok: true, result: res, pairs };
}

export function routineById(routines: Routine[], id: string): Routine | undefined {
  return routines.find((r) => r.id === id);
}
