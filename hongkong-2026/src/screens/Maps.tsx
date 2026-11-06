import { lazy, Suspense, useState } from 'react';
import { ExternalLink, Home as HomeIcon, MapPin, Map as MapIcon, Navigation, Plus, Download, FileText } from 'lucide-react';
import { LINKS } from '../data/seed';
import { useAppState } from '../state/store';
import { useVault } from '../state/vault';
import { mapDir, mapSearch } from '../lib/maps';
import { Btn, Card, Empty, PageHeader, SectionTitle } from '../ui/primitives';
import { Photo } from '../ui/Photo';
import { ImportSheet } from '../ui/ImportSheet';
import type { DocRecord } from '../types';
const DocViewer = lazy(() => import('./DocViewer').then((m) => ({ default: m.DocViewer })));

const PLACES = [
  { name: 'Peak Tram & Sky Terrace 428', q: 'Peak Tram Lower Terminus 33 Garden Road Central', url: LINKS.peak, photo: 'peak', note: 'Day 2 morning' },
  { name: 'Ocean Park', q: 'Ocean Park Hong Kong', url: LINKS.oceanpark, photo: 'oceanpark', note: 'Day 2 · official park map on their site' },
  { name: 'Hong Kong Observation Wheel', q: 'Hong Kong Observation Wheel 33 Man Kwong Street Central', url: LINKS.klook, photo: 'wheel', note: 'Day 2 evening · stroller storage' },
  { name: 'Hong Kong Science Museum', q: 'Hong Kong Science Museum Tsim Sha Tsui East', url: LINKS.science, photo: 'science', note: 'Day 3' },
  { name: 'Hong Kong Disneyland', q: 'Hong Kong Disneyland', url: LINKS.disney, photo: 'disney', note: 'Day 4 · official park map on their site' },
  { name: 'Hong Kong International Airport', q: 'Hong Kong International Airport', url: LINKS.airport, photo: 'airport', note: 'Arrival Day 1 · departure Day 5' },
];

export function Maps() {
  const { docs, key } = useVault();
  const { hotel } = useAppState();
  const [imp, setImp] = useState(false);
  const [view, setView] = useState<{ list: DocRecord[]; start: number } | null>(null);
  const maps = docs.filter((d) => d.folder === '06 - Itinerary & Maps');
  return (
    <div className="pb-4">
      <PageHeader title="Maps" sub="Navigation · official maps · offline copies" />
      <a href={mapDir(hotel.name + ' ' + hotel.address, 'transit')} target="_blank" rel="noopener noreferrer"
        className="tap mb-4 flex items-center gap-3 rounded-3xl bg-navy p-4 text-white active:scale-[.99]"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-sun text-navy"><HomeIcon /></span>
        <span className="flex-1"><span className="block text-[17px] font-bold">Return to hotel</span><span className="block text-[13px] text-white/75">{hotel.name} · {hotel.address}</span></span><Navigation /></a>
      <SectionTitle>Attractions</SectionTitle>
      <div className="space-y-3">
        {PLACES.map((p) => (
          <Card key={p.name} className="overflow-hidden">
            <div className="flex gap-3 p-3">
              <Photo k={p.photo} className="h-[84px] w-[84px] shrink-0 rounded-2xl" showCredit={false} />
              <div className="min-w-0 flex-1"><div className="text-[16px] font-bold leading-tight text-navy">{p.name}</div><div className="text-[13px] text-muted">{p.note}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <a href={mapDir(p.q)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 text-[13px] font-bold text-white"><Navigation size={15} />Directions</a>
                  <a href={mapSearch(p.q)} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-sky-soft px-3 text-[13px] font-bold text-navy"><MapPin size={15} />Map</a>
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="tap inline-flex items-center gap-1.5 rounded-xl bg-white px-3 text-[13px] font-bold text-navy ring-1 ring-inset ring-navy/15"><ExternalLink size={15} />Official site</a>
                </div></div>
            </div>
          </Card>
        ))}
      </div>
      <SectionTitle action={<Btn variant="soft" icon={<Plus size={16} />} onClick={() => setImp(true)} className="!px-3 !py-1.5 text-[13px]">Add map</Btn>}>My offline maps</SectionTitle>
      <p className="mb-2 px-1 text-[13px] text-muted">Download official park maps (PDF/JPG) from each attraction’s website, then add them here. They are saved encrypted and work offline with zoom.</p>
      {maps.length ? (
        <div className="space-y-2">{maps.map((d, i) => (
          <Card key={d.id} onClick={() => setView({ list: maps, start: i })} className="flex items-center gap-3 p-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-turq-soft text-[#0b6b61]"><FileText /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-navy">{d.name}</span><span className="text-[12px] text-muted">{(d.size / 1024).toFixed(0)} KB · tap to open</span></span></Card>
        ))}</div>
      ) : <Empty icon={<MapIcon size={34} />} title="No offline maps yet">Add official maps from the attractions’ websites.</Empty>}
      <Card className="mt-4 flex gap-3 p-4 text-[14px]"><Download className="mt-0.5 shrink-0 text-sky" /><div><b className="text-navy">Tip:</b> in Google Maps, search “Hong Kong”, tap the name, then <i>Download offline map</i> so directions still work without data.</div></Card>
      <ImportSheet open={imp} onClose={() => setImp(false)} target={{ folder: '06 - Itinerary & Maps' }} />
      {view && <Suspense fallback={null}><DocViewer docs={view.list} start={view.start} dataKey={key} onClose={() => setView(null)} /></Suspense>}
    </div>
  );
}
