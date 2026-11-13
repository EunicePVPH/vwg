import { DEMO_LABEL, RESEARCH_TITLE, type Observation } from './types';

const COLS: { key: string; get: (o: Observation) => string | number | boolean | null }[] = [
  { key: 'data_label', get: (o) => (o.isDemo ? DEMO_LABEL : 'ACTUAL RESEARCH RECORD') },
  { key: 'id', get: (o) => o.id },
  { key: 'school', get: (o) => o.schoolName },
  { key: 'class', get: (o) => o.className },
  { key: 'date', get: (o) => o.date },
  { key: 'phase', get: (o) => o.phase },
  { key: 'routine_id', get: (o) => o.routineId },
  { key: 'routine_name', get: (o) => o.routineName },
  { key: 'start_timestamp', get: (o) => o.startedAt },
  { key: 'end_timestamp', get: (o) => o.endedAt },
  { key: 'duration_ms', get: (o) => o.durationMs },
  { key: 'duration_sec', get: (o) => Math.round(o.durationMs) / 1000 },
  { key: 'original_duration_ms', get: (o) => o.originalDurationMs },
  { key: 'paused_ms', get: (o) => o.pausedMs },
  { key: 'pause_count', get: (o) => o.pauseCount },
  { key: 'target_countdown_sec', get: (o) => o.targetSec },
  { key: 'tracker_shown_to_pupils', get: (o) => o.trackerShown },
  { key: 'teacher_reminders_count', get: (o) => o.remindersCount },
  { key: 'teacher_reminders_total_sec', get: (o) => o.reminderSec },
  { key: 'class_size_present', get: (o) => o.present },
  { key: 'ready_count', get: (o) => o.ready },
  { key: 'readiness_criterion_type', get: (o) => o.readinessType },
  { key: 'readiness_criterion_value', get: (o) => o.readinessValue },
  { key: 'status', get: (o) => o.status },
  { key: 'status_reason', get: (o) => o.statusReason },
  { key: 'counted_in_statistics', get: (o) => o.status === 'valid' || o.status === 'manual' },
  { key: 'source', get: (o) => o.source },
  { key: 'flags', get: (o) => o.flags.join(';') },
  { key: 'notes', get: (o) => o.notes },
  { key: 'routine_snapshot_steps', get: (o) => o.routineSnapshot.steps.join(' | ') },
  { key: 'routine_snapshot_target_sec', get: (o) => o.routineSnapshot.targetSec },
  { key: 'created_at', get: (o) => o.createdAt },
  { key: 'updated_at', get: (o) => o.updatedAt },
  { key: 'audit_trail_json', get: (o) => (o.audit.length ? JSON.stringify(o.audit) : '') },
];

function esc(v: string | number | boolean | null): string {
  if (v == null) return '';
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** UTF-8 BOM first so Excel opens it correctly. */
export function observationsToCsv(obs: Observation[]): string {
  const head = COLS.map((c) => c.key).join(',');
  const rows = obs.map((o) => COLS.map((c) => esc(c.get(o))).join(','));
  return '﻿' + [head, ...rows].join('\r\n') + '\r\n';
}

export const CSV_COLUMNS = COLS.map((c) => c.key);

export function exportFilename(kind: 'csv' | 'json', demo: boolean): string {
  const d = new Date().toISOString().slice(0, 10);
  return `${demo ? 'DEMO_NOT_RESEARCH_' : ''}transition-tracker_${kind === 'csv' ? 'observations' : 'backup'}_${d}.${kind}`;
}

export const REPORT_TITLE = RESEARCH_TITLE;
