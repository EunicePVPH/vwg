import { DEFAULT_ROUTINES } from './defaults';
import { localDateStr } from './format';
import type { Observation, Phase } from './types';

/** Deterministic pseudo-random numbers so the demo looks the same every time. */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// invented sample means in seconds, by routine and phase. These are NOT research findings.
const MEANS: Record<string, Record<Phase, number>> = {
  r_switch: { baseline: 205, intervention: 160, posttest: 128 },
  r_clean: { baseline: 330, intervention: 265, posttest: 215 },
  r_recess: { baseline: 410, intervention: 330, posttest: 270 },
  r_groups: { baseline: 240, intervention: 190, posttest: 150 },
};

const SLOTS = [[8, 20], [9, 45], [10, 15], [13, 5]];

/** Sample records only. Every record is flagged isDemo and kept in a separate store. */
export function generateDemoObservations(nowMs = Date.now()): Observation[] {
  const rand = rng(20261125);
  const out: Observation[] = [];
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);

  const days: { d: Date; phase: Phase }[] = [];
  for (let back = 21; back >= 0; back--) {
    const d = new Date(today);
    d.setDate(today.getDate() - back);
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    const phase: Phase = back > 13 ? 'baseline' : back > 6 ? 'intervention' : 'posttest';
    days.push({ d, phase });
  }

  let k = 0;
  days.forEach(({ d, phase }) => {
    const count = 3 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const routine = DEFAULT_ROUTINES[(k + i) % DEFAULT_ROUTINES.length];
      const base = MEANS[routine.id][phase];
      const noise = (rand() + rand() + rand() - 1.5) * 0.45; // roughly bell-shaped
      const sec = Math.max(30, Math.round(base * (1 + noise)));
      const [h, m] = SLOTS[i % SLOTS.length];
      const start = new Date(d);
      start.setHours(h, m + Math.floor(rand() * 10), Math.floor(rand() * 60), 0);
      const startMs = start.getTime();
      const endMs = startMs + sec * 1000;
      const iso = new Date(startMs).toISOString();
      const trackerShown = phase !== 'baseline';
      const present = 38 + Math.floor(rand() * 3);
      out.push({
        id: `demo_${out.length + 1}`,
        isDemo: true,
        className: 'Grade 4 (demo)',
        schoolName: 'San Jose Central School',
        date: localDateStr(startMs),
        phase,
        routineId: routine.id,
        routineName: routine.title,
        routineSnapshot: JSON.parse(JSON.stringify(routine)),
        startedAt: iso,
        endedAt: new Date(endMs).toISOString(),
        durationMs: sec * 1000,
        originalDurationMs: null,
        pausedMs: 0,
        pauseCount: 0,
        targetSec: trackerShown ? routine.targetSec : null,
        trackerShown,
        remindersCount: phase === 'baseline' ? 2 + Math.floor(rand() * 3) : Math.floor(rand() * 3),
        reminderSec: null,
        present,
        ready: present - Math.floor(rand() * 3),
        readinessType: 'percent',
        readinessValue: 90,
        notes: '',
        status: 'valid',
        statusReason: '',
        source: 'timer',
        flags: [],
        createdAt: iso,
        updatedAt: iso,
        audit: [],
      });
    }
    k++;
  });

  // a couple of realistic non-valid examples so filters and badges are visible
  if (out.length > 12) {
    out[6] = { ...out[6], status: 'interrupted', statusReason: 'Fire drill practice during transition (sample).' };
    out[11] = { ...out[11], status: 'excluded', statusReason: 'Teacher called away mid-transition (sample).' };
  }
  return out;
}
