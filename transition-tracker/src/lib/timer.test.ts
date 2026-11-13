import { describe, expect, it } from 'vitest';
import { elapsedMs, endSession, pauseSession, remainingMs, resumeSession, startSession, urgency } from './timer';
import { DEFAULT_ROUTINES } from './defaults';

const mk = (targetSec: number, t0 = 1_000_000) =>
  startSession({ id: 's1', demo: false, phase: 'intervention', trackerShown: true, routine: DEFAULT_ROUTINES[0], targetSec }, t0);

describe('actual elapsed vs countdown target', () => {
  it('target 120 s, Class Ready at 200 s stores 200 s (not 120)', () => {
    const s = mk(120);
    const ended = endSession(s, 1_000_000 + 200_000);
    expect(elapsedMs(ended, 9_999_999)).toBe(200_000);
  });
  it('countdown goes negative while the stopwatch keeps counting', () => {
    const s = mk(120);
    expect(remainingMs(s, 1_000_000 + 150_000)).toBe(-30_000);
    expect(elapsedMs(s, 1_000_000 + 150_000)).toBe(150_000);
    expect(s.status).toBe('running'); // never auto-stopped at zero
  });
  it('paused time is excluded and counted', () => {
    let s = mk(120);
    s = pauseSession(s, 1_000_000 + 30_000);
    s = resumeSession(s, 1_000_000 + 50_000);
    const ended = endSession(s, 1_000_000 + 100_000);
    expect(elapsedMs(ended, 0)).toBe(80_000);
    expect(ended.pausedTotalMs).toBe(20_000);
    expect(ended.pauseCount).toBe(1);
  });
  it('ending while paused closes the pause', () => {
    let s = mk(120);
    s = pauseSession(s, 1_000_000 + 40_000);
    const ended = endSession(s, 1_000_000 + 70_000);
    expect(elapsedMs(ended, 0)).toBe(40_000);
  });
});

describe('urgency colours', () => {
  it('moves plenty → half → low → over', () => {
    expect(urgency(100_000, 120)).toBe('plenty');
    expect(urgency(50_000, 120)).toBe('half');
    expect(urgency(20_000, 120)).toBe('low');
    expect(urgency(0, 120)).toBe('over');
    expect(urgency(-5_000, 120)).toBe('over');
  });
});
