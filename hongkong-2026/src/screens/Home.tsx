import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Car, CloudSun, Ticket as TicketIcon, Navigation, Soup, Train, Wallet, Luggage, ClipboardCheck, FileText, CheckCircle2, Clock } from 'lucide-react';
import { ACTIVITIES, DAYS, EXPENSES, PACKING, SHOPPING, TASKS, TICKETS, FAMILY, LINKS } from '../data/seed';
import { useAppState, useChecks, useCollection } from '../state/store';
import { useVault } from '../state/vault';
import { currentDayId, dateLabel, daysUntil, DEPART_HOME, fmt12, greeting, hkClock, hkDateLong, nowMs, tripPhase } from '../lib/time';
import { cachedWx, fetchWx, wxEmoji, wxText, type Wx } from '../lib/weather';
import { fmtBoth, fmtHKD, fmtPHP, hkdToPhp, toHKD } from '../lib/money';
import { computeBudget } from '../lib/budget';
import { actState, dayEstimate, dayOf, prepaid, sortActs, tripSpend } from '../lib/trip';
import { mapDir, mapNearby } from '../lib/maps';
import { Card, SectionTitle, StatusPill, Btn } from '../ui/primitives';
import { Photo } from '../ui/Photo';
import { Ring } from '../ui/Ring';
import { go } from '../ui/router';
import type { Activity } from '../types';

function useTick(ms = 30_000) { const [, s] = useState(0); useEffect(() => { const t = setInterval(() => s((x) => x + 1), ms); return () => clearInterval(t); }, [ms]); }

function useWeather() {
  const [wx, setWx] = useState<Wx[] | null>(cachedWx()?.days ?? null);
  const [offline, setOffline] = useState(false);
  useEffect(() => { fetchWx().then((d) => { if (d) { setWx(d); setOffline(false); } else setOffline(true); }); }, []);
  return { wx, offline };
}

