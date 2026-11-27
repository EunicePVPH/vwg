import { useState } from 'react';
import { Check, ExternalLink, History, Plus, ShieldQuestion, UserRound, Wifi, WifiOff } from 'lucide-react';
import { ACTIVITIES, ALL_DAYS as DAYS } from '../data/seed';
import { LEGACY_ACTIVITIES } from '../data/legacy';
import { GATES } from '../data/gates';
import { useAppState, useChecks, useCollection } from '../state/store';
import { dateLabel, fmt12 } from '../lib/time';
import { Btn, Card, PageHeader, SectionTitle, cx } from '../ui/primitives';
import { go } from '../ui/router';
import type { Activity } from '../types';

export function Verify() {
  const { checks, toggle } = useChecks();
  const done = GATES.filter((g) => checks['gate:' + g.id]).length;
  return (
    <div className="pb-4">
      <PageHeader title="To verify" back="more" sub={`${done} of ${GATES.length} checked by you`} />
      <Card className="mb-3 p-4 text-[14px] text-muted">These are the open verification gates from your Nov 27 update. They are <b className="text-navy">never ticked automatically</b> — only you can mark one verified, after checking the official page or your own booking. Items marked <b className="text-[#8a5f00]">Your action</b> need your personal booking or receipt.</Card>
      <div className="space-y-3">
        {GATES.map((g) => (
          <Card key={g.id} className="space-y-2 p-4">
            <div className="flex items-start gap-3">
              <button aria-label={`Mark verified: ${g.title}`} aria-pressed={!!checks['gate:' + g.id]} onClick={() => toggle('gate:' + g.id)} className="tap grid place-items-center"><span className={cx('grid h-7 w-7 place-items-center rounded-lg border-2', checks['gate:' + g.id] ? 'border-turq bg-turq text-white' : 'border-navy/30 bg-white')}>{checks['gate:' + g.id] && <Check size={16} strokeWidth={3} />}</span></button>
              <div className="min-w-0 flex-1"><div className="text-[15px] font-bold leading-snug text-navy">{g.title}</div>
                <div className="mt-1 flex gap-1.5">{g.userAction && <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-bold text-[#8a5f00]"><UserRound size={11} />Your action</span>}<span className="rounded-full bg-sun-soft px-2 py-0.5 text-[11px] font-bold text-[#8a5f00]">Needs verification</span></div></div>
            </div>
            <p className="text-[14px]">{g.detail}</p>
            {g.links.length > 0 && <div className="flex flex-wrap gap-2">{g.links.map((l) => <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 text-[13px] font-bold text-white"><ExternalLink size={14} />{l.label}</a>)}</div>}
          </Card>
        ))}
      </div>
      <p className="mt-3 flex gap-2 px-1 text-[12px] text-muted"><ShieldQuestion size={15} className="mt-0.5 shrink-0" />Links open official pages and need internet.</p>
    </div>
  );
}

export function Changes() {
  const { state, setState } = useAppState();
  const acts = useCollection<Activity>('activities', ACTIVITIES);
  const log = state.changeLog ?? [];
  const [showOld, setShowOld] = useState(false);
  const resolve = (id: string, useNew: boolean) => setState((s) => {
    const e = (s.changeLog ?? []).find((x) => x.id === id); if (!e) return s;
    let col = s.col;
    if (useNew && e.coll && e.itemId && e.field) { const c = s.col[e.coll]; if (c?.patch[e.itemId]) { const p = { ...c.patch[e.itemId] }; delete p[e.field]; col = { ...s.col, [e.coll]: { ...c, patch: { ...c.patch, [e.itemId]: p } } }; } }
    return { ...s, col, changeLog: (s.changeLog ?? []).map((x) => (x.id === id ? { ...x, resolved: true } : x)) };
  });
  return (
    <div className="pb-4">
      <PageHeader title="Changes & history" back="more" sub="Nothing is silently discarded" />
      <SectionTitle>Change review</SectionTitle>
      <div className="space-y-2">
        {log.length === 0 && <Card className="p-4 text-[14px] text-muted">No changes recorded yet.</Card>}
        {log.map((e) => (
          <Card key={e.id} className={cx('space-y-1 p-4', e.resolved && 'opacity-60')}>
            <div className="flex items-center gap-2"><History size={16} className="text-sky" /><div className="text-[12px] font-bold uppercase text-muted">{new Date(e.at).toLocaleDateString()} · {e.kind === 'update' ? 'Update' : e.kind === 'conflict' ? 'Needs your decision' : 'Your edit to the old plan'}</div></div>
            <div className="text-[15px] font-bold text-navy">{e.title}</div>
            <p className="text-[13px] text-muted">{e.detail}</p>
            {e.kind === 'conflict' && <p className="text-[13px]">Yours: <b>{e.yours}</b> · New plan: <b>{e.plan}</b></p>}
            {e.kind === 'conflict' && !e.resolved && <div className="flex gap-2 pt-1"><Btn variant="ghost" className="!min-h-[40px] flex-1 text-[13px]" onClick={() => resolve(e.id, false)}>Keep mine</Btn><Btn variant="soft" className="!min-h-[40px] flex-1 text-[13px]" onClick={() => resolve(e.id, true)}>Use new plan value</Btn></div>}
            {e.kind === 'conflict' && e.resolved && <p className="text-[12px] font-bold text-[#0b6b61]">Resolved</p>}
          </Card>
        ))}
      </div>
      <SectionTitle action={<button onClick={() => setShowOld(!showOld)} className="tap text-[14px] font-bold text-sky">{showOld ? 'Hide' : 'Show'}</button>}>Previous plan (Nov 6 draft)</SectionTitle>
      <p className="mb-2 px-1 text-[13px] text-muted">Read-only copy of the earlier itinerary. Re-add any stop to its day if you still want it.</p>
      {showOld && DAYS.map((d) => (
        <Card key={d.id} className="mb-3 overflow-hidden"><div className="bg-sky-soft px-4 py-2 text-[14px] font-bold text-navy">Day {d.id} · {dateLabel(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</div>
          <div className="divide-y divide-navy/5">{LEGACY_ACTIVITIES.filter((a) => a.day === d.id).map((a) => (
            <div key={a.id} className="flex items-start gap-2 px-4 py-2 text-[13px]"><div className="w-[58px] shrink-0 font-bold text-muted">{fmt12(a.start).replace(' ', ' ')}</div><div className="min-w-0 flex-1 text-ink">{a.title}</div>
              <button aria-label={`Re-add ${a.title}`} onClick={() => { acts.add({ ...a, id: 'u-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), title: a.title + ' (from Nov 6 plan)', costHKD: undefined }); go('itinerary/' + d.id); }} className="tap grid place-items-center text-sky"><Plus size={18} /></button></div>
          ))}</div></Card>
      ))}
    </div>
  );
}

export function OfflineInfo() {
  const online = typeof navigator === 'undefined' ? true : navigator.onLine;
  const L = ({ icon, title, tone, items }: { icon: React.ReactNode; title: string; tone: string; items: string[] }) => (
    <Card className="mb-3 p-4"><div className={cx('mb-2 flex items-center gap-2 text-[16px] font-bold', tone)}>{icon}{title}</div><ul className="space-y-1.5 text-[14px]">{items.map((i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />{i}</li>)}</ul></Card>
  );
  return (
    <div className="pb-4">
      <PageHeader title="Offline & online" back="more" sub={online ? 'You are online now' : 'You are offline now'} />
      <L icon={<WifiOff size={20} />} tone="text-[#0b6b61]" title="Works offline (after the app has loaded once)" items={[
        'Your full itinerary as text, including routes, stations, exits, walking estimates and skip options',
        'Checklists, packing, shopping list and expense tracker',
        'Original tickets and documents you imported (kept encrypted on this phone)',
        'The in-app reminder list and “What is next?” (based on your plan and this phone’s clock)',
        'Creating the printable booklet and the calendar (.ics) file',
        'Emergency numbers and the saved hotel address',
      ]} />
      <L icon={<Wifi size={20} />} tone="text-[#1d5f99]" title="Needs internet" items={[
        'Google Maps links and live directions (Navigate now)',
        'Weather forecast and exchange-rate refresh',
        'Uber prices, availability and booking',
        'MTR service alerts and journey planner; Star Ferry times',
        'Queue / wait times and showtimes on official pages (the app has no live feed for these)',
        'Opening the “Verify” links on official sites',
        'First install and receiving a new app version',
      ]} />
      <L icon={<ShieldQuestion size={20} />} tone="text-[#8a5f00]" title="Not provided" items={[
        'Offline map tiles or offline turn-by-turn navigation — only text directions are saved. For offline maps, download the area in Google Maps yourself.',
        'Live location or automatic “you have arrived” detection',
        'Push notifications when the app is closed — device alerts work only while the app is open or recently open; use the calendar file for alarms that do not depend on the app',
      ]} />
    </div>
  );
}
