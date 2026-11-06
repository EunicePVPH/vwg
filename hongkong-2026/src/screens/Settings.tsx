import { useEffect, useRef, useState } from 'react';
import { Download, HardDrive, Image as ImageIcon, KeyRound, Lock, Share2, ShieldAlert, Smartphone, Upload, Eye, RotateCcw, Trash2 } from 'lucide-react';
import { changePin, clearFails } from '../lib/crypto';
import { buildBackup, restoreBackup } from '../lib/backup';
import { PHOTO_KEYS, clearCustomPhoto, setCustomPhoto } from '../lib/photos';
import { useAppState, useSettings, wipeLocalData } from '../state/store';
import { useVault } from '../state/vault';
import { Btn, Card, PageHeader, SectionTitle, Toggle, PlaneLoader } from '../ui/primitives';

declare global { interface BeforeInstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> } }
let deferredInstall: BeforeInstallPromptEvent | null = null;
if (typeof window !== 'undefined') window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e as BeforeInstallPromptEvent; });

export const getAutoLock = () => { try { return Number(localStorage.getItem('hk26.autolock') ?? '5'); } catch { return 5; } };
const input = 'w-full rounded-2xl border border-navy/15 bg-paper px-4 py-3 text-[16px]';

export function Settings({ onLock }: { onLock: () => void }) {
  const { state, setState, replaceAll, resetTrip } = useAppState();
  const { settings, setSettings } = useSettings();
  const { key, docs, refresh } = useVault();
  const [auto, setAuto] = useState(getAutoLock());
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null);
  const [busy, setBusy] = useState('');
  const [bpw, setBpw] = useState(''); const [bpw2, setBpw2] = useState('');
  const [rpw, setRpw] = useState('');
  const [oldPin, setOldPin] = useState(''); const [newPin, setNewPin] = useState(''); const [newPin2, setNewPin2] = useState('');
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [usage, setUsage] = useState('');
  const [simDate, setSimDate] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [photoKey, setPhotoKey] = useState('');
  const flash = (t: string, ok = true) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 6000); };

  useEffect(() => {
    void navigator.storage?.persisted?.().then(setPersisted);
    void navigator.storage?.estimate?.().then((e) => e.usage !== undefined && setUsage(`${(e.usage / 1048576).toFixed(1)} MB used`));
  }, []);

  async function backup() {
    if (bpw.length < 6) return flash('Use a backup password of at least 6 characters.', false);
    if (bpw !== bpw2) return flash('The two passwords do not match.', false);
    setBusy('Encrypting backup…');
    try {
      const blob = await buildBackup(key, state, bpw);
      const name = `hong-kong-2026-backup-${new Date().toISOString().slice(0, 10)}.hk26`;
      const file = new File([blob], name, { type: 'application/octet-stream' });
      setState((s) => ({ ...s, lastBackupAt: Date.now() }));
      if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ files: [file], title: 'Hong Kong 2026 backup' }); flash('Backup ready — saved or shared.'); setBusy(''); return; } catch { /* fall back to download */ } }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
      flash(`Backup saved as ${name}. Move it into your “07 - Dashboard Backup” folder.`);
    } catch (e) { flash(e instanceof Error ? e.message : 'Backup failed.', false); }
    setBusy('');
  }
  async function restore(f: File | undefined) {
    if (!f) return;
    if (!rpw) return flash('Type the backup password first, then choose the file.', false);
    if (!confirm('Restoring replaces your current trip edits and adds the backup’s documents. Continue?')) return;
    setBusy('Decrypting backup…');
    try { const r = await restoreBackup(f, rpw, key); replaceAll(r.state as typeof state); await refresh(); flash(`Restored ${r.docCount} document(s) and your trip edits.`); setRpw(''); }
    catch (e) { flash(e instanceof Error ? e.message : 'Restore failed.', false); }
    setBusy(''); if (fileRef.current) fileRef.current.value = '';
  }
  async function pin() {
    if (!/^\d{6}$/.test(newPin)) return flash('The new PIN must be exactly 6 digits.', false);
    if (newPin !== newPin2) return flash('The new PINs do not match.', false);
    setBusy('Changing PIN…');
    try { await changePin(oldPin, newPin); clearFails(); flash('PIN changed.'); setOldPin(''); setNewPin(''); setNewPin2(''); }
    catch { flash('The current PIN is not correct.', false); }
    setBusy('');
  }
  const preview = (iso: string | null) => { setSettings({ simulatedNow: iso }); flash(iso ? 'Preview on — the Home screen now acts as if it is that time in Hong Kong.' : 'Back to real time.'); };

  return (
    <div className="pb-6">
      <PageHeader title="Settings & Backup" back="more" />
      {msg && <div role="status" className={'sticky top-16 z-30 mb-3 rounded-2xl px-4 py-3 text-[14px] font-bold shadow ' + (msg.ok ? 'bg-turq-soft text-[#0b6b61]' : 'bg-coral-soft text-[#a63a2b]')}>{msg.t}</div>}
      {busy && <Card className="mb-3"><PlaneLoader label={busy} /></Card>}

      <Card className="space-y-3 p-4">
        <Btn className="w-full" icon={<Lock size={18} />} onClick={onLock}>Lock now</Btn>
        <label className="block text-[14px] font-bold text-navy">Auto-lock when the app is in the background
          <select className={input + ' mt-1 font-normal'} value={auto} onChange={(e) => { setAuto(Number(e.target.value)); try { localStorage.setItem('hk26.autolock', e.target.value); } catch { /* */ } }}>
            <option value={0}>Immediately</option><option value={1}>After 1 minute</option><option value={5}>After 5 minutes</option><option value={15}>After 15 minutes</option><option value={60}>After 1 hour</option></select></label>
      </Card>

      <SectionTitle>Change PIN</SectionTitle>
      <Card className="space-y-2 p-4">
        <input className={input} inputMode="numeric" pattern="[0-9]*" maxLength={6} type="password" placeholder="Current PIN" value={oldPin} onChange={(e) => setOldPin(e.target.value.replace(/\D/g, ''))} autoComplete="off" />
        <input className={input} inputMode="numeric" pattern="[0-9]*" maxLength={6} type="password" placeholder="New 6-digit PIN" value={newPin} onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} autoComplete="off" />
        <input className={input} inputMode="numeric" pattern="[0-9]*" maxLength={6} type="password" placeholder="New PIN again" value={newPin2} onChange={(e) => setNewPin2(e.target.value.replace(/\D/g, ''))} autoComplete="off" />
        <Btn variant="soft" className="w-full" icon={<KeyRound size={18} />} onClick={pin} disabled={!!busy}>Change PIN</Btn>
      </Card>

      <SectionTitle>Encrypted backup</SectionTitle>
      <Card className="space-y-3 p-4">
        <p className="text-[14px] text-muted">One file with your trip edits <b>and</b> your original documents, encrypted with a password you choose. A longer password is safer than a 6-digit PIN. {state.lastBackupAt ? `Last backup: ${new Date(state.lastBackupAt).toLocaleString()}.` : 'No backup yet.'} {docs.length} document(s) will be included.</p>
        <input className={input} type="password" placeholder="Backup password (6+ characters)" value={bpw} onChange={(e) => setBpw(e.target.value)} autoComplete="new-password" />
        <input className={input} type="password" placeholder="Backup password again" value={bpw2} onChange={(e) => setBpw2(e.target.value)} autoComplete="new-password" />
        <Btn className="w-full" icon={<Download size={18} />} onClick={backup} disabled={!!busy}>Create encrypted backup</Btn>
        <hr className="border-navy/10" />
        <p className="text-[14px] font-bold text-navy">Restore from a backup</p>
        <input className={input} type="password" placeholder="Backup password" value={rpw} onChange={(e) => setRpw(e.target.value)} autoComplete="off" />
        <input ref={fileRef} type="file" accept=".hk26,application/octet-stream" className="sr-only" id="restore-file" onChange={(e) => void restore(e.target.files?.[0])} />
        <label htmlFor="restore-file" className="tap flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-sky-soft px-4 py-2.5 font-bold text-navy"><Upload size={18} />Choose backup file…</label>
        <p className="flex gap-2 text-[12px] text-muted"><Share2 size={14} className="mt-0.5 shrink-0" />If your phone offers “Share”, pick Files / Drive to save the backup into <b>Hong Kong 2026 / 07 - Dashboard Backup</b>.</p>
      </Card>

      <SectionTitle>Look & feel</SectionTitle>
      <Card className="divide-y divide-navy/5">
        <div className="flex items-center justify-between gap-3 p-4"><div><div className="font-bold text-navy">Turn off animations</div><div className="text-[13px] text-muted">Saves battery. Your phone’s “reduce motion” setting is also respected.</div></div><Toggle label="Turn off animations" on={settings.motion === 'off'} onChange={(v) => setSettings({ motion: v ? 'off' : 'system' })} /></div>
        <div className="space-y-2 p-4"><div className="flex items-center gap-2 font-bold text-navy"><ImageIcon size={18} />Header photos</div><p className="text-[13px] text-muted">Use your own pictures (or ones you’re allowed to use) for the day headers. They stay on this phone.</p>
          <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; if (f && photoKey) { await setCustomPhoto(photoKey, f); flash('Photo saved. Reopen the screen to see it.'); } e.target.value = ''; }} />
          <div className="grid grid-cols-2 gap-2">{PHOTO_KEYS.map((p) => (
            <div key={p.key} className="rounded-2xl bg-paper p-2 text-[12px]"><div className="font-bold text-navy">{p.label}</div>
              <div className="mt-1 flex gap-1"><button className="tap flex-1 rounded-xl bg-white px-2 font-bold text-sky" onClick={() => { setPhotoKey(p.key); photoRef.current?.click(); }}>Choose</button><button aria-label={`Remove ${p.label} photo`} className="tap rounded-xl bg-white px-2 text-muted" onClick={async () => { await clearCustomPhoto(p.key); flash('Photo removed.'); }}><RotateCcw size={14} /></button></div></div>))}</div></div>
      </Card>

      <SectionTitle>Preview a trip day</SectionTitle>
      <Card className="space-y-2 p-4">
        <p className="text-[13px] text-muted">The Home screen switches to “today” mode during Dec 7–11. Try it now:</p>
        <div className="grid grid-cols-3 gap-2 text-[13px]">
          {[['Day 1', '2026-12-07T05:30:00+08:00'], ['Day 2', '2026-12-08T11:00:00+08:00'], ['Day 3', '2026-12-09T09:00:00+08:00'], ['Day 4', '2026-12-10T10:30:00+08:00'], ['Day 5', '2026-12-11T08:00:00+08:00'], ['After', '2026-12-13T09:00:00+08:00']].map(([l, iso]) => (
            <Btn key={l} variant="soft" className="!px-2 !py-2 text-[13px]" icon={<Eye size={14} />} onClick={() => preview(iso)}>{l}</Btn>))}
        </div>
        <div className="flex gap-2"><input type="datetime-local" className={input} value={simDate} onChange={(e) => setSimDate(e.target.value)} /><Btn variant="ghost" onClick={() => simDate && preview(simDate + ':00+08:00')}>Go</Btn></div>
        <Btn variant={settings.simulatedNow ? 'sun' : 'ghost'} className="w-full" onClick={() => preview(null)}>{settings.simulatedNow ? 'Preview is ON — use real time' : 'Using real time'}</Btn>
      </Card>

      <SectionTitle>This phone</SectionTitle>
      <Card className="space-y-3 p-4 text-[14px]">
        <div className="flex items-center gap-2"><HardDrive size={18} className="text-sky" />Storage: {persisted === null ? 'checking…' : persisted ? 'protected from automatic clean-up' : 'may be cleared by Android if space runs low'} {usage && `· ${usage}`}</div>
        {persisted === false && <Btn variant="soft" className="w-full" onClick={async () => setPersisted(await navigator.storage.persist())}>Ask Android to keep my data</Btn>}
        <Btn variant="soft" className="w-full" icon={<Smartphone size={18} />} onClick={async () => { if (deferredInstall) { await deferredInstall.prompt(); deferredInstall = null; } else alert('In Chrome: tap the ⋮ menu, then “Install app” (or “Add to Home screen”).'); }}>Install on home screen</Btn>
      </Card>

      <SectionTitle>How private is this?</SectionTitle>
      <Card className="space-y-2 p-4 text-[13px] text-muted">
        <p className="flex gap-2"><ShieldAlert size={16} className="mt-0.5 shrink-0 text-sun" /><span><b className="text-navy">Being honest:</b> this app’s web address is unlisted but public — anyone who has the link can open the empty app. There is no account and no server holding your data, so there is nothing for them to see.</span></p>
        <p>Your documents and trip edits live <b>only in this browser on this phone</b>, encrypted (AES-256-GCM). The 6-digit PIN unlocks them; it is never stored. A 6-digit PIN can be guessed offline by someone who copies your phone’s storage, so treat it as a convenience lock. For stronger protection keep your phone’s screen lock on.</p>
        <p>If you clear the browser’s site data or lose the phone, the documents are gone — keep your originals in the Hong Kong 2026 folder and make an encrypted backup. No analytics are used. Only weather and exchange rates are fetched (no personal data sent).</p>
      </Card>

      <SectionTitle>Reset</SectionTitle>
      <Card className="space-y-2 p-4">
        <Btn variant="ghost" className="w-full" icon={<RotateCcw size={18} />} onClick={() => { if (confirm('Reset all itinerary, expense and task edits back to the original plan? Documents are kept.')) { resetTrip(); flash('Trip data reset to the original plan.'); } }}>Reset trip edits (keep documents)</Btn>
        <Btn variant="danger" className="w-full" icon={<Trash2 size={18} />} onClick={async () => { if (confirm('Erase EVERYTHING this app stored on this phone, including documents and your PIN? Make a backup first.') && confirm('Really erase everything?')) { await wipeLocalData(); location.reload(); } }}>Erase everything on this phone</Btn>
      </Card>
    </div>
  );
}
