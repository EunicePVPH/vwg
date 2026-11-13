export function pad(n: number): string {
  return n < 10 ? '0' + n : String(n);
}

/** m:ss (or h:mm:ss) from seconds. Display only. */
export function fmtClock(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}

/** floor-based clock for live timers (so 119.9 s shows 1:59, not 2:00) */
export function fmtClockFloor(ms: number): string {
  return fmtClock(Math.floor(Math.max(0, ms) / 1000));
}

export function fmtMs(ms: number | null | undefined): string {
  if (ms == null) return '—';
  return fmtClock(ms / 1000);
}

export function fmtSecWords(sec: number | null | undefined): string {
  if (sec == null || !isFinite(sec)) return '—';
  const s = Math.round(Math.abs(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  const sign = sec < 0 ? '−' : '';
  if (m === 0) return `${sign}${r} sec`;
  return `${sign}${m} min ${r} sec`;
}

export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null || !isFinite(n)) return '—';
  return n.toFixed(digits);
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null || !isFinite(n)) return '—';
  const sign = n > 0 ? '+' : n < 0 ? '−' : '';
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

export function localDateStr(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fmtDateLong(ms: number): string {
  return new Date(ms).toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}

export function fmtDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' });
}

export function uid(prefix = 'obs'): string {
  const rnd = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rnd}`;
}
