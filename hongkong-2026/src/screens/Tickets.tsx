import { lazy, Suspense, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, FileText, FolderOpen, Maximize, Plus, Ticket as TicketIcon, Users, TriangleAlert, Camera } from 'lucide-react';
import { TICKETS } from '../data/seed';
import { useCollection } from '../state/store';
import { useVault } from '../state/vault';
import { dateLabel } from '../lib/time';
import { mapSearch } from '../lib/maps';
import { Btn, Card, Empty, PageHeader, StatusPill, cx } from '../ui/primitives';
import { Photo } from '../ui/Photo';
import { ImportSheet } from '../ui/ImportSheet';
import { go } from '../ui/router';
import type { DocRecord, Ticket } from '../types';
const DocViewer = lazy(() => import('./DocViewer').then((m) => ({ default: m.DocViewer })));

export function Tickets({ focus }: { focus?: string }) {
  const { items } = useCollection<Ticket>('tickets', TICKETS);
  const { docs, key } = useVault();
  const [view, setView] = useState<{ list: DocRecord[]; start: number; title: string } | null>(null);
  const [imp, setImp] = useState<string | null>(null);
  const sorted = useMemo(() => [...items].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name)), [items]);
  const all = docs.filter((d) => d.ticketId);
  return (
    <div className="pb-4">
      <PageHeader title="Tickets" sub="Original files, exactly as you saved them" right={<Btn variant="soft" icon={<Plus size={18} />} onClick={() => setImp('')} className="!px-3 text-[14px]">Add</Btn>} />
      {all.length > 0 && (
        <Btn className="mb-3 w-full" icon={<Maximize size={18} />} onClick={() => setView({ list: sorted.flatMap((t) => all.filter((d) => d.ticketId === t.id)), start: 0, title: 'All tickets' })}>Full-screen scanning view · all tickets ({all.length})</Btn>
      )}
      <div className="space-y-4">
        {sorted.map((t, i) => {
          const tdocs = docs.filter((d) => d.ticketId === t.id);
          return (
            <motion.div key={t.id} id={'t-' + t.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 5) * 0.04 }}>
              <Card className={cx('overflow-hidden', focus === t.id && 'ring-2 ring-coral')}>
                <Photo k={t.photoKey} className="h-[130px]">
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
                  <div className="absolute inset-x-4 bottom-3 text-white"><div className="text-[12px] font-bold uppercase opacity-90">Day {t.dayId} · {dateLabel(t.date)}</div><h2 className="text-[21px] font-bold leading-tight">{t.name}</h2></div>
                </Photo>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap items-center gap-2"><StatusPill status={t.status} label={t.statusLabel} /><span className="text-[13px] text-muted">{t.type}</span></div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[13px] font-bold uppercase text-muted"><Users size={14} />{t.guests.length} guest{t.guests.length > 1 ? 's' : ''}</div>
                    {t.guests.map((g, gi) => {
                      const gd = tdocs.filter((d) => d.slot === g.label || (!d.slot && tdocs.length === 1 && gi === 0));
                      return (
                        <div key={g.label} className="flex items-center gap-2 rounded-2xl bg-paper px-3 py-2">
                          <span className="min-w-0 flex-1 text-[14px] font-bold text-navy">{g.label}</span>
                          {gd.length ? <button onClick={() => setView({ list: tdocs, start: Math.max(0, tdocs.indexOf(gd[0])), title: t.name })} className="tap inline-flex items-center gap-1 rounded-xl bg-navy px-3 text-[13px] font-bold text-white"><TicketIcon size={15} />Show</button> : <span className="text-[12px] text-muted">no file</span>}
                        </div>
                      );
                    })}
                  </div>
                  {t.notes && <p className="text-[14px]">{t.notes}</p>}
                  {t.restrictions?.length ? <ul className="space-y-1 text-[13px] text-muted">{t.restrictions.map((r) => <li key={r} className="flex gap-2"><TriangleAlert size={15} className="mt-0.5 shrink-0 text-sun" />{r}</li>)}</ul> : null}
                  <div className="grid grid-cols-2 gap-2">
                    <Btn disabled={!tdocs.length} icon={<TicketIcon size={18} />} onClick={() => setView({ list: tdocs, start: 0, title: t.name })} className="text-[14px]">Show original tickets</Btn>
                    <Btn variant="soft" disabled={!tdocs.some((d) => d.mime === 'application/pdf')} icon={<FileText size={18} />} onClick={() => setView({ list: tdocs.filter((d) => d.mime === 'application/pdf'), start: 0, title: t.name + ' — full PDF' })} className="text-[14px]">View full PDF</Btn>
                    <Btn variant="ghost" icon={<FolderOpen size={18} />} onClick={() => setImp(t.id)} className="text-[14px]">{tdocs.length ? 'Add more files' : 'Import files'}</Btn>
                    {t.bookingUrl && <a href={t.bookingUrl} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3 text-[14px] font-bold text-navy ring-1 ring-inset ring-navy/15"><ExternalLink size={16} />{t.bookingLabel ?? 'Booking site'}</a>}
                  </div>
                  {t.id === 't-photopass' && <p className="flex gap-2 text-[13px] text-muted"><Camera size={15} className="mt-0.5 shrink-0" />No ticket needed until you buy a package — then import the receipt here and log the price in Expenses.</p>}
                  <div className="flex gap-3 text-[13px] font-bold text-sky"><button onClick={() => go('itinerary/' + t.dayId)}>See Day {t.dayId}</button>{t.place && <a href={mapSearch(t.place)} target="_blank" rel="noopener noreferrer">Open map</a>}</div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {!sorted.length && <Empty icon={<TicketIcon size={36} />} title="No tickets">Add one with the Add button.</Empty>}
      <ImportSheet open={imp !== null} onClose={() => setImp(null)} target={imp ? { ticketId: imp, folder: '02 - Attraction Tickets' } : { folder: '02 - Attraction Tickets' }} />
      {view && <Suspense fallback={null}><DocViewer docs={view.list} start={view.start} title={view.title} dataKey={key} onClose={() => setView(null)} /></Suspense>}
    </div>
  );
}
