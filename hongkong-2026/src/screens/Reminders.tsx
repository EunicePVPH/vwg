import { useEffect, useState } from 'react';
import { BellRing, Check, Clock, Download, Share2, TriangleAlert } from 'lucide-react';
import { ACTIVITIES, ALL_DAYS as DAYS } from '../data/seed';
import { useCollection } from '../state/store';
import { useRemind, showNotification } from '../state/remind';
import { RKIND_LABEL, dueNow, upcoming, type RKind } from '../lib/reminders';
import { buildIcs } from '../lib/ics';
import { dateLabel, fmt12, nowMs } from '../lib/time';
import { Btn, Card, PageHeader, SectionTitle, Toggle, cx } from '../ui/primitives';
import { WhatsNext } from '../ui/WhatsNext';
import type { Activity } from '../types';

const hhmm = (ms: number) => { const p = new Date(ms + 8 * 3600000).toISOString(); return { d: p.slice(0, 10), t: p.slice(11, 16) }; };

export function Reminders() {
  const { st, all, set, snooze, dismiss } = useRemind();
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const [next, setNext] = useState(false);
  const [msg, setMsg] = useState('');
  const [alarms, setAlarms] = useState(true);
  const [exportDay, setExportDay] = useState<number>(-1);
  const [perm, setPerm] = useState<string>(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 30000); return () => clearInterval(t); }, []);
  const [, setTick] = useState(0);
  const now = nowMs();
  const due = st.on ? dueNow(all, st, now) : [];
  const soon = st.on ? upcoming(all, st, now).slice(0, 12) : [];
  const preview = !st.on ? upcoming(all, st, now).slice(0, 5) : [];

  async function allow() {
    if (typeof Notification === 'undefined') return setMsg('This browser cannot show notifications.');
    const p = await Notification.requestPermission(); setPerm(p);
    if (p === 'granted') { set({ notify: true }); setMsg('Allowed. Alerts will show while the app is open or was recently open.'); } else setMsg('Notifications are blocked. You can allow them in Chrome’s site settings.');
  }
  async function download(share: boolean) {
    const ics = buildIcs(acts, DAYS, { alarms: alarms ? [60, 30, 0] : [], dayId: exportDay >= 0 ? exportDay : undefined });
    const name = exportDay >= 0 ? `hong-kong-2026-day-${exportDay}.ics` : 'hong-kong-2026-all-days.ics';
    const file = new File([ics], name, { type: 'text/calendar' });
    if (share && navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Hong Kong 2026 calendar' }); return; } catch { /* fall back */ } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
    setMsg(`Saved ${name}. Open it on your phone to add it to Google Calendar — the app does not touch your calendar.`);
  }
  const row = (r: (typeof all)[number], isDue: boolean) => { const w = hhmm(r.at); return (
    <div key={r.id} className={cx('rounded-2xl p-3', isDue ? 'bg-coral-soft' : 'bg-paper')}>
      <div className="flex items-start gap-2"><div className="min-w-0 flex-1"><div className="text-[12px] font-bold text-muted">{dateLabel(w.d, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmt12(w.t)} · {RKIND_LABEL[r.kind]}</div><div className="text-[15px] font-bold leading-snug text-navy">{r.title}</div>{r.body && <div className="text-[13px] text-muted">{r.body}</div>}</div></div>
      <div className="mt-2 flex gap-2">{isDue && <Btn variant="soft" className="!min-h-[40px] !px-3 !py-1 text-[13px]" icon={<Clock size={15} />} onClick={() => snooze(r.id)}>Snooze 15 min</Btn>}<Btn variant="ghost" className="!min-h-[40px] !px-3 !py-1 text-[13px]" icon={<Check size={15} />} onClick={() => dismiss(r.id)}>Dismiss</Btn>{r.link && <a href={r.link} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center rounded-xl px-3 text-[13px] font-bold text-sky">Open link</a>}</div>
    </div>); };

  return (
    <div className="pb-4">
      <PageHeader title="Reminders" back="more" sub="Next stop, leave times, deadlines" />
      <Card className="mb-3 space-y-3 p-4">
        <div className="flex items-center gap-3"><div className="flex-1"><div className="font-bold text-navy">Turn on reminders</div><div className="text-[13px] text-muted">Off until you choose. Built from your current itinerary — edit a time and the reminders update, with no duplicates.</div></div><Toggle label="Turn on reminders" on={st.on} onChange={(v) => set({ on: v })} /></div>
        <Btn variant="primary" className="w-full" icon={<BellRing size={18} />} onClick={() => setNext(true)}>What is next?</Btn>
      </Card>

      <div className="mb-3 flex gap-3 rounded-2xl bg-sun-soft p-4 text-[13px] text-[#6d4b00]" role="note"><TriangleAlert size={20} className="mt-0.5 shrink-0" /><div><b>What reminders can and can’t do.</b> The reminder list always works in the app. Device notifications are shown only while this app is open or was recently open — Android can pause a web app in the background, so an alert is <b>not guaranteed</b> when the app is closed. For alarms that fire even when the app is closed, export the calendar file below and add it to Google Calendar. There is no live-location or automatic arrival detection.</div></div>

      {st.on && (
        <>
          <SectionTitle>Due now</SectionTitle>
          <div className="space-y-2">{due.length ? due.map((r) => row(r, true)) : <Card className="p-4 text-[14px] text-muted">Nothing due right now.</Card>}</div>
          <SectionTitle>Coming up</SectionTitle>
          <div className="space-y-2">{soon.length ? soon.map((r) => row(r, false)) : <Card className="p-4 text-[14px] text-muted">No upcoming reminders.</Card>}</div>
        </>
      )}
      {!st.on && <><SectionTitle>Preview (reminders are off)</SectionTitle><div className="space-y-2 opacity-70">{preview.map((r) => { const w = hhmm(r.at); return <Card key={r.id} className="p-3 text-[14px]"><b className="text-navy">{r.title}</b><div className="text-[12px] text-muted">{dateLabel(w.d, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmt12(w.t)}</div></Card>; })}</div></>}

      <SectionTitle>Device notifications</SectionTitle>
      <Card className="space-y-3 p-4 text-[14px]">
        <p>Status: <b>{perm === 'granted' ? 'allowed' : perm === 'denied' ? 'blocked' : perm === 'unsupported' ? 'not supported here' : 'not asked yet'}</b></p>
        {perm !== 'granted' && perm !== 'unsupported' && <Btn variant="soft" className="w-full" onClick={allow}>Allow notifications</Btn>}
        {perm === 'granted' && <div className="flex items-center gap-3"><span className="flex-1 font-bold text-navy">Show alerts while the app is open</span><Toggle label="Show device notifications" on={st.notify} onChange={(v) => set({ notify: v })} /></div>}
        {perm === 'granted' && <Btn variant="ghost" className="w-full" onClick={async () => setMsg((await showNotification('Test reminder', 'If you can see this, device notifications work while the app is open.', 'test')) ? 'Test sent.' : 'Could not show a notification.')}>Send a test</Btn>}
      </Card>

      <SectionTitle>What to remind me about</SectionTitle>
      <Card className="divide-y divide-navy/5">
        {(Object.keys(RKIND_LABEL) as RKind[]).map((k) => <div key={k} className="flex items-center gap-3 px-4 py-3"><span className="flex-1 text-[15px] font-bold text-navy">{RKIND_LABEL[k]}</span><Toggle label={RKIND_LABEL[k]} on={st.types[k]} onChange={(v) => set({ types: { ...st.types, [k]: v } })} /></div>)}
        <div className="px-4 py-3"><div className="mb-2 text-[14px] font-bold text-navy">Leave alerts, minutes before</div><div className="flex gap-2">{[60, 30, 15, 0].map((m) => <button key={m} aria-pressed={st.offsets.includes(m)} onClick={() => set({ offsets: st.offsets.includes(m) ? st.offsets.filter((x) => x !== m) : [...st.offsets, m].sort((a, b) => b - a) })} className={cx('tap rounded-full px-4 text-[14px] font-bold', st.offsets.includes(m) ? 'bg-navy text-white' : 'bg-paper text-navy')}>{m === 0 ? 'At time' : `${m} min`}</button>)}</div></div>
      </Card>

      <SectionTitle>Calendar export (.ics)</SectionTitle>
      <Card className="space-y-3 p-4 text-[14px]">
        <p className="text-muted">Creates a file you import yourself. Nothing is sent to your calendar automatically. Events are marked tentative where the plan still needs verification. No passport numbers, tickets or QR codes are included.</p>
        <select className="w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3" value={exportDay} onChange={(e) => setExportDay(Number(e.target.value))}><option value={-1}>All days (plus deadline reminders)</option>{DAYS.map((d) => <option key={d.id} value={d.id}>Day {d.id} · {dateLabel(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</option>)}</select>
        <div className="flex items-center gap-3"><span className="flex-1 font-bold text-navy">Include alerts (60, 30, 0 min before)</span><Toggle label="Include calendar alerts" on={alarms} onChange={setAlarms} /></div>
        <div className="grid grid-cols-2 gap-2"><Btn icon={<Download size={17} />} onClick={() => void download(false)}>Download</Btn><Btn variant="soft" icon={<Share2 size={17} />} onClick={() => void download(true)}>Share…</Btn></div>
      </Card>
      {msg && <div role="status" className="fixed inset-x-4 bottom-[calc(84px+var(--safe-b))] z-40 mx-auto max-w-[520px] rounded-2xl bg-navy px-4 py-3 text-[14px] font-bold text-white shadow-xl" onClick={() => setMsg('')}>{msg}</div>}
      <WhatsNext open={next} onClose={() => setNext(false)} />
    </div>
  );
}
