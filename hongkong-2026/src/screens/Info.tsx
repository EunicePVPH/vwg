import { useState } from 'react';
import { CloudSun, ExternalLink, MapPin, Pencil, Phone, Plus, Search, Siren } from 'lucide-react';
import { DAYS, EMERGENCY, GUIDE, HEALTH, LINKS, RESTAURANTS } from '../data/seed';
import { useCollection } from '../state/store';
import { cachedWx, fetchWx, wxEmoji, wxText, type Wx } from '../lib/weather';
import { mapNearby, mapSearch, tel } from '../lib/maps';
import { dateLabel } from '../lib/time';
import { Btn, Card, PageHeader, SectionTitle, StatusPill } from '../ui/primitives';
import { EditSheet } from '../ui/EditSheet';
import { useEffect } from 'react';
import type { EmergencyItem, HealthItem, Restaurant, Status } from '../types';

export function Food() {
  const { items, add, update, remove } = useCollection<Restaurant>('restaurants', RESTAURANTS);
  const [adding, setAdding] = useState(false); const [edit, setEdit] = useState<Restaurant | null>(null);
  const fields = [{ key: 'name', label: 'Name', type: 'text' as const }, { key: 'area', label: 'Area', type: 'text' as const }, { key: 'kind', label: 'For (meal / day)', type: 'text' as const }, { key: 'query', label: 'Search text for maps', type: 'text' as const }, { key: 'note', label: 'Notes', type: 'textarea' as const }];
  return (
    <div className="pb-4">
      <PageHeader title="Food Finder" back="more" right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />
      <a href={mapNearby('restaurants')} target="_blank" rel="noopener noreferrer" className="tap mb-3 flex items-center justify-center gap-2 rounded-3xl bg-navy py-4 text-[17px] font-bold text-white"><Search size={20} />Food near me now</a>
      <p className="mb-2 px-1 text-[13px] text-muted">We do not make up restaurant names or opening hours. Tap a row to search Google Maps for real, current places, then save your picks with Add.</p>
      {DAYS.map((d) => {
        const rs = items.filter((r) => r.dayId === d.id); if (!rs.length) return null;
        return <section key={d.id}><SectionTitle>Day {d.id} · {d.title}</SectionTitle><div className="space-y-2">{rs.map((r) => <Row key={r.id} r={r} onEdit={() => setEdit(r)} />)}</div></section>;
      })}
      {items.some((r) => !r.dayId) && <section><SectionTitle>Anytime</SectionTitle><div className="space-y-2">{items.filter((r) => !r.dayId).map((r) => <Row key={r.id} r={r} onEdit={() => setEdit(r)} />)}</div></section>}
      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit place" fields={fields} values={edit ? { name: edit.name, area: edit.area, kind: edit.kind, query: edit.query, note: edit.note ?? '' } : {}}
        onSave={(v) => edit && update(edit.id, { name: String(v.name), area: String(v.area), kind: String(v.kind), query: String(v.query), note: String(v.note ?? ''), status: 'confirmed' as Status })} onDelete={edit ? () => remove(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Save a place" saveLabel="Save" fields={fields} values={{ name: '', area: '', kind: 'Meal', query: '', note: '' }}
        onSave={(v) => add({ id: 'u-' + Date.now().toString(36), name: String(v.name || 'Place'), area: String(v.area ?? ''), kind: String(v.kind ?? ''), query: String(v.query || v.name), note: String(v.note ?? ''), status: 'confirmed' })} />
    </div>
  );
}
function Row({ r, onEdit }: { r: Restaurant; onEdit: () => void }) {
  return (
    <Card className="flex items-center gap-3 p-3.5">
      <a href={mapSearch(r.query)} target="_blank" rel="noopener noreferrer" className="flex min-w-0 flex-1 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-pink-soft text-[#a1305a]"><MapPin /></span>
        <span className="min-w-0"><span className="block text-[15px] font-bold leading-snug text-navy">{r.name}</span><span className="block text-[12px] text-muted">{r.area} · {r.kind}</span>{r.note && <span className="block text-[12px] text-muted">{r.note}</span>}</span></a>
      <StatusPill status={r.status} />
      <button onClick={onEdit} aria-label="Edit" className="tap grid place-items-center text-muted"><Pencil size={17} /></button>
    </Card>
  );
}

export function Guide() {
  const [wx, setWx] = useState<Wx[] | null>(cachedWx()?.days ?? null);
  useEffect(() => { fetchWx().then((d) => d && setWx(d)); }, []);
  const trip = wx?.filter((x) => x.date >= '2026-12-07' && x.date <= '2026-12-11') ?? [];
  return (
    <div className="pb-4">
      <PageHeader title="Hong Kong Guide" back="more" />
      <SectionTitle>Weather</SectionTitle>
      <Card className="p-4">
        {trip.length ? <div className="grid grid-cols-5 gap-1 text-center">{trip.map((w) => <div key={w.date} className="rounded-2xl bg-sky-soft p-2"><div className="text-[11px] font-bold text-muted">{dateLabel(w.date, { weekday: 'short', day: 'numeric' })}</div><div className="text-[22px]" title={wxText(w.code)}>{wxEmoji(w.code)}</div><div className="text-[12px] font-bold text-navy">{w.lo}–{w.hi}°</div><div className="text-[11px] text-muted">{w.rain}%</div></div>)}</div>
          : <div className="flex items-center gap-3 text-[14px]"><CloudSun className="text-sky" /><div>Forecast for Dec 7–11 appears here about 16 days before the trip (needs internet). It is usually mild and dry in December.</div></div>}
        <a href={LINKS.hko} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-sky"><ExternalLink size={14} />Hong Kong Observatory</a>
      </Card>
      {GUIDE.map((g) => (<section key={g.title}><SectionTitle>{g.title}</SectionTitle><Card className="space-y-2 p-4">{g.items.map((t) => <p key={t} className="flex gap-2 text-[14px]"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-sky" />{t}</p>)}</Card></section>))}
    </div>
  );
}

export function Health() {
  const { items, add, update, remove } = useCollection<HealthItem>('health', HEALTH);
  const [edit, setEdit] = useState<HealthItem | null>(null); const [adding, setAdding] = useState(false);
  const fields = [{ key: 'kind', label: 'Type', type: 'select' as const, options: [{ value: 'medicine', label: 'Medicine' }, { value: 'allergy', label: 'Allergy' }, { value: 'contact', label: 'Contact' }, { value: 'note', label: 'Note' }] }, { key: 'label', label: 'Title', type: 'text' as const }, { key: 'value', label: 'Details', type: 'textarea' as const, hint: 'Follow your own doctor’s advice for any medicine and dose.' }];
  return (
    <div className="pb-4">
      <PageHeader title="Health & Medicines" back="more" right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />
      <Card className="mb-3 flex gap-3 !bg-coral-soft p-4 text-[14px] text-[#8f2f21]"><Siren className="shrink-0" /><div>For an emergency in Hong Kong call <a className="font-bold underline" href="tel:999">999</a>. This page only stores your own notes — it gives no medical advice or doses.</div></Card>
      <div className="space-y-2">{items.map((h) => (
        <Card key={h.id} onClick={() => setEdit(h)} className="p-4"><div className="text-[12px] font-bold uppercase text-muted">{h.kind}</div><div className="text-[16px] font-bold text-navy">{h.label}</div><div className="text-[14px] text-ink">{h.value}</div></Card>
      ))}</div>
      <p className="mt-3 px-1 text-[13px] text-muted">Pharmacy near the hotel: <a className="font-bold text-sky" target="_blank" rel="noopener noreferrer" href={mapSearch('pharmacy near Rambler Oasis Hotel Tsing Yi')}>search on Google Maps</a>.</p>
      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit" fields={fields} values={edit ? { ...edit } : {}} onSave={(v) => edit && update(edit.id, { kind: v.kind as HealthItem['kind'], label: String(v.label), value: String(v.value ?? '') })} onDelete={edit ? () => remove(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Add note" saveLabel="Add" fields={fields} values={{ kind: 'medicine', label: '', value: '' }} onSave={(v) => add({ id: 'u-' + Date.now().toString(36), kind: v.kind as HealthItem['kind'], label: String(v.label || 'Note'), value: String(v.value ?? '') })} />
    </div>
  );
}

export function Emergency() {
  const { items, add, update, remove } = useCollection<EmergencyItem>('emergency', EMERGENCY);
  const [edit, setEdit] = useState<EmergencyItem | null>(null); const [adding, setAdding] = useState(false);
  const fields = [{ key: 'label', label: 'Who / what', type: 'text' as const }, { key: 'phone', label: 'Phone number', type: 'text' as const }, { key: 'note', label: 'Notes', type: 'textarea' as const }];
  return (
    <div className="pb-4">
      <PageHeader title="Emergency" back="more" right={<Btn variant="soft" icon={<Plus size={18} />} className="!px-3 text-[14px]" onClick={() => setAdding(true)}>Add</Btn>} />
      <a href="tel:999" className="tap mb-3 flex items-center justify-center gap-3 rounded-3xl bg-coral py-5 text-[22px] font-bold text-white active:scale-[.99]"><Phone size={26} />Call 999 · Hong Kong emergency</a>
      <div className="space-y-2">{items.filter((e) => e.id !== 'em-999').map((e) => (
        <Card key={e.id} className="flex items-center gap-3 p-4">
          <div className="min-w-0 flex-1"><div className="text-[15px] font-bold text-navy">{e.label}</div>{e.phone ? <div className="text-[14px]">{e.phone}</div> : null}{e.note && <div className="text-[13px] text-muted">{e.note}</div>}{!e.phone && <StatusPill status="verify" label="Add the number" />}</div>
          {e.phone && <a href={tel(e.phone)} aria-label={`Call ${e.label}`} className="tap grid h-12 w-12 place-items-center rounded-2xl bg-turq-soft text-[#0b6b61]"><Phone /></a>}
          <button onClick={() => setEdit(e)} aria-label="Edit" className="tap grid place-items-center text-muted"><Pencil size={17} /></button>
        </Card>
      ))}</div>
      <Card className="mt-3 p-4 text-[14px]"><div className="font-bold text-navy">If Aya is lost or hurt</div><p className="mt-1 text-muted">Stay where you are, tell the nearest staff member, call 999, then call the hotel. Keep a photo of Aya on your phone and a card with a parent’s phone number in her pocket.</p></Card>
      <EditSheet open={!!edit} onClose={() => setEdit(null)} title="Edit contact" fields={fields} values={edit ? { label: edit.label, phone: edit.phone ?? '', note: edit.note ?? '' } : {}} onSave={(v) => edit && update(edit.id, { label: String(v.label), phone: String(v.phone ?? ''), note: String(v.note ?? ''), status: v.phone ? 'confirmed' : 'verify' })} onDelete={edit ? () => remove(edit.id) : undefined} />
      <EditSheet open={adding} onClose={() => setAdding(false)} title="Add contact" saveLabel="Add" fields={fields} values={{ label: '', phone: '', note: '' }} onSave={(v) => add({ id: 'u-' + Date.now().toString(36), label: String(v.label || 'Contact'), phone: String(v.phone ?? ''), note: String(v.note ?? ''), status: 'confirmed' })} />
    </div>
  );
}