export function Home() {
  useTick();
  const phase = tripPhase();
  const dayId = currentDayId();
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const tasks = useCollection('tasks', TASKS).items;
  const tickets = useCollection('tickets', TICKETS).items;
  const exps = useCollection('expenses', EXPENSES).items;
  const packing = PACKING; const { checks } = useChecks();
  const { state } = useAppState(); const r = state.settings.rates;
  const { docs } = useVault();
  const { wx, offline } = useWeather();

  const doneTasks = tasks.filter((t) => checks['task:' + t.id]).length;
  const openTasks = tasks.filter((t) => !checks['task:' + t.id]);
  const packed = packing.filter((p) => checks['pack:' + p.id]).length;
  const days = daysUntil(DEPART_HOME.slice(0, 10));
  const baseline = 60;

  // warnings
  const warnings: { text: string; to: string }[] = [];
  const crit = openTasks.filter((t) => t.critical);
  if (crit.length) warnings.push({ text: `${crit.length} important task${crit.length > 1 ? 's' : ''} still open`, to: 'more/ready' });
  const needDocs = tickets.filter((t) => (t.status === 'confirmed') && !docs.some((d) => d.ticketId === t.id));
  if (needDocs.length) warnings.push({ text: `Import original tickets: ${needDocs.map((t) => t.name).join(', ')}`, to: 'more/documents' });
  if (!state.lastBackupAt && docs.length) warnings.push({ text: 'No encrypted backup yet', to: 'more/settings' });

  return (
    <div className="space-y-4 pb-4">
      <motion.header initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="px-1 pt-[calc(var(--safe-t)+14px)]">
        <p className="text-[13px] font-bold uppercase tracking-wider text-coral">Hong Kong 2026</p>
        <h1 className="text-[26px] font-bold leading-tight text-navy">Our Family Adventure</h1>
      </motion.header>

      {phase === 'before' && (
        <Card className="overflow-hidden !bg-navy text-white">
          <div className="relative flex items-center gap-4 p-5">
            <Ring value={1 - Math.min(days, baseline) / baseline} size={104} stroke={11}>
              <div><div className="font-display text-[34px] font-bold leading-none text-sun">{days}</div><div className="text-[11px] font-bold uppercase tracking-wide text-white/70">days to go</div></div>
            </Ring>
            <div className="min-w-0">
              <h2 className="text-[20px] font-bold leading-tight">We fly Monday, Dec 7</h2>
              <p className="mt-1 text-[14px] text-white/75">Leave home in Goa at 12:30 AM · PAL to Manila at 6:45 AM</p>
              <p className="mt-2 text-[14px] font-bold text-sun">{openTasks.length} of {tasks.length} preparation tasks left</p>
            </div>
          </div>
        </Card>
      )}

      {phase === 'during' && dayId && <TodayHero dayId={dayId} acts={acts} wx={wx} offline={offline} />}

      {phase === 'after' && <AfterTrip acts={acts} exps={exps} r={r} />}

      <CapCard />

      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <button key={w.text} onClick={() => go(w.to)} className="flex w-full items-center gap-3 rounded-2xl bg-sun-soft px-4 py-3 text-left text-[14px] font-bold text-[#6d4b00] active:scale-[.99]">
              <AlertTriangle size={20} className="shrink-0" /><span className="flex-1">{w.text}</span><ArrowRight size={18} />
            </button>
          ))}
        </div>
      )}

      {phase === 'before' && (
        <>
          <SectionTitle action={<a href="#/more/ready" className="tap flex items-center text-[14px] font-bold text-sky">See all</a>}>Do these next</SectionTitle>
          <TaskList />
          <SectionTitle>Quick look</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <Tile icon={<TicketIcon />} tone="bg-coral-soft" title="Tickets" sub={`${tickets.filter((t) => docs.some((d) => d.ticketId === t.id)).length}/${tickets.length} with files`} to="tickets" />
            <Tile icon={<FileText />} tone="bg-sky-soft" title="Documents" sub={`${docs.length} imported`} to="more/documents" />
            <Tile icon={<Luggage />} tone="bg-turq-soft" title="Packing" sub={`${packed}/${packing.length} packed`} to="more/packing" />
            <Tile icon={<Wallet />} tone="bg-lav-soft" title="Money" sub={`Paid ${fmtPHP(hkdToPhp(prepaid(exps, r), r))}`} to="more/expenses" />
            <Tile icon={<ClipboardCheck />} tone="bg-sun-soft" title="Travel Ready" sub={`${doneTasks}/${tasks.length} done`} to="more/ready" />
            <Tile icon={<CloudSun />} tone="bg-pink-soft" title="Weather" sub={wxSummary(wx)} to="more/guide" />
          </div>
        </>
      )}

      <SectionTitle action={<a href="#/itinerary" className="tap flex items-center text-[14px] font-bold text-sky">Full plan</a>}>{phase === 'during' ? 'Rest of today' : 'The five days'}</SectionTitle>
      {phase === 'during' && dayId ? <CompactTimeline dayId={dayId} acts={acts} /> : (
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 scroll-hide">
          {DAYS.map((d) => (
            <button key={d.id} onClick={() => go('itinerary/' + d.id)} className="card w-[220px] shrink-0 snap-start overflow-hidden text-left active:scale-[.98]">
              <Photo k={d.photoKey} className="h-[110px]"><span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[12px] font-bold text-navy">Day {d.id} · {dateLabel(d.date, { day: 'numeric', month: 'short' })}</span></Photo>
              <div className="p-3"><div className="text-[16px] font-bold leading-tight text-navy">{d.title}</div><div className="mt-0.5 text-[13px] text-muted">{d.subtitle}</div></div>
            </button>
          ))}
        </div>
      )}

      <div className="pt-1 text-center text-[12px] text-muted">{FAMILY.map((f) => f.name).join(' · ')}</div>
    </div>
  );
}

