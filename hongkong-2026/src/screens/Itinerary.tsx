import { useMemo, useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Backpack, Baby, Bed, Bus, CableCar, Camera, Car, Check, ChevronDown, ExternalLink, Footprints, MapPin, Moon, Navigation, Pencil, Plane, Plus, Ship, Sparkles, Star, Ticket as TicketIcon, TrainFront, TramFront, Utensils, TriangleAlert, Info, ClipboardList } from 'lucide-react';
import { ACTIVITIES, ARRIVAL_CHECKLIST, DAYS, FLIGHTS, LINKS, TICKETS } from '../data/seed';
import { useAppState, useChecks, useCollection, useNote } from '../state/store';
import { useVault } from '../state/vault';
import { currentDayId, dateLabel, fmt12, nowMs, tripPhase } from '../lib/time';
import { fmtBoth } from '../lib/money';
import { actState, catOf, dayEstimate, dayOf, sortActs, unpricedCount } from '../lib/trip';
import { mapDir, mapSearch } from '../lib/maps';
import { Card, StatusPill, accentBg, accentSoft, cx, Btn } from '../ui/primitives';
import { Photo } from '../ui/Photo';
import { RoutePreview } from '../ui/RoutePreview';
import { EditSheet, type Field } from '../ui/EditSheet';
import { go } from '../ui/router';
import { Confetti } from '../ui/Confetti';
import type { Activity, Kind, Mode, Priority, Status } from '../types';

const MODE_ICON: Record<Mode, React.ReactNode> = { walk: <Footprints size={16} />, uber: <Car size={16} />, car: <Car size={16} />, mtr: <TrainFront size={16} />, ferry: <Ship size={16} />, bus: <Bus size={16} />, plane: <Plane size={16} />, tram: <TramFront size={16} />, cable: <CableCar size={16} /> };
const KIND_ICON: Record<Kind, React.ReactNode> = { travel: <Navigation size={16} />, flight: <Plane size={16} />, meal: <Utensils size={16} />, sight: <Camera size={16} />, rest: <Moon size={16} />, hotel: <Bed size={16} />, task: <ClipboardList size={16} />, show: <Sparkles size={16} /> };

const STATUS_LABEL: Record<Status, string> = { confirmed: 'Confirmed', paid: 'Paid', estimated: 'Estimated', pending: 'Pending', optional: 'Optional', verify: 'Needs verification' };
const STATUS_OPTS = (['confirmed', 'estimated', 'pending', 'optional', 'verify'] as Status[]).map((s) => ({ value: s, label: STATUS_LABEL[s] }));
const FIELDS: Field[] = [
  { key: 'title', label: 'What', type: 'text' },
  { key: 'start', label: 'Start time (Hong Kong time)', type: 'time' },
  { key: 'end', label: 'End time (optional)', type: 'time' },
  { key: 'costHKD', label: 'Estimated cost (HK$) — leave empty if unknown', type: 'number' },
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTS },
  { key: 'priority', label: 'Importance', type: 'select', options: [{ value: 'must', label: 'Must-do' }, { value: 'normal', label: 'Normal' }, { value: 'optional', label: 'Optional' }] },
  { key: 'place', label: 'Place for maps (name or address)', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
];

