export const HK_TZ = 'Asia/Hong_Kong';
export const TRIP_START = '2026-12-07';
export const TRIP_END = '2026-12-11';
export const DEPART_HOME = '2026-12-07T00:30:00+08:00';

/** Clock offset so Settings can preview a trip day. null = real time. */
let simulated: number | null = null;
export const setSimulatedNow = (iso: string | null) => { simulated = iso ? new Date(iso).getTime() : null; };
export const nowMs = () => (simulated !== null ? simulated : Date.now());

const f = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: HK_TZ, ...o });
export function hkParts(ms = nowMs()) {
  const parts = Object.fromEntries(
    f({ year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date(ms)).map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hh: +parts.hour, mm: +parts.minute, minutes: +parts.hour * 60 + +parts.minute };
}
export const hkClock = (ms = nowMs()) => f({ hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(ms));
export const hkDateLong = (ms = nowMs()) => f({ weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(ms));

export function toMin(t: string): number { const [h, m] = t.split(':').map(Number); return h * 60 + m; }
export function fmt12(t: string): string {
  const [h, m] = t.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ap}`;
}
export function fmtDur(mins: number): string {
  const h = Math.floor(mins / 60), m = mins % 60;
  return h ? (m ? `${h} h ${m} min` : `${h} h`) : `${m} min`;
}
export function dateLabel(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(new Date(iso + 'T12:00:00Z'));
}
export function daysUntil(iso: string, ms = nowMs()): number {
  const today = hkParts(ms).date;
  return Math.round((Date.parse(iso + 'T00:00:00Z') - Date.parse(today + 'T00:00:00Z')) / 86400000);
}
export function greeting(ms = nowMs()): string {
  const h = hkParts(ms).hh;
  return h < 5 ? 'Good night' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}
export type Phase = 'before' | 'during' | 'after';
export function tripPhase(ms = nowMs()): Phase {
  const d = hkParts(ms).date;
  return d < TRIP_START ? 'before' : d > TRIP_END ? 'after' : 'during';
}
export function currentDayId(ms = nowMs()): number | null {
  const d = hkParts(ms).date;
  const n = Math.round((Date.parse(d + 'T00:00:00Z') - Date.parse(TRIP_START + 'T00:00:00Z')) / 86400000) + 1;
  return n >= 1 && n <= 5 ? n : null;
}
