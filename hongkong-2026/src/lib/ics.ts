// Calendar export (.ics). This only creates a file; it never touches your calendar. You import it yourself.
import type { Activity, Day } from '../types';
import { DEADLINES } from '../data/gates';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
function fold(line: string): string {
  const enc = new TextEncoder(); if (enc.encode(line).length <= 74) return line;
  let out = ''; let cur = '';
  for (const ch of line) { if (enc.encode(cur + ch).length > (out ? 73 : 74)) { out += (out ? '\r\n ' : '') + cur; cur = ch; } else cur += ch; }
  return out + (out ? '\r\n ' : '') + cur;
}
const stamp = (date: string, hhmm: string, plusMin = 0) => {
  const t = Date.parse(`${date}T${hhmm}:00Z`) + plusMin * 60000; // wall-clock arithmetic only; TZID carries the zone
  const d = new Date(t); const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00`;
};
const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export function buildIcs(acts: Activity[], days: Day[], opts: { alarms: number[]; dayId?: number; deadlines?: boolean }): string {
  const L: string[] = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hong Kong 2026 Family Trip//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Hong Kong 2026 (draft)', 'X-WR-TIMEZONE:Asia/Hong_Kong',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Hong_Kong', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0800', 'TZOFFSETTO:+0800', 'TZNAME:HKT', 'END:STANDARD', 'END:VTIMEZONE'];
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const list = acts.filter((a) => (opts.dayId !== undefined ? a.day === opts.dayId : true)).sort((a, b) => a.day - b.day || a.start.localeCompare(b.start));
  for (const a of list) {
    const date = days.find((d) => d.id === a.day)?.date; if (!date) continue;
    const endMin = a.end ? toMin(a.end) - toMin(a.start) : 30;
    const desc = ['DRAFT plan — verify before relying on it.', a.booking, a.flex && `Window: ${a.flex}`, a.route && `Route: ${a.route}`, a.travel && `Travel: ${a.travel}`, a.walk && `Walking: ${a.walk}`, a.notes, a.skip && `Skip option: ${a.skip}`, ...(a.verify ?? []).map((v) => `VERIFY ${v.label}: ${v.url}`)].filter(Boolean).join('\n').slice(0, 900);
    L.push('BEGIN:VEVENT', `UID:${a.id}@hk2026.local`, `DTSTAMP:${now}`, `DTSTART;TZID=Asia/Hong_Kong:${stamp(date, a.start)}`, `DTEND;TZID=Asia/Hong_Kong:${stamp(date, a.start, Math.max(5, endMin))}`,
      `SUMMARY:${esc(a.title.replace(/\s{2,}/g, ' '))}`, `LOCATION:${esc(a.address || a.place || '')}`, `DESCRIPTION:${esc(desc)}`, `STATUS:${a.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`);
    for (const m of opts.alarms) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(a.title)}`, `TRIGGER:-PT${m}M`, 'END:VALARM');
    L.push('END:VEVENT');
  }
  if (opts.deadlines !== false && opts.dayId === undefined) for (const d of DEADLINES) {
    const dt = new Date(Date.parse(d.at) + 8 * 3600000); const iso = dt.toISOString(); const date = iso.slice(0, 10); const hhmm = iso.slice(11, 16);
    L.push('BEGIN:VEVENT', `UID:${d.id}@hk2026.local`, `DTSTAMP:${now}`, `DTSTART;TZID=Asia/Hong_Kong:${stamp(date, hhmm)}`, `DTEND;TZID=Asia/Hong_Kong:${stamp(date, hhmm, 30)}`, `SUMMARY:${esc(d.title)}`, `DESCRIPTION:${esc(d.body)}`, 'STATUS:TENTATIVE');
    for (const m of opts.alarms) L.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(d.title)}`, `TRIGGER:-PT${m}M`, 'END:VALARM');
    L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');
  return L.map(fold).join('\r\n') + '\r\n';
}
