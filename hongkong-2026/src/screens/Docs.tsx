import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { FileImage, FileText, FolderOpen, Link2, Pencil, ShieldCheck, Trash2, Lock } from 'lucide-react';
import { FLIGHTS, TICKETS } from '../data/seed';
import { useVault } from '../state/vault';
import { FOLDERS } from '../lib/vault';
import { Btn, Card, Empty, PageHeader, PlaneLoader, SectionTitle, Sheet } from '../ui/primitives';
import { ImportSheet } from '../ui/ImportSheet';
import type { DocRecord } from '../types';
const DocViewer = lazy(() => import('./DocViewer').then((m) => ({ default: m.DocViewer })));

export function Docs() {
  const { docs, ready, key, remove, patch } = useVault();
  const [imp, setImp] = useState(false);
  const [view, setView] = useState<{ list: DocRecord[]; start: number } | null>(null);
  const [menu, setMenu] = useState<DocRecord | null>(null);
  const [folder, setFolder] = useState<string>('all');
  const shown = folder === 'all' ? docs : docs.filter((d) => d.folder === folder);
  const label = (d: DocRecord) => d.ticketId ? TICKETS.find((t) => t.id === d.ticketId)?.name : d.flightId ? FLIGHTS.find((f) => f.id === d.flightId)?.code : undefined;
  return (
    <div className="pb-4">
      <PageHeader title="Phone Documents" back="more" sub="Private · encrypted · works offline" />
      <Btn className="w-full !py-4 text-[17px]" icon={<FolderOpen size={22} />} onClick={() => setImp(true)}>Browse My Phone Documents</Btn>
      <p className="mt-2 flex gap-2 px-1 text-[13px] text-muted"><ShieldCheck size={16} className="mt-0.5 shrink-0" />Opens Android’s own file picker. We can only see the files you choose. Originals are kept byte-for-byte and encrypted on this phone.</p>

      <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 scroll-hide">
        {['all', ...FOLDERS].map((f) => (
          <button key={f} onClick={() => setFolder(f)} className={'tap shrink-0 rounded-full px-3.5 text-[13px] font-bold ' + (folder === f ? 'bg-navy text-white' : 'bg-white text-navy shadow-sm')}>{f === 'all' ? `All (${docs.length})` : `${f} (${docs.filter((d) => d.folder === f).length})`}</button>
        ))}
      </div>

      <SectionTitle>Your files</SectionTitle>
      {!ready ? <PlaneLoader label="Opening your wallet…" /> : shown.length === 0 ? (
        <Empty icon={<Lock size={34} />} title="Nothing here yet">Tap “Browse My Phone Documents” and pick your tickets, boarding passes, hotel booking, insurance and maps.</Empty>
      ) : (
        <div className="space-y-2">
          {shown.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 6) * 0.03 }}>
              <Card className="flex items-center gap-3 p-3">
                <button onClick={() => setView({ list: shown, start: i })} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-coral-soft text-[#a63a2b]">{d.mime === 'application/pdf' ? <FileText /> : <FileImage />}</span>
                  <span className="min-w-0"><span className="block truncate font-bold text-navy">{d.name}</span>
                    <span className="block truncate text-[12px] text-muted">{d.folder.slice(5)} · {(d.size / 1024).toFixed(0)} KB{label(d) ? ` · ${label(d)}` : ''}{d.slot ? ` · ${d.slot.split(' ')[0]}` : ''}</span></span>
                </button>
                <button onClick={() => setMenu(d)} aria-label="File options" className="tap grid place-items-center text-muted"><Pencil size={18} /></button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={!!menu} onClose={() => setMenu(null)} title="File options">
        {menu && (
          <div className="space-y-3 pt-1 text-[14px]">
            <p className="break-all font-bold text-navy">{menu.name}</p>
            <label className="block font-bold text-navy">Folder<select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={menu.folder} onChange={async (e) => { await patch(menu.id, { folder: e.target.value }); setMenu({ ...menu, folder: e.target.value }); }}>{FOLDERS.map((f) => <option key={f}>{f}</option>)}</select></label>
            <label className="block font-bold text-navy"><span className="flex items-center gap-1"><Link2 size={14} />Belongs to</span>
              <select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={menu.ticketId ? 't:' + menu.ticketId : menu.flightId ? 'f:' + menu.flightId : ''}
                onChange={async (e) => { const v = e.target.value; const p = { ticketId: v.startsWith('t:') ? v.slice(2) : undefined, flightId: v.startsWith('f:') ? v.slice(2) : undefined, slot: undefined }; await patch(menu.id, p); setMenu({ ...menu, ...p }); }}>
                <option value="">Nothing in particular</option>{TICKETS.map((t) => <option key={t.id} value={'t:' + t.id}>{t.name}</option>)}{FLIGHTS.map((f) => <option key={f.id} value={'f:' + f.id}>{f.code} {f.fromCode}→{f.toCode}</option>)}</select></label>
            {menu.ticketId && (
              <label className="block font-bold text-navy">For which guest?<select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={menu.slot ?? ''} onChange={async (e) => { await patch(menu.id, { slot: e.target.value || undefined }); setMenu({ ...menu, slot: e.target.value || undefined }); }}>
                <option value="">Any / not set</option>{TICKETS.find((t) => t.id === menu.ticketId)?.guests.map((g) => <option key={g.label}>{g.label}</option>)}</select></label>
            )}
            <p className="text-[12px] text-muted">SHA-256 of the original: <span className="break-all font-mono">{menu.sha256.slice(0, 24)}…</span> (re-checked every time it opens)</p>
            <Btn variant="danger" className="w-full" icon={<Trash2 size={18} />} onClick={async () => { if (confirm('Delete this file from the app? Your original in the phone folder is not touched.')) { await remove(menu.id); setMenu(null); } }}>Delete from app</Btn>
          </div>
        )}
      </Sheet>
      <ImportSheet open={imp} onClose={() => setImp(false)} target={folder !== 'all' ? { folder } : undefined} />
      {view && <Suspense fallback={null}><DocViewer docs={view.list} start={view.start} dataKey={key} onClose={() => setView(null)} /></Suspense>}
    </div>
  );
}