const wxSummary = (wx: Wx[] | null) => {
  const d = wx?.find((x) => x.date === '2026-12-08');
  return d ? `${wxEmoji(d.code)} ${d.lo}–${d.hi}°C Dec 8` : 'Forecast soon';
};

function Tile({ icon, title, sub, to, tone }: { icon: React.ReactNode; title: string; sub: string; to: string; tone: string }) {
  return (
    <Card onClick={() => go(to)} className="p-4">
      <div className={`mb-2 grid h-11 w-11 place-items-center rounded-2xl text-navy ${tone}`}>{icon}</div>
      <div className="text-[16px] font-bold text-navy">{title}</div><div className="text-[13px] text-muted">{sub}</div>
    </Card>
  );
}

function TaskList() {
  const tasks = useCollection('tasks', TASKS).items; const { checks, toggle } = useChecks();
  const open = tasks.filter((t) => !checks['task:' + t.id]).sort((a, b) => (b.critical ? 1 : 0) - (a.critical ? 1 : 0) || (a.due ?? '').localeCompare(b.due ?? '')).slice(0, 4);
  if (!open.length) return <Card className="p-5 text-center"><CheckCircle2 className="mx-auto mb-1 text-turq" /><div className="font-bold text-navy">All preparation tasks done!</div></Card>;
  return (
    <Card className="divide-y divide-navy/5 overflow-hidden">
      {open.map((t) => (
        <label key={t.id} className="tap flex cursor-pointer items-start gap-3 px-4 py-3">
          <input type="checkbox" checked={false} onChange={() => toggle('task:' + t.id)} className="mt-1 h-5 w-5 accent-[#14b8a6]" />
          <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold leading-snug text-navy">{t.title}</span>
            <span className="mt-1 flex flex-wrap items-center gap-2">{t.critical && <span className="text-[12px] font-bold text-coral">Important</span>}<StatusPill status={t.status} />{t.due && <span className="text-[12px] text-muted">by {dateLabel(t.due, { day: 'numeric', month: 'short' })}</span>}</span></span>
        </label>
      ))}
    </Card>
  );
}

function useNext(dayId: number, acts: Activity[]) {
  const { checks } = useChecks();
  const list = sortActs(acts.filter((a) => a.day === dayId));
  const states = list.map((a) => actState(a, acts, !!checks['done:' + a.id]));
  const idx = states.findIndex((s) => s !== 'done');
  return { list, states, next: idx >= 0 ? list[idx] : null, idx };
}

