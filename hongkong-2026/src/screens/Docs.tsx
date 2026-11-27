import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { PackageOpen, RefreshCw, FileImage, FileText, FolderOpen, Link2, Pencil, ShieldCheck, Trash2, Lock } from 'lucide-react';
import { FLIGHTS, TICKETS } from '../data/seed';
import { useVault } from '../state/vault';
import { FOLDERS, ACCEPTED, docFlightIds, docSlots, replaceFile } from '../lib/vault';
import { PackImport } from '../ui/PackImport';
import { Btn, Card, Empty, PageHeader, PlaneLoader, SectionTitle, Sheet } from '../ui/primitives';
import { ImportSheet } from '../ui/ImportSheet';
import type { DocRecord } from '../types';
const DocViewer = lazy(() => import('./DocViewer').then((m) => ({ default: m.DocViewer })));

export function Docs() {
  const { docs, ready, key, remove, patch, refresh } = useVault();
  const [pack, setPack] = useState(false);
  const [replMsg, setReplMsg] = useState('');
  const [imp, setImp] = useState(false);
  const [view, setView] = useState<{ list: DocRecord[]; start: number } | null>(null);
  const [menu, setMenu] = useState<DocRecord | null>(null);
  const [folder, setFolder] = useState<string>('all');
  const shown = folder === 'all' ? docs : docs.filter((d) => d.folder === folder);
  const label = (d: DocRecord) => d.ticketId ? TICKETS.find((t) => t.id === d.ticketId)?.name : docFlightIds(d).length ? docFlightIds(d).map((id) => FLIGHTS.find((f) => f.id === id)?.code).join(' + ') : undefined;
  return (
    <div className="pb-4">
      <PageHeader title="Phone Documents" back="more" sub="Private · encrypted · works offline" />
      <Btn className="w-full !py-4 text-[17px]" icon={<FolderOpen size={22} />} onClick={() => setImp(true)}>Browse My Phone Documents</Btn>
      <Btn variant="soft" className="mt-2 w-full" icon={<PackageOpen size={20} />} onClick={() => setPack(true)}>Import booking pack (encrypted file)</Btn>
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
                    <span className="block truncate text-[12px] text-muted">{d.folder.slice(5)} · {(d.size / 1024).toFixed(0)} KB{label(d) ? ` · ${label(d)}` : ''}{docSlots(d).length ? ` · ${docSlots(d).map((s) => s.split(' ')[0]).join(' + ')}` : ''}</span></span>
                </button>
                <button onClick={() => setMenu(d)} aria-label="File options" className="tap grid place-items-center text-muted"><Pencil size={18} /></button>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Sheet open={!!menu} onClose={() => { setMenu(null); setReplMsg(''); }} title="File options">
        {menu && (
          <div className="space-y-3 pt-1 text-[14px]">
            <p className="break-all font-bold text-navy">{menu.name}</p>
            <label className="block font-bold text-navy">Folder<select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={menu.folder} onChange={async (e) => { await patch(menu.id, { folder: e.target.value }); setMenu({ ...menu, folder: e.target.value }); }}>{FOLDERS.map((f) => <option key={f}>{f}</option>)}</select></label>
            <label className="block font-bold text-navy"><span className="flex items-center gap-1"><Link2 size={14} />Belongs to</span>
              <select className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-3 py-3 font-normal" value={menu.ticketId ? 't:' + menu.ticketId : docFlightIds(menu)[0] ? 'f:' + docFlightIds(menu)[0] : ''}
                onChange={async (e) => { const v = e.target.value; const p = { ticketId: v.startsWith('t:') ? v.slice(2) : undefined, flightId: v.startsWith('f:') ? v.slice(2) : undefined, flightIds: undefined, slot: undefined, slots: undefined }; await patch(menu.id, p); setMenu({ ...menu, ...p }); }}>
                <option value="">Nothing in particular</option>{TICKETS.map((t) => <option key={t.id} value={'t:' + t.id}>{t.name}</option>)}{FLIGHTS.map((f) => <option key={f.id} value={'f:' + f.id}>{f.code} {f.fromCode}→{f.toCode}</option>)}</select></label>
            {menu.ticketId && (
              <fieldset className="font-bold text-navy"><legend>Which guests can use this file? <span className="font-normal text-muted">(tick more than one if it holds several QR codes)</span></legend>
                {TICKETS.find((t) => t.id === menu.ticketId)?.guests.map((g) => {
                  const cur = docSlots(menu); const on = cur.includes(g.label);
                  return <label key={g.label} className="mt-1.5 flex items-center gap-3 rounded-xl bg-paper px-3 py-2.5 font-normal"><input type="checkbox" className="h-5 w-5 accent-[#14b8a6]" checked={on} onChange={async () => { const next = on ? cur.filter((x) => x !== g.label) : [...cur, g.label]; await patch(menu.id, { slots: next.length ? next : undefined, slot: undefined }); setMenu({ ...menu, slots: next.length ? next : undefined, slot: undefined }); }} />{g.label}</label>;
                })}
                <p className="mt-1 text-[12px] font-normal text-muted">Nothing ticked = shown under every guest.</p>
              </fieldset>
            )}
            <div>
              <input type="file" id="hk-replace-input" className="sr-only" accept={ACCEPTED} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const m = await replaceFile(key, menu.id, f); await refresh(); setMenu({ ...menu, ...m }); setReplMsg('Replaced. The booking links stayed.'); } catch { setReplMsg('Could not replace that file.'); } e.target.value = ''; }} />
              <label htmlFor="hk-replace-input" className="tap flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-soft px-4 py-3 font-bold text-navy"><RefreshCw size={18} />Replace this file (keeps its booking)</label>
              {replMsg && <p className="mt-1 text-[13px] font-bold text-[#0b6b61]" role="status">{replMsg}</p>}
            </div>
            <p className="text-[12px] text-muted">SHA-256 of the original: <span className="break-all font-mono">{menu.sha256.slice(0, 24)}…</span> (re-checked every time it opens)</p>
            <Btn variant="danger" className="w-full" icon={<Trash2 size={18} />} onClick={async () => { if (confirm('Delete this file from the app? Your original in the phone folder is not touched.')) { await remove(menu.id); setMenu(null); } }}>Delete from app</Btn>
          </div>
        )}
      </Sheet>
      <PackImport open={pack} onClose={() => setPack(false)} />
      <ImportSheet open={imp} onClose={() => setImp(false)} target={folder !== 'all' ? { folder } : undefined} />
      {view && <Suspense fallback={null}><DocViewer docs={view.list} start={view.start} dataKey={key} onClose={() => setView(null)} /></Suspense>}
    </div>
  );
}
