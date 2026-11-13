import { describe, expect, it } from 'vitest';
import { mean, sd, summarize, pctChange, tTwoTailedP, pairedT, paired, estimateSavings } from './stats';
import { generateDemoObservations } from './demo';
import type { Observation } from './types';

describe('descriptive statistics', () => {
  it('computes mean and sample SD from raw numbers', () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(sd([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
  it('returns no fake numbers for empty data', () => {
    const s = summarize([]);
    expect(s.n).toBe(0);
    expect(s.mean).toBeNull();
    expect(s.sd).toBeNull();
  });
  it('SD is null with a single value', () => {
    expect(sd([5])).toBeNull();
  });
  it('percent change needs a baseline', () => {
    expect(pctChange(200, 150)).toBe(-25);
    expect(pctChange(null, 150)).toBeNull();
    expect(pctChange(0, 150)).toBeNull();
  });
});

describe('t distribution', () => {
  it('matches a known two-tailed p-value (t=4.243, df=4 → ≈0.0132)', () => {
    expect(tTwoTailedP(4.2426, 4)).toBeCloseTo(0.01324, 4);
  });
  it('paired t on a worked example', () => {
    const r = pairedT([10, 10, 10, 10, 10], [9, 8, 7, 6, 5])!; // diffs −1..−5
    expect(r.meanDiff).toBeCloseTo(-3, 6);
    expect(r.t).toBeCloseTo(-4.2426, 3);
    expect(r.df).toBe(4);
    expect(r.p).toBeCloseTo(0.01324, 4);
  });
  it('returns null when there are fewer than 2 pairs', () => {
    expect(pairedT([1], [2])).toBeNull();
  });
});

describe('t-test gating', () => {
  const obs: Observation[] = generateDemoObservations();
  it('is withheld when no pairing rule is chosen', () => {
    expect(paired(obs, 'unset', true).ok).toBe(false);
  });
  it('is withheld when the rule is not approved', () => {
    expect(paired(obs, 'routine-order', false).ok).toBe(false);
  });
  it('is withheld with no data', () => {
    expect(paired([], 'routine-order', true).ok).toBe(false);
  });
  it('runs only when a rule is chosen and approved and pairs exist', () => {
    expect(paired(obs, 'routine-order', true).ok).toBe(true);
  });
});

describe('time-savings estimate', () => {
  it('needs enough baseline and posttest observations per routine', () => {
    expect(estimateSavings([]).length).toBe(0);
    const rows = estimateSavings(generateDemoObservations());
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach((r) => expect(r.perTransitionSec).toBeCloseTo(r.meanBase - r.meanPost, 6));
  });
});