function TodayHero({ dayId, acts, wx, offline }: { dayId: number; acts: Activity[]; wx: Wx[] | null; offline: boolean }) {
  const day = dayOf(dayId);
  const { state } = useAppState(); const r = state.settings.rates;
  const exps = useCollection('expenses', EXPENSES).items;
  const tickets = useCollection('tickets', TICKETS).items.filter((t) => t.dayId === dayId);
  const { next, states, list } = useNext(dayId, acts);
  const w = wx?.find((x) => x.date === day.date);
  const est = dayEstimate(acts, dayId); const spent = tripSpend(exps, r, dayId);
  const cur = list.find((_, i) => states[i] === 'current');
  const nextIdx = next ? list.indexOf(next) : -1;
  const leave = next ? (next.kind === 'travel' || next.kind === 'flight' ? next.start : leaveBy(next.start)) : null;
  const dest = next?.place ?? '';
  return (
    <>
      <Card className="overflow-hidden">
        <Photo k={day.photoKey} className="h-[150px]">
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="text-[14px] font-semibold opacity-90">{greeting()}, Keren!</p>
            <h2 className="text-[24px] font-bold leading-tight">Day {day.id} — {day.title}</h2>
          </div>
        </Photo>
        <div className="grid grid-cols-2 gap-px bg-navy/5 text-[14px]">
          <div className="bg-white p-3"><div className="flex items-center gap-1.5 text-[12px] font-bold uppercase text-muted"><Clock size={14} />Hong Kong</div><div className="font-bold text-navy">{hkClock()} · {hkDateLong(nowMs())}</div></div>
          <div className="bg-white p-3"><div className="flex items-center gap-1.5 text-[12px] font-bold uppercase text-muted"><CloudSun size={14} />Today</div>
            <div className="font-bold text-navy">{w ? `${wxEmoji(w.code)} ${wxText(w.code)} · ${w.lo}–${w.hi}°C · rain ${w.rain}%` : offline ? 'Offline — no forecast' : 'Loading…'}</div></div>
        </div>
      </Card>

      {next ? (
        <Card className="border-l-[6px] border-coral p-4">
          <div className="flex items-start justify-between gap-2"><span className="text-[12px] font-bold uppercase tracking-wide text-coral">{cur && cur.id === next.id ? 'Happening now' : 'Next up'}</span><StatusPill status={next.status} /></div>
          <h3 className="mt-0.5 text-[19px] font-bold leading-snug text-navy">{next.title}</h3>
          <p className="text-[14px] text-muted">{fmt12(next.start)}{next.end ? ` – ${fmt12(next.end)}` : ''}{leave && ` · leave by ${fmt12(leave)}`}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={dest ? mapDir(dest) : mapNearby('attractions')} target="_blank" rel="noopener noreferrer" className="tap flex flex-col items-center justify-center gap-1 rounded-2xl bg-navy py-2.5 text-[13px] font-bold text-white"><Navigation size={20} />Navigate</a>
            <a href={LINKS.uber} target="_blank" rel="noopener noreferrer" className="tap flex flex-col items-center justify-center gap-1 rounded-2xl bg-sky-soft py-2.5 text-[13px] font-bold text-navy"><Car size={20} />Uber</a>
            <a href={mapNearby('restaurants')} target="_blank" rel="noopener noreferrer" className="tap flex flex-col items-center justify-center gap-1 rounded-2xl bg-sun-soft py-2.5 text-[13px] font-bold text-navy"><Soup size={20} />Food nearby</a>
          </div>
          <a href="https://www.mtr.com.hk/en/customer/jp/index.php" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center justify-center gap-2 py-1 text-[13px] font-bold text-sky"><Train size={16} />Plan an MTR trip</a>
        </Card>
      ) : <Card className="p-4 text-center font-bold text-navy">All done for today — rest well!</Card>}

      {tickets.length > 0 && (
        <Card onClick={() => go('tickets')} className="flex items-center gap-3 p-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-coral-soft text-coral"><TicketIcon /></div>
          <div className="min-w-0 flex-1"><div className="text-[12px] font-bold uppercase text-muted">Tickets needed today</div><div className="truncate font-bold text-navy">{tickets.map((t) => t.name).join(' · ')}</div></div><ArrowRight className="text-muted" /></Card>
      )}
      <Card className="grid grid-cols-2 divide-x divide-navy/5 p-0">
        <div className="p-4"><div className="text-[12px] font-bold uppercase text-muted">Today’s estimate</div><div className="text-[18px] font-bold text-navy">{fmtHKD(est)}</div><div className="text-[13px] text-muted">{fmtPHP(hkdToPhp(est, r))}</div></div>
        <div className="p-4"><div className="text-[12px] font-bold uppercase text-muted">Spent so far</div><div className="text-[18px] font-bold text-navy">{fmtHKD(spent)}</div><div className="text-[13px] text-muted">{fmtPHP(hkdToPhp(spent, r))}</div></div>
      </Card>
      {nextIdx < 0 && dayId < 5 && <Btn variant="soft" onClick={() => go('itinerary/' + (dayId + 1))}>Preview Day {dayId + 1}</Btn>}
    </>
  );
}
function leaveBy(start: string) { const [h, m] = start.split(':').map(Number); const t = h * 60 + m - 15; return `${String(Math.floor((t + 1440) % 1440 / 60)).padStart(2, '0')}:${String((t + 1440) % 60).padStart(2, '0')}`; }

