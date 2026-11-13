export type Phase = 'baseline' | 'intervention' | 'posttest';
export type ObsStatus = 'valid' | 'manual' | 'review' | 'interrupted' | 'excluded';

export const PHASES: Phase[] = ['baseline', 'intervention', 'posttest'];
export const PHASE_LABEL: Record<Phase, string> = {
  baseline: 'Baseline (pretest)',
  intervention: 'Intervention',
  posttest: 'Posttest',
};
export const PHASE_SHORT: Record<Phase, string> = {
  baseline: 'Baseline',
  intervention: 'Intervention',
  posttest: 'Posttest',
};
export const STATUS_LABEL: Record<ObsStatus, string> = {
  valid: 'Valid',
  manual: 'Manual entry',
  review: 'Needs review',
  interrupted: 'Interrupted',
  excluded: 'Excluded',
};
/** Only these statuses are used in means, SDs, charts and estimates. */
export const COUNTED_STATUSES: ObsStatus[] = ['valid', 'manual'];

export type IconKey =
  | 'swap' | 'brush' | 'sun' | 'users' | 'book' | 'pencil' | 'calc' | 'flask'
  | 'palette' | 'music' | 'globe' | 'backpack' | 'bell' | 'footprints' | 'star' | 'shapes';

export interface Routine {
  id: string;
  title: string;
  icon: IconKey;
  steps: string[];
  targetSec: number;
  cueEnabled: boolean;
  /** seconds remaining at which the gentle warning cue plays */
  warnSec: number;
}
export type RoutineSnapshot = Routine;

export type PosttestUse = 'unset' | 'with-tracker' | 'without-tracker';
export type PairingRule = 'unset' | 'routine-order';
export type MotionPref = 'system' | 'reduced' | 'full';

export interface Settings {
  schoolName: string;
  className: string;
  grade: string;
  phase: Phase;
  posttestUse: PosttestUse;
  readinessType: 'percent' | 'count';
  readinessValue: number | null;
  readinessConfirmed: boolean;
  soundOn: boolean;
  volume: number; // 0..1
  motion: MotionPref;
  demoMode: boolean;
  pairingRule: PairingRule;
  pairingApproved: boolean;
  defaultTargetSec: number;
  settingsVersion: number;
  /** true while the readiness / posttest / pairing choices are demo placeholders, not approved values */
  prototypeDefaults: boolean;
}

export interface AuditEntry {
  at: string; // ISO
  field: string;
  from: string;
  to: string;
  reason: string;
}

export interface Observation {
  id: string;
  isDemo: boolean;
  className: string;
  schoolName: string;
  date: string; // YYYY-MM-DD (local)
  phase: Phase;
  routineId: string;
  routineName: string;
  routineSnapshot: RoutineSnapshot;
  startedAt: string; // ISO
  endedAt: string; // ISO
  /** actual measured transition time in milliseconds (excludes paused time) */
  durationMs: number;
  originalDurationMs: number | null;
  pausedMs: number;
  pauseCount: number;
  /** countdown target shown to pupils, if any */
  targetSec: number | null;
  /** was the tracker display visible to pupils for this observation? */
  trackerShown: boolean;
  remindersCount: number | null;
  reminderSec: number | null;
  present: number | null;
  ready: number | null;
  readinessType: 'percent' | 'count' | null;
  readinessValue: number | null;
  notes: string;
  status: ObsStatus;
  statusReason: string;
  source: 'timer' | 'manual';
  flags: string[];
  createdAt: string;
  updatedAt: string;
  audit: AuditEntry[];
}

export interface ActiveSession {
  id: string;
  demo: boolean;
  phase: Phase;
  trackerShown: boolean;
  routine: RoutineSnapshot;
  targetSec: number;
  startedAtMs: number;
  pausedAtMs: number | null;
  pausedTotalMs: number;
  pauseCount: number;
  endedAtMs: number | null;
  status: 'running' | 'paused' | 'ended';
  recovered: boolean;
  savedObsId: string | null;
}

export const DEMO_LABEL = 'DEMONSTRATION DATA — NOT ACTUAL RESEARCH RESULTS';
export const RESEARCH_TITLE =
  'Helping Grade 4 Adapt: Improving Classroom Routines to Save Learning Time Using Transition Tracker';
