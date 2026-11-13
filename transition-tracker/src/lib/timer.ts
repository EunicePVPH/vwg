import type { ActiveSession, Phase, RoutineSnapshot } from './types';

/**
 * Pure timer logic. All durations come from wall-clock timestamps (Date.now()),
 * never from counting animation frames or interval ticks, so tab backgrounding,
 * throttled timers and re-renders cannot change the measurement.
 */

export interface StartArgs {
  id: string;
  demo: boolean;
  phase: Phase;
  trackerShown: boolean;
  routine: RoutineSnapshot;
  targetSec: number;
}

export function startSession(a: StartArgs, nowMs: number): ActiveSession {
  return {
    id: a.id,
    demo: a.demo,
    phase: a.phase,
    trackerShown: a.trackerShown,
    routine: a.routine,
    targetSec: a.targetSec,
    startedAtMs: nowMs,
    pausedAtMs: null,
    pausedTotalMs: 0,
    pauseCount: 0,
    endedAtMs: null,
    status: 'running',
    recovered: false,
    savedObsId: null,
  };
}

export function pauseSession(s: ActiveSession, nowMs: number): ActiveSession {
  if (s.status !== 'running') return s;
  return { ...s, status: 'paused', pausedAtMs: nowMs, pauseCount: s.pauseCount + 1 };
}

export function resumeSession(s: ActiveSession, nowMs: number): ActiveSession {
  if (s.status !== 'paused' || s.pausedAtMs == null) return s;
  return {
    ...s,
    status: 'running',
    pausedAtMs: null,
    pausedTotalMs: s.pausedTotalMs + (nowMs - s.pausedAtMs),
  };
}

/** Stops the stopwatch. The countdown reaching zero never calls this; only the teacher does. */
export function endSession(s: ActiveSession, nowMs: number): ActiveSession {
  if (s.status === 'ended') return s;
  const pausedTotalMs =
    s.pausedAtMs != null ? s.pausedTotalMs + (nowMs - s.pausedAtMs) : s.pausedTotalMs;
  return { ...s, status: 'ended', endedAtMs: nowMs, pausedAtMs: null, pausedTotalMs };
}

/** Actual elapsed (stopwatch) time in ms, excluding paused time. */
export function elapsedMs(s: ActiveSession, nowMs: number): number {
  const ref = s.endedAtMs ?? nowMs;
  const pausedNow = s.pausedAtMs != null ? ref - s.pausedAtMs : 0;
  return Math.max(0, ref - s.startedAtMs - s.pausedTotalMs - pausedNow);
}

/** Countdown remaining in ms. Can go negative: the stopwatch keeps running. */
export function remainingMs(s: ActiveSession, nowMs: number): number {
  return s.targetSec * 1000 - elapsedMs(s, nowMs);
}

export type Urgency = 'plenty' | 'half' | 'low' | 'over';

export function urgency(remaining: number, targetSec: number): Urgency {
  if (remaining <= 0) return 'over';
  const f = remaining / (targetSec * 1000);
  if (f > 0.5) return 'plenty';
  if (f > 0.25) return 'half';
  return 'low';
}

/** Recovery after a page reload: timestamps are still valid, but flag the record for review. */
export function recoverSession(s: ActiveSession): ActiveSession | null {
  if (s.status === 'ended') return null; // already saved when it ended
  return { ...s, recovered: true };
}
