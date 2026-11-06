import { useEffect, useRef, useState } from 'react';
import { FolderOpen, Lock, ShieldCheck } from 'lucide-react';
import { Sheet, PlaneLoader, Btn } from './primitives';
import { ACCEPTED, FOLDERS } from '../lib/vault';
import { useVault } from '../state/vault';
import { FLIGHTS, TICKETS } from '../data/seed';

export interface ImportTarget { folder?: string; ticketId?: string; flightId?: string }

export function ImportSheet({ open, onClose, target, onDone }: { open: boolean; onClose: () => void; target?: ImportTarget; onDone?: (count: number) => void }) {
  const { add } = useVault();
  const [folder, setFolder] = useState<string>(target?.folder ?? FOLDERS[1]);
  const [link, setLink] = useState<string>(target?.ticketId ? 't:' + target.ticketId : target?.flightId ? 'f:' + target.flightId : '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!open) return;
    setErr('');
    setFolder(target?.folder ?? (target?.flightId ? FOLDERS[0] : target?.ticketId ? FOLDERS[1] : FOLDERS[1]));
    setLink(target?.ticketId ? 't:' + target.ticketId : target?.flightId ? 'f:' + target.flightId : '');
  }, [open, target?.folder, target?.ticketId, target?.flightId]);

  const sel = 'w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3 text-[16px]';
  const ticket = link.startsWith('t:') ? TICKETS.find((t) => t.id === link.slice(2)) : undefined;

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setErr('');
    try {
      const list = [...files];
      let n = 0;
      for (const f of list) {
        const extra: { folder: string; ticketId?: string; flightId?: string; slot?: string } = { folder };
        if (ticket) { extra.ticketId = ticket.id; if (list.length > 1 || ticket.guests.length > 1) extra.slot = ticket.guests[n]?.label; if (list.length === 1 && ticket.guests.length > 1) extra.slot = undefined; }
        if (link.startsWith('f:')) extra.flightId = link.slice(2);
        await add([f], extra);
        n++;
      }
      onDone?.(n); onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not import that file.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }

  return (
    <Sheet open={open} onClose={busy ? () => {} : onClose} title="Add from my phone">
      <div className="space-y-4 pt-1">
        <p className="text-[14px] text-muted">Choose PDFs or pictures (JPG, PNG) from your <b>Hong Kong 2026</b> folder. Your <b>original files are stored untouched</b> and encrypted on this phone only — nothing is uploaded.</p>
        <label className="block"><span className="mb-1 block text-[14px] font-bold text-navy">Save in folder</span>
          <select className={sel} value={folder} onChange={(e) => setFolder(e.target.value)}>{FOLDERS.map((f) => <option key={f}>{f}</option>)}</select></label>
        <label className="block"><span className="mb-1 block text-[14px] font-bold text-navy">Belongs to</span>
          <select className={sel} value={link} onChange={(e) => setLink(e.target.value)}>
            <option value="">Nothing in particular</option>
            <optgroup label="Attraction tickets">{TICKETS.map((t) => <option key={t.id} value={'t:' + t.id}>{t.name}</option>)}</optgroup>
            <optgroup label="Flights / boarding passes">{FLIGHTS.map((f) => <option key={f.id} value={'f:' + f.id}>{f.code} {f.fromCode}→{f.toCode}</option>)}</optgroup>
          </select></label>
        {ticket && ticket.guests.length > 1 && <p className="rounded-xl bg-sky-soft px-3 py-2 text-[13px] text-navy">Tip: if you pick several files at once they are matched to {ticket.guests.map((g) => g.label.split(' ')[0]).join(', ')} in the order selected. You can re-assign later.</p>}
        {busy ? <PlaneLoader label="Encrypting and saving originals…" /> : (
          <>
            <input ref={input} type="file" multiple accept={ACCEPTED} className="sr-only" id="hk-file-input" onChange={(e) => void pick(e.target.files)} />
            <label htmlFor="hk-file-input" className="tap flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-4 py-3.5 text-[16px] font-bold text-white active:scale-[.98]"><FolderOpen size={20} />Browse my phone documents</label>
          </>
        )}
        {err && <p className="text-[14px] font-bold text-coral" role="alert">{err}</p>}
        <p className="flex gap-2 text-[12px] text-muted"><ShieldCheck size={16} className="shrink-0" />Android shows its own file picker. This app can only see the files you pick — it cannot browse your storage by itself.</p>
        <Btn variant="ghost" className="w-full" onClick={onClose} disabled={busy} icon={<Lock size={16} />}>Cancel</Btn>
      </div>
    </Sheet>
  );
}