export function Itinerary({ dayArg }: { dayArg?: string }) {
  const { items: acts, update, add, remove, restore, isEdited, isSeed } = useCollection<Activity>('activities', ACTIVITIES);
  const { state } = useAppState(); const r = state.settings.rates;
  const phase = tripPhase(); const cd = currentDayId();
  const initial = Number(dayArg) || (phase === 'during' && cd ? cd : 1);
  const [dayId, setDayId] = useState(initial);
  useEffect(() => { if (dayArg && Number(dayArg)) setDayId(Number(dayArg)); }, [dayArg]);
  const [dir, setDir] = useState(1);
  const [edit, setEdit] = useState<Activity | null>(null);
  const [adding, setAdding] = useState(false);
  const { checks, toggle } = useChecks();
  const [burst, setBurst] = useState(0);
  const day = dayOf(dayId);
  const list = useMemo(() => sortActs(acts.filter((a) => a.day === dayId)), [acts, dayId]);
  const chips = useRef<HTMLDivElement>(null);
  const pick = (id: number) => { setDir(id > dayId ? 1 : -1); setDayId(id); history.replaceState(null, '', '#/itinerary/' + id); };
  const est = dayEstimate(acts, dayId); const unpriced = unpricedCount(acts, dayId);
  const doneCount = list.filter((a) => actState(a, acts, !!checks['done:' + a.id]) === 'done').length;

  return (
    <div className="pb-4">
      <Confetti burst={burst} />
      <div ref={chips} className="sticky top-0 z-20 -mx-4 flex gap-2 overflow-x-auto bg-paper/90 px-4 pb-2 pt-[calc(var(--safe-t)+10px)] backdrop-blur scroll-hide" role="tablist" aria-label="Trip days">
        {DAYS.map((d) => (
          <button key={d.id} role="tab" aria-selected={d.id === dayId} onClick={() => pick(d.id)}
            className={cx('tap relative shrink-0 rounded-2xl px-4 py-1.5 text-center', d.id === dayId ? 'text-white' : 'bg-white text-navy shadow-sm')}>
            {d.id === dayId && <motion.span layoutId="daychip" className="absolute inset-0 rounded-2xl bg-navy" transition={{ type: 'spring', damping: 28, stiffness: 380 }} />}
            <span className="relative block text-[11px] font-bold uppercase opacity-80">Day {d.id}</span><span className="relative block text-[15px] font-bold">{dateLabel(d.date, { day: 'numeric', month: 'short' })}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={dayId} initial={{ opacity: 0, x: 24 * dir }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 * dir }} transition={{ duration: 0.2 }} className="space-y-4">
          <Card className="overflow-hidden">
            <Photo k={day.photoKey} className="h-[170px]">
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/15 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <p className="text-[13px] font-bold uppercase tracking-wide opacity-90">{day.weekday} · {dateLabel(day.date, { day: 'numeric', month: 'long' })}</p>
                <h1 className="text-[25px] font-bold leading-tight">{day.title}</h1>
              </div>
            </Photo>
            <div className="px-3 pt-2"><RoutePreview stops={day.route} modes={day.routeModes} color={{ sky: '#3aa8f5', coral: '#ff6b57', turq: '#14b8a6', lav: '#8f84ee', sun: '#e6a800' }[day.accent]} /></div>
            <p className="px-4 pb-3 text-[12px] text-muted">Schematic route — not to scale. Use Navigate on each stop for live directions.</p>
          </Card>

          <a href={'#/more/packing/day/' + dayId} className="tap flex items-center justify-center gap-2 rounded-2xl bg-sun px-4 py-3 text-[16px] font-bold text-navy active:scale-[.98]"><Backpack size={20} />Pack Today’s Bag · Day {dayId}</a>

          {dayId === 5 && (
            <div className="flex gap-3 rounded-2xl bg-coral-soft p-4 text-[#8f2f21]" role="note"><TriangleAlert className="mt-0.5 shrink-0" /><div className="text-[14px]"><b>Time-sensitive connection.</b> Cebu Pacific lands at 1:30 PM; PAL leaves at 5:35 PM — 4 h 5 min on two separate bookings. Stroller return, immigration, bags and the T3 → T2 transfer all happen in that window.</div></div>
          )}

          <div className="space-y-0">
            {list.map((a, i) => (
              <ActivityCard key={a.id} a={a} acts={acts} last={i === list.length - 1} accent={day.accent} done={!!checks['done:' + a.id]}
                onToggleDone={() => { const was = !!checks['done:' + a.id]; toggle('done:' + a.id); if (!was && i === list.length - 1) setBurst((b) => b + 1); }}
                onEdit={() => setEdit(a)} edited={isEdited(a.id)} r={r} />
            ))}
          </div>
          <Btn variant="ghost" icon={<Plus size={18} />} className="w-full" onClick={() => setAdding(true)}>Add an activity</Btn>

          {dayId === 1 && <ArrivalChecklist />}
          {dayId === 4 && <PhotoPass />}

          <DaySummary dayId={dayId} est={est} unpriced={unpriced} total={list.length} done={doneCount} r={r} />
        </motion.div>
      </AnimatePresence>

      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit activity" fields={FIELDS}
        values={edit ? { title: edit.title, start: edit.start, end: edit.end ?? '', costHKD: edit.costHKD, status: edit.status, priority: edit.priority, place: edit.place ?? '', notes: edit.notes ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { title: String(v.title || edit.title), start: String(v.start || edit.start), end: v.end ? String(v.end) : undefined, costHKD: v.costHKD as number | null, status: v.status as Status, priority: v.priority as Priority, place: String(v.place ?? ''), notes: String(v.notes ?? '') })}
        onRestore={edit && isSeed(edit.id) && isEdited(edit.id) ? () => restore(edit.id) : undefined}
        onDelete={edit ? () => remove(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title={`New activity · Day ${dayId}`} saveLabel="Add" fields={FIELDS}
        values={{ title: '', start: '12:00', end: '', costHKD: '', status: 'estimated', priority: 'normal', place: '', notes: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), day: dayId, start: String(v.start || '12:00'), end: v.end ? String(v.end) : undefined, title: String(v.title || 'New activity'), kind: 'sight', priority: (v.priority as Priority) || 'normal', status: (v.status as Status) || 'estimated', costHKD: v.costHKD as number | null, place: String(v.place ?? ''), notes: String(v.notes ?? '') })} />
    </div>
  );
}

function ActivityCard({ a, acts, last, accent, done, onToggleDone, onEdit, edited, r }: { a: Activity; acts: Activity[]; last: boolean; accent: string; done: boolean; onToggleDone: () => void; onEdit: () => void; edited: boolean; r: import('../lib/money').Rates }) {
  const [open, setOpen] = useState(false);
  const { docs } = useVault();
  const st = actState(a, acts, done, nowMs());
  const hasDetail = a.notes || a.tips?.length || a.stroller || a.restroom || a.alt || a.link;
  const ticketDocs = a.ticketId ? docs.filter((d) => d.ticketId === a.ticketId).length : 0;
  const fdocs = a.flightId ? docs.filter((d) => d.flightId === a.flightId).length : 0;
  const ticket = a.ticketId ? TICKETS.find((t) => t.id === a.ticketId) : undefined;
  return (
    <div className="flex gap-3">
      <div className="flex w-[58px] shrink-0 flex-col items-center pt-3">
        <div className={cx('text-[12px] font-bold leading-tight', st === 'done' ? 'text-muted' : 'text-navy')}>{fmt12(a.start).replace(' ', ' ')}</div>
        <div className="relative mt-1.5 flex flex-1 flex-col items-center">
          <span className={cx('z-10 grid h-6 w-6 place-items-center rounded-full text-white', st === 'done' ? 'bg-turq' : st === 'current' ? 'bg-coral pulse-dot' : cx('ring-2 ring-inset ring-sky bg-white'))}>
            {st === 'done' && <Check size={14} strokeWidth={3.5} />}{st === 'current' && <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
          {!last && <span className={cx('w-0.5 flex-1', st === 'done' ? 'bg-turq/50' : 'bg-sky/30')} />}
        </div>
      </div>
      <div className="min-w-0 flex-1 pb-3">
        <motion.div layout className={cx('card overflow-hidden', st === 'current' && 'ring-2 ring-coral/70', st === 'done' && 'opacity-80')}>
          <button className="flex w-full items-start gap-2 p-3.5 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
            <span className={cx('mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl text-navy', accentSoft[accent])}>{a.mode ? MODE_ICON[a.mode] : KIND_ICON[a.kind]}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[16px] font-bold leading-snug text-navy">{a.title}</span>
              <span className="mt-1 flex flex-wrap items-center gap-1.5">
                {a.priority === 'must' && <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2 py-0.5 text-[11px] font-bold text-white"><Star size={10} fill="currentColor" />Must-do</span>}
                {a.priority === 'optional' && <span className="rounded-full bg-lav-soft px-2 py-0.5 text-[11px] font-bold text-[#5046b4]">Optional</span>}
                {a.nap && <span className="inline-flex items-center gap-1 rounded-full bg-sky-soft px-2 py-0.5 text-[11px] font-bold text-[#1d5f99]"><Moon size={10} />Nap</span>}
                <StatusPill status={a.status} />
                {a.costHKD ? <span className="text-[12px] font-bold text-muted">~{fmtBoth(a.costHKD, r)}</span> : a.costHKD === null ? <span className="text-[12px] text-muted">price to add</span> : null}
              </span>
              {a.end && <span className="mt-1 block text-[12px] text-muted">until {fmt12(a.end)}{edited && ' · edited'}</span>}
            </span>
            <ChevronDown size={20} className={cx('mt-1 shrink-0 text-muted transition-transform', open && 'rotate-180')} />
          </button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                <div className="space-y-2.5 border-t border-navy/5 px-3.5 pb-3.5 pt-3 text-[14px] text-ink">
                  {a.notes && <p>{a.notes}</p>}
                  {a.tips?.map((t) => <p key={t} className="flex gap-2"><Info size={16} className="mt-0.5 shrink-0 text-sky" />{t}</p>)}
                  {a.stroller && <p className="flex gap-2"><Baby size={16} className="mt-0.5 shrink-0 text-lav" /><span><b>Stroller:</b> {a.stroller}</span></p>}
                  {a.restroom && <p className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-turq" /><span><b>Restroom:</b> {a.restroom}</span></p>}
                  {a.alt && <p className="rounded-xl bg-sky-soft px-3 py-2 text-[13px]">{a.alt}</p>}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {a.place && <a href={mapDir(a.place, a.mode === 'walk' ? 'walking' : a.mode === 'uber' || a.mode === 'car' ? 'driving' : 'transit')} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-[13px] font-bold text-white"><Navigation size={15} />Navigate</a>}
                    {a.place && <a href={mapSearch(a.place)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-sky-soft px-3 py-2 text-[13px] font-bold text-navy"><MapPin size={15} />Map</a>}
                    {a.ticketId && <button onClick={() => go('tickets/' + a.ticketId)} className="tap inline-flex items-center gap-1.5 rounded-xl bg-coral-soft px-3 py-2 text-[13px] font-bold text-[#a63a2b]"><TicketIcon size={15} />{ticketDocs ? `Tickets (${ticketDocs})` : ticket?.statusLabel ?? 'Ticket info'}</button>}
                    {a.flightId && <button onClick={() => go('more/flights')} className="tap inline-flex items-center gap-1.5 rounded-xl bg-coral-soft px-3 py-2 text-[13px] font-bold text-[#a63a2b]"><Plane size={15} />{fdocs ? `Boarding pass (${fdocs})` : FLIGHTS.find((f) => f.id === a.flightId)?.code}</button>}
                    {a.link && <a href={a.link.url} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-[13px] font-bold text-navy ring-1 ring-navy/15"><ExternalLink size={15} />{a.link.label}</a>}
                  </div>
                  <div className="flex items-center justify-between border-t border-navy/5 pt-2.5">
                    <button onClick={onToggleDone} className={cx('tap inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-bold', done ? 'bg-turq-soft text-[#0b6b61]' : 'bg-paper text-navy')}><Check size={16} />{done ? 'Done ✓' : 'Mark done'}</button>
                    <button onClick={onEdit} className="tap inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-bold text-sky"><Pencil size={15} />Edit time & cost</button>
                  </div>
                  {!hasDetail && !a.place && <p className="text-[13px] text-muted">No extra details yet — tap Edit to add notes.</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function ArrivalChecklist() {
  const { checks, toggle } = useChecks();
  const n = ARRIVAL_CHECKLIST.filter((_, i) => checks['arr:' + i]).length;
  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between"><h2 className="text-[19px] font-bold text-navy">Hong Kong arrival checklist</h2><span className="text-[13px] font-bold text-sky">{n}/{ARRIVAL_CHECKLIST.length}</span></div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-sky-soft"><motion.div className="h-full rounded-full bg-turq" animate={{ width: `${(n / ARRIVAL_CHECKLIST.length) * 100}%` }} /></div>
      {ARRIVAL_CHECKLIST.map((t, i) => (
        <label key={t} className="tap flex cursor-pointer items-start gap-3 py-1.5"><input type="checkbox" className="mt-1 h-5 w-5 accent-[#14b8a6]" checked={!!checks['arr:' + i]} onChange={() => toggle('arr:' + i)} /><span className={cx('text-[15px]', checks['arr:' + i] && 'text-muted line-through')}>{t}</span></label>
      ))}
    </Card>
  );
}

function PhotoPass() {
  const { checks, toggle } = useChecks();
  const rows = [
    'Visit official PhotoPass photographers at participating locations (Main Street, U.S.A., the Castle of Magical Dreams, World of Frozen, character photo spots)',
    'Have each photographer scan your PhotoPass card or link the photo to your account — confirm how on site',
    'Review and download all our photographs after the visit',
  ];
  return (
    <Card className="overflow-hidden">
      <div className="bg-lav-soft px-4 py-3"><div className="flex items-center gap-2 text-navy"><Camera size={20} /><h2 className="text-[19px] font-bold">Disney PhotoPass</h2></div><p className="text-[13px] text-[#4a3fa8]">Official Disneyland photographers only — no outside photographer.</p></div>
      <div className="space-y-3 p-4 text-[14px]">
        <div className="flex items-center gap-2"><StatusPill status="pending" label="Not yet purchased" /><span className="text-muted">Package &amp; price: verify on the official site</span></div>
        {rows.map((t, i) => (
          <label key={i} className="flex cursor-pointer items-start gap-3"><input type="checkbox" className="mt-1 h-5 w-5 accent-[#8f84ee]" checked={!!checks['pp:' + i]} onChange={() => toggle('pp:' + i)} /><span className={cx(checks['pp:' + i] && 'text-muted line-through')}>{t}</span></label>
        ))}
        <p className="rounded-xl bg-sun-soft px-3 py-2 text-[13px] text-[#6d4b00]">Photo locations, availability, hours and package pricing are not confirmed here. Check official Disney information before you go.</p>
        <div className="flex flex-wrap gap-2">
          <a href={LINKS.disney} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-[13px] font-bold text-white"><ExternalLink size={15} />Official Disney site</a>
          <button onClick={() => go('tickets/t-photopass')} className="tap inline-flex items-center gap-1.5 rounded-xl bg-coral-soft px-3 py-2 text-[13px] font-bold text-[#a63a2b]"><TicketIcon size={15} />PhotoPass in wallet</button>
          <button onClick={() => go('more/expenses')} className="tap inline-flex items-center gap-1.5 rounded-xl bg-sky-soft px-3 py-2 text-[13px] font-bold text-navy">Log the actual price</button>
        </div>
      </div>
    </Card>
  );
}

function DaySummary({ dayId, est, unpriced, total, done, r }: { dayId: number; est: number; unpriced: number; total: number; done: number; r: import('../lib/money').Rates }) {
  const [note, setNote] = useNote('day:' + dayId);
  return (
    <Card className="p-4">
      <h2 className="mb-2 text-[19px] font-bold text-navy">End-of-day summary</h2>
      <div className="grid grid-cols-2 gap-3 text-[14px]">
        <div className="rounded-2xl bg-turq-soft p-3"><div className="text-[12px] font-bold uppercase text-[#0b6b61]">Done</div><div className="text-[20px] font-bold text-navy">{done}/{total}</div></div>
        <div className="rounded-2xl bg-sky-soft p-3"><div className="text-[12px] font-bold uppercase text-[#1d5f99]">Planned spend</div><div className="text-[17px] font-bold text-navy">{fmtBoth(est, r)}</div></div>
      </div>
      {unpriced > 0 && <p className="mt-2 text-[13px] text-muted">{unpriced} item{unpriced > 1 ? 's' : ''} without a price yet — edit them to improve this estimate.</p>}
      <label className="mt-3 block text-[14px] font-bold text-navy">Our notes for today
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Favorite moments, what to change tomorrow…" className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-2.5 text-[15px] font-normal" /></label>
    </Card>
  );
}
export { accentBg, catOf };
