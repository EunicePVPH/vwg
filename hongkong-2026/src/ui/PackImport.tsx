import { useRef, useState } from 'react';
import { KeyRound, PackageOpen, ShieldCheck } from 'lucide-react';
import { Btn, PlaneLoader, Sheet } from './primitives';
import { useVault } from '../state/vault';
import { importDocPack, type PackResult } from '../lib/docpack';

/** Import the one encrypted booking-pack file you were sent. Works offline; nothing is uploaded. */
export function PackImport({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { key, docs, refresh } = useVault();
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [res, setRes] = useState<PackResult | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const close = () => { setPw(''); setErr(''); setRes(null); onClose(); };
  async function pick(files: FileList | null) {
    const f = files?.[0]; if (!f) return;
    if (!pw.trim()) { setErr('Type the pack password first, then choose the file again.'); if (input.current) input.current.value = ''; return; }
    setBusy(true); setErr(''); setRes(null);
    try {
      setRes(await importDocPack(key, f, pw, docs));
      await refresh();
      try { await navigator.storage?.persist?.(); } catch { /* ignore */ }
    } catch (e) { setErr(e instanceof Error ? e.message : 'Could not open that pack.'); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  }
  return (
    <Sheet open={open} onClose={busy ? () => {} : close} title="Import booking pack">
      <div className="space-y-4 pt-1 text-[14px]">
        <p className="text-muted">One encrypted file with your original booking PDFs. Each one is copied untouched into this app, encrypted with your PIN, and linked to its booking. Files already here are <b>never duplicated</b>.</p>
        <label className="block font-bold text-navy"><span className="flex items-center gap-1"><KeyRound size={15} />Pack password</span>
          <input value={pw} onChange={(e) => setPw(e.target.value)} autoCapitalize="characters" autoCorrect="off" spellCheck={false} placeholder="e.g. ABCD-EFGH-JKLM-NPQR" className="mt-1 w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3 font-mono text-[16px] font-normal" /></label>
        {busy ? <PlaneLoader label="Opening the pack and saving originals…" /> : (
          <>
            <input ref={input} type="file" className="sr-only" id="hk-pack-input" accept=".hk26pack,application/json,.json,*/*" onChange={(e) => void pick(e.target.files)} />
            <label htmlFor="hk-pack-input" className="tap flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-navy px-4 py-3.5 text-[16px] font-bold text-white active:scale-[.98]"><PackageOpen size={20} />Choose the pack file</label>
          </>
        )}
        {err && <p className="font-bold text-coral" role="alert">{err}</p>}
        {res && <p className="rounded-xl bg-turq-soft px-3 py-2 font-bold text-[#0b6b61]" role="status">Done: {res.added} new file{res.added === 1 ? '' : 's'} saved, {res.merged} linked to an existing copy, {res.same} already there.</p>}
        <p className="flex gap-2 text-[12px] text-muted"><ShieldCheck size={16} className="shrink-0" />The password is not saved anywhere in the app. Keep the pack file as a spare backup of your originals.</p>
        <Btn variant="ghost" className="w-full" onClick={close} disabled={busy}>{res ? 'Close' : 'Cancel'}</Btn>
      </div>
    </Sheet>
  );
}
