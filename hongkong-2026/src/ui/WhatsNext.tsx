import { ExternalLink, Navigation, Ticket as TicketIcon } from 'lucide-react';
import { ACTIVITIES, TICKETS } from '../data/seed';
import { useChecks, useCollection } from '../state/store';
import { nextStop, minsText } from '../lib/next';
import { dateLabel, fmt12 } from '../lib/time';
import { dayOf } from '../lib/trip';
import { mapDir, mapSearch } from '../lib/maps';
import { Sheet, StatusPill } from './primitives';
import { go } from './router';
import type { Activity, Ticket } from '../types';

/** “What is next?” — from your plan only. No live location or arrival detection is used. */
export function WhatsNext({ open, onClose }: { open: boolean; onClose: () => void }) {
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const tickets = useCollection<Ticket>('tickets', TICKETS).items;
  const { checks } = useChecks();
  const n = open ? nextStop(acts, checks, undefined, { destinationOnly: true }) : null;
  const a = n?.a; const t = a?.ticketId ? tickets.find((x) => x.id === a.ticketId) : undefined;
  const skipOk = a ? (a.priority === 'optional' ? 'Yes — this is optional.' : a.skip ? `Yes, if needed: ${a.skip}` : a.priority === 'must' ? 'Try not to skip — it is a must-do.' : 'Can be shortened if you are tired.') : '';
  return (
    <Sheet open={open} onClose={onClose} title="What is next?">
      {!a ? <p className="py-4 text-[15px] text-muted">Nothing left on the plan.</p> : (
        <div className="space-y-3 pb-2 pt-1 text-[14px]">
          <div className="rounded-2xl bg-navy p-4 text-white">
            <div className="text-[12px] font-bold uppercase text-white/70">{n!.started ? 'Happening now' : n!.minutes > 1440 ? 'First stop of the trip' : 'Coming up'}</div>
            <div className="text-[19px] font-bold leading-snug">{a.title}</div>
            <div className="mt-1 text-white/80">{dateLabel(dayOf(a.day).date, { weekday: 'short', day: 'numeric', month: 'short' })} · {fmt12(a.start)}{a.end ? ` – ${fmt12(a.end)}` : ''}</div>
            <div className="mt-1 font-bold text-sun">{n!.started ? `started ${minsText(n!.minutes)} ago` : `in ${minsText(n!.minutes)}`}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2"><StatusPill status={a.status} />{a.mode && <span className="rounded-full bg-sky-soft px-2.5 py-0.5 text-[12px] font-bold text-[#1d5f99]">{a.mode.toUpperCase()}</span>}{a.priority === 'optional' && <span className="rounded-full bg-lav-soft px-2.5 py-0.5 text-[12px] font-bold text-[#5046b4]">Optional</span>}</div>
          {(a.address || a.place) && <p><b className="text-navy">Where:</b> {a.address || a.place}</p>}
          {a.route && <p><b className="text-navy">Route:</b> {a.route}</p>}
          {a.travel && <p><b className="text-navy">Travel:</b> {a.travel}</p>}
          {a.walk && <p><b className="text-navy">Walking:</b> {a.walk}</p>}
          {a.flex && <p className="rounded-xl bg-paper px-3 py-2 text-[13px]">{a.flex}</p>}
          {t && <button onClick={() => { onClose(); go('tickets/' + t.id); }} className="tap flex w-full items-center gap-2 rounded-2xl bg-coral-soft px-3 text-left font-bold text-[#a63a2b]"><TicketIcon size={18} />{t.name} — {t.statusLabel ?? t.status}. Open ticket</button>}
          <p className="rounded-xl bg-lav-soft px-3 py-2"><b className="text-[#5046b4]">OK to skip?</b> {skipOk}</p>
          <div className="flex flex-wrap gap-2">
            {(a.address || a.place) && <a href={mapDir(a.address || a.place!)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 font-bold text-white"><Navigation size={16} />Navigate now</a>}
            {(a.address || a.place) && <a href={mapSearch(a.address || a.place!)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-sky-soft px-3 font-bold text-navy">Map</a>}
            {a.verify?.slice(0, 2).map((v) => <a key={v.url} href={v.url} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-sun-soft px-3 font-bold text-[#6d4b00]"><ExternalLink size={15} />Verify</a>)}
          </div>
          <p className="text-[12px] text-muted">Shows your next DESTINATION (stops with a place). Navigate now opens Google Maps (needs internet). The text directions above work offline.</p>
        </div>
      )}
    </Sheet>
  );
}