function CompactTimeline({ dayId, acts }: { dayId: number; acts: Activity[] }) {
  const { list, states } = useNext(dayId, acts);
  const rest = list.map((a, i) => ({ a, s: states[i] })).filter((x) => x.s !== 'done').slice(0, 6);
  if (!rest.length) return <Card className="p-4 text-center text-muted">Nothing left on today’s plan.</Card>;
  return (
    <Card className="p-4">
      {rest.map(({ a, s }, i) => (
        <div key={a.id} className="flex gap-3">
          <div className="flex flex-col items-center"><span className={`mt-1.5 h-3 w-3 rounded-full ${s === 'current' ? 'bg-coral pulse-dot' : 'bg-sky'}`} />{i < rest.length - 1 && <span className="w-0.5 flex-1 bg-sky-soft" />}</div>
          <div className="pb-3"><div className="text-[12px] font-bold text-muted">{fmt12(a.start)}</div><div className="text-[15px] font-bold leading-snug text-navy">{a.title}</div></div>
        </div>
      ))}
    </Card>
  );
}

function AfterTrip({ acts, exps, r }: { acts: Activity[]; exps: ReturnType<typeof useCollection<import('../types').Expense>>['items']; r: import('../lib/money').Rates }) {
  const { checks } = useChecks();
  const done = acts.filter((a) => checks['done:' + a.id]).length;
  const spent = tripSpend(exps, r);
  return (
    <Card className="overflow-hidden !bg-navy p-5 text-white">
      <h2 className="text-[24px] font-bold">Welcome home! 💛</h2>
      <p className="mt-1 text-[15px] text-white/80">Hong Kong 2026 — what a family adventure.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
        <div className="rounded-2xl bg-white/10 p-3"><div className="text-white/70">Activities ticked off</div><div className="text-[22px] font-bold text-sun">{done}/{acts.length}</div></div>
        <div className="rounded-2xl bg-white/10 p-3"><div className="text-white/70">Trip spending logged</div><div className="text-[22px] font-bold text-sun">{fmtBoth(spent, r)}</div></div>
      </div>
      <p className="mt-3 text-[13px] text-white/75">Remember to review and download your Disney PhotoPass photos, and request your hotel deposit refund if due.</p>
    </Card>
  );
}
export { toHKD };

function CapCard() {
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const exps = useCollection('expenses', EXPENSES).items;
  const shop = useCollection('shopping', SHOPPING).items; const { checks } = useChecks();
  const { state } = useAppState(); const r = state.settings.rates;
  const cap = state.settings.capPHP ?? 150000;
  const b = computeBudget(acts, exps, shop, checks, r);
  const spent = hkdToPhp(b.paidTotal, r), planned = hkdToPhp(b.remaining, r), used = spent + planned, left = cap - used;
  const over = left < 0, close = !over && used / cap >= 0.9;
  return (
    <Card onClick={() => go('more/expenses')} className="p-4">
      <div className="flex items-baseline justify-between gap-2"><div className="text-[12px] font-bold uppercase tracking-wide text-muted">Budget cap · {fmtPHP(cap)}</div><div className="text-[12px] font-bold text-sky">Details</div></div>
      <div className={`mt-0.5 font-display text-[24px] font-bold leading-tight ${over ? 'text-coral' : 'text-navy'}`}>{over ? `Over by ${fmtPHP(-left)}` : `${fmtPHP(left)} left`}</div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-paper">
        <motion.div className="h-full bg-turq" initial={{ width: 0 }} animate={{ width: `${Math.min(100, (spent / cap) * 100)}%` }} transition={{ duration: 0.9 }} />
        <motion.div className={over ? 'h-full bg-coral' : 'h-full bg-sun'} initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100 - (spent / cap) * 100, (planned / cap) * 100))}%` }} transition={{ duration: 0.9, delay: 0.1 }} />
      </div>
      <div className="mt-1.5 text-[12px] text-muted">Spent {fmtPHP(spent)} · Planned {fmtPHP(planned)}{close ? ' · getting close!' : ''}</div>
    </Card>
  );
}
