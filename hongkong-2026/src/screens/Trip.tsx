import { lazy, Suspense, useState } from 'react';
import { Bed, Clock, Copy, ExternalLink, FileText, MapPin, Pencil, Phone, Plane, Plus, TriangleAlert, Navigation, ShoppingCart, Pill, Utensils, Train } from 'lucide-react';
import { FLIGHTS, HOTEL } from '../data/seed';
import { useAppState, useCollection } from '../state/store';
import { useVault } from '../state/vault';
import { dateLabel, fmt12, fmtDur, toMin } from '../lib/time';
import { fmtHKD, fmtPHP, hkdToPhp, usdToPhp } from '../lib/money';
import { mapDir, mapNearby, mapSearch, tel } from '../lib/maps';
import { Btn, Card, PageHeader, SectionTitle, StatusPill } from '../ui/primitives';
import { ImportSheet } from '../ui/ImportSheet';
import { EditSheet } from '../ui/EditSheet';
import type { DocRecord, Flight } from '../types';
const DocViewer = lazy(() => import('./DocViewer').then((m) => ({ default: m.DocViewer })));

export function FlightsHotel() {
  const { items: flights } = useCollection<Flight>('flights', FLIGHTS);
  const { docs, key } = useVault();
  const { hotel, setState, state } = useAppState();
  const [imp, setImp] = useState<{ flightId?: string; folder: string } | null>(null);
  const [view, setView] = useState<DocRecord[] | null>(null);
  const [editH, setEditH] = useState(false);
  const r = state.settings.rates;
  const [copied, setCopied] = useState(false);
  const hotelDocs = docs.filter((d) => d.folder === '03 - Hotel');
  const conn = (a: Flight, b: Flight) => toMin(b.dep) - toMin(a.arr);
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { prompt('Copy this address:', t); } };
  const hq = `${hotel.name}, ${hotel.address}`;
  const owed = hotel.localTaxHKD; const dep = hotel.depositHKD;
  return (
    <div className="pb-4">
      <PageHeader title="Flights & Hotel" back="more" />
      <SectionTitle>Flights</SectionTitle>
      <div className="space-y-3">
        {flights.map((f, i) => {
          const fd = docs.filter((d) => d.flightId === f.id);
          const next = flights[i + 1];
          const showConn = next && next.date === f.date || (i === 2);
          return (
            <div key={f.id}>
              <Card className="p-4">
                <div className="flex items-start justify-between gap-2"><div><div className="text-[12px] font-bold uppercase text-muted">{dateLabel(f.date, { weekday: 'long', day: 'numeric', month: 'long' })}</div><div className="text-[17px] font-bold text-navy">{f.airline} · {f.code}</div></div><StatusPill status={f.status} /></div>
                <div className="my-3 flex items-center gap-3">
                  <div className="text-center"><div className="font-display text-[26px] font-bold leading-none text-navy">{f.fromCode}</div><div className="text-[13px] text-muted">{fmt12(f.dep)}</div></div>
                  <div className="relative h-0.5 flex-1 bg-sky/40"><Plane size={18} className="absolute -top-[9px] left-1/2 -translate-x-1/2 rotate-90 bg-white text-sky" /></div>
                  <div className="text-center"><div className="font-display text-[26px] font-bold leading-none text-navy">{f.toCode}</div><div className="text-[13px] text-muted">{fmt12(f.arr)}</div></div>
                </div>
                <dl className="space-y-1.5 text-[14px]">
                  {f.depTerminal && <Row k="Departs" v={f.depTerminal} />}{f.arrTerminal && <Row k="Arrives" v={f.arrTerminal} />}
                  <Row k="Seats" v={f.seats.length ? f.seats.map((s) => `${s.who} ${s.seat}`).join(' · ') : 'Currently unassigned'} />
                  <Row k="Checked bag" v={f.baggage} /><Row k="Carry-on" v={f.carryOn} />
                </dl>
                {f.notes && <p className="mt-2 rounded-xl bg-sun-soft px-3 py-2 text-[13px] text-[#6d4b00]">{f.notes}</p>}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Btn disabled={!fd.length} icon={<FileText size={18} />} onClick={() => setView(fd)} className="text-[14px]">Boarding pass{fd.length > 1 ? `es (${fd.length})` : ''}</Btn>
                  <Btn variant="ghost" icon={<Plus size={18} />} onClick={() => setImp({ flightId: f.id, folder: '01 - Flights' })} className="text-[14px]">Import file</Btn>
                  {f.bookingUrl && <a href={f.bookingUrl} target="_blank" rel="noopener noreferrer" className="tap col-span-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-white text-[14px] font-bold text-navy ring-1 ring-inset ring-navy/15"><ExternalLink size={16} />Airline site</a>}
                </div>
              </Card>
              {showConn && next && (
                <div className="my-2 flex items-start gap-2 rounded-2xl bg-coral-soft px-4 py-3 text-[13px] text-[#8f2f21]"><Clock size={18} className="mt-0.5 shrink-0" /><span><b>{fmtDur(conn(f, next))} between {f.code} and {next.code}.</b> Different airlines: bags are not checked through. {f.date === '2026-12-11' ? 'TIME-SENSITIVE — immigration, baggage, stroller return and T3 → T2.' : 'Includes the T2 → T3 transfer, stroller pickup and check-in.'}</span></div>
              )}
            </div>
          );
        })}
      </div>

      <SectionTitle action={<button onClick={() => setEditH(true)} className="tap flex items-center gap-1 text-[14px] font-bold text-sky"><Pencil size={15} />Edit</button>}>Hotel</SectionTitle>
      <Card className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2"><div className="flex items-center gap-2"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-turq-soft text-[#0b6b61]"><Bed /></span><div><h2 className="text-[19px] font-bold leading-tight text-navy">{hotel.name}</h2><p className="text-[13px] text-muted">{hotel.room} · {hotel.guests} · {hotel.nights} nights</p></div></div><StatusPill status="confirmed" /></div>
        <dl className="space-y-1.5 text-[14px]">
          <Row k="Address" v={hotel.address} /><Row k="Chinese address" v={hotel.addressZh || 'Not verified yet — ask the hotel, then tap Edit'} />
          <Row k="Check-in" v={hotel.checkIn} /><Row k="Check-out" v={hotel.checkOut} /><Row k="Booked via" v={`${hotel.bookedVia} · no Business Room upgrade`} />
          <Row k="Shuttle" v={hotel.shuttleNote} />
        </dl>
        <div className="grid grid-cols-2 gap-2">
          <Btn variant="soft" icon={<Copy size={17} />} onClick={() => copy(hotel.address)} className="text-[14px]">{copied ? 'Copied ✓' : 'Copy address'}</Btn>
          <a href={mapSearch(hq)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-soft font-bold text-navy text-[14px]"><MapPin size={17} />Google Maps</a>
          <a href={tel(hotel.phone)} className="tap inline-flex items-center justify-center gap-2 rounded-2xl bg-turq-soft font-bold text-[#0b6b61] text-[14px]"><Phone size={17} />Call hotel</a>
          <Btn disabled={!hotelDocs.length} icon={<FileText size={17} />} onClick={() => setView(hotelDocs)} className="text-[14px]">Original booking</Btn>
        </div>
        <Btn variant="ghost" className="w-full text-[14px]" icon={<Plus size={17} />} onClick={() => setImp({ folder: '03 - Hotel' })}>Import hotel confirmation</Btn>
        <a href={mapDir(hq, 'transit')} target="_blank" rel="noopener noreferrer" className="tap flex items-center justify-center gap-2 rounded-2xl bg-navy font-bold text-white"><Navigation size={18} />Return to hotel</a>
      </Card>

      <SectionTitle>Check-in instructions</SectionTitle>
      <Card className="space-y-2 p-4 text-[14px]">
        <p>Check-in starts at <b>2:00 PM</b> on Monday, Dec 7. We arrive in the evening, so no early check-in is needed.</p>
        <p>Have passports and the booking ready (original booking is in the wallet). The hotel may ask for the <b>HK${hotel.localTaxHKD.toFixed(2)}</b> local tax and a <b>HK${hotel.depositHKD}</b> deposit — record how you paid below.</p>
        <p className="text-muted">Extra check-in requirements are not confirmed here — check the hotel’s message on Expedia.</p>
      </Card>

      <SectionTitle>Hotel money</SectionTitle>
      <Card className="space-y-2 p-4 text-[14px]">
        <Row k="Total reservation" v={`${fmtPHP(usdToPhp(hotel.totalUSD, r))} · ${fmtHKD(usdToPhp(hotel.totalUSD, r) / r.hkdToPhp)} (Expedia; converted)`} /><Row k="Already paid" v={`${fmtPHP(usdToPhp(hotel.paidUSD, r))} · ${fmtHKD(usdToPhp(hotel.paidUSD, r) / r.hkdToPhp)}`} />
        <Row k="Local tax due at property" v={`HK$${owed.toFixed(2)} · ${fmtPHP(hkdToPhp(owed, r))}`} />
        <Row k="Deposit (refundable?)" v={`HK$${dep} per stay — kept separate from spending`} />
        <label className="block pt-1 font-bold text-navy">How was the deposit handled?
          <select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={hotel.depositStatus} onChange={(e) => setState((s) => ({ ...s, hotel: { ...s.hotel, depositStatus: e.target.value as typeof hotel.depositStatus } }))}>
            <option value="unknown">Not recorded yet</option><option value="paid-cash">Paid in cash</option><option value="paid-card">Held on card</option><option value="refunded">Refunded ✓</option>
          </select></label>
        <label className="block font-bold text-navy">Payment method used at the hotel
          <input className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={hotel.paymentMethod} placeholder="e.g. Wise card / cash" onChange={(e) => setState((s) => ({ ...s, hotel: { ...s.hotel, paymentMethod: e.target.value } }))} /></label>
      </Card>

      <SectionTitle>Around the hotel</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        <a href={mapNearby('Rambler Plaza restaurants Tsing Yi').replace('+near+me', '')} target="_blank" rel="noopener noreferrer" className="tap flex items-center gap-2 rounded-2xl bg-pink-soft px-3 py-3 text-[14px] font-bold text-navy"><Utensils size={18} />Restaurants</a>
        <a href={mapSearch('supermarket near ' + hq)} target="_blank" rel="noopener noreferrer" className="tap flex items-center gap-2 rounded-2xl bg-turq-soft px-3 py-3 text-[14px] font-bold text-navy"><ShoppingCart size={18} />Groceries</a>
        <a href={mapSearch('pharmacy near ' + hq)} target="_blank" rel="noopener noreferrer" className="tap flex items-center gap-2 rounded-2xl bg-coral-soft px-3 py-3 text-[14px] font-bold text-navy"><Pill size={18} />Pharmacy</a>
        <a href={mapDir('Tsing Yi MTR Station', 'walking')} target="_blank" rel="noopener noreferrer" className="tap flex items-center gap-2 rounded-2xl bg-sky-soft px-3 py-3 text-[14px] font-bold text-navy"><Train size={18} />Hotel → MTR</a>
      </div>
      <p className="mt-2 flex gap-2 px-1 text-[13px] text-muted"><TriangleAlert size={15} className="mt-0.5 shrink-0" />Hotel shuttle times are not confirmed — we do not guess them. Ask the hotel at +852 2129 1888.</p>

      <ImportSheet open={!!imp} onClose={() => setImp(null)} target={imp ?? undefined} />
      <EditSheet open={editH} onClose={() => setEditH(false)} title="Edit hotel details" fields={[
        { key: 'addressZh', label: 'Chinese address (verified)', type: 'text', hint: 'Paste it once the hotel or Expedia confirms it — show it to taxi drivers.' },
        { key: 'phone', label: 'Hotel phone', type: 'text' }, { key: 'shuttleNote', label: 'Shuttle note', type: 'textarea' }, { key: 'notes', label: 'Notes', type: 'textarea' },
      ]} values={{ addressZh: hotel.addressZh, phone: hotel.phone, shuttleNote: hotel.shuttleNote, notes: hotel.notes }}
        onSave={(v) => setState((s) => ({ ...s, hotel: { ...s.hotel, addressZh: String(v.addressZh ?? ''), phone: String(v.phone ?? HOTEL.phone), shuttleNote: String(v.shuttleNote ?? ''), notes: String(v.notes ?? '') } }))}
        onRestore={() => setState((s) => ({ ...s, hotel: {} }))} />
      {view && <Suspense fallback={null}><DocViewer docs={view} dataKey={key} onClose={() => setView(null)} /></Suspense>}
    </div>
  );
}
const Row = ({ k, v }: { k: string; v: string }) => <div className="flex gap-3"><dt className="w-[104px] shrink-0 font-bold text-muted">{k}</dt><dd className="min-w-0 flex-1 text-ink">{v}</dd></div>;
