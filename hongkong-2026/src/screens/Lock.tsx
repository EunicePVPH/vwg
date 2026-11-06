import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, Lock as LockIcon, Plane, ShieldCheck } from 'lucide-react';
import { clearFails, createPin, hasPin, lockoutRemainingMs, recordFail, unlockWithPin } from '../lib/crypto';
import { Btn } from '../ui/primitives';
import { wipeLocalData } from '../state/store';

type Phase = 'loading' | 'setup' | 'confirm' | 'locked';

function Dots({ n, shake }: { n: number; shake: boolean }) {
  return (
    <motion.div className="flex justify-center gap-3" animate={shake ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }} transition={{ duration: 0.4 }} aria-label={`${n} of 6 digits entered`}>
      {Array.from({ length: 6 }, (_, i) => <span key={i} className={'h-4 w-4 rounded-full transition-all ' + (i < n ? 'scale-110 bg-sun' : 'bg-white/25')} />)}
    </motion.div>
  );
}

export function Lock({ onUnlock }: { onUnlock: (k: CryptoKey) => void }) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [pin, setPin] = useState('');
  const [first, setFirst] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const [wait, setWait] = useState(0);
  const [forgot, setForgot] = useState(false);

  useEffect(() => { hasPin().then((h) => setPhase(h ? 'locked' : 'setup')); }, []);
  useEffect(() => {
    const t = setInterval(() => setWait(lockoutRemainingMs()), 500); setWait(lockoutRemainingMs());
    return () => clearInterval(t);
  }, []);

  const submit = useCallback(async (p: string) => {
    if (phase === 'setup') { setFirst(p); setPin(''); setPhase('confirm'); setMsg(''); return; }
    if (phase === 'confirm') {
      if (p !== first) { setShake(true); setMsg('The PINs did not match. Please try again.'); setTimeout(() => setShake(false), 450); setPin(''); setFirst(''); setPhase('setup'); return; }
      setBusy(true); try { onUnlock(await createPin(p)); } catch { setMsg('This browser could not set up encryption.'); setBusy(false); }
      return;
    }
    if (lockoutRemainingMs() > 0) { setPin(''); return; }
    setBusy(true);
    try { const k = await unlockWithPin(p); clearFails(); onUnlock(k); }
    catch { recordFail(); setShake(true); setMsg('That PIN is not right.'); setWait(lockoutRemainingMs()); setTimeout(() => setShake(false), 450); setPin(''); setBusy(false); }
  }, [phase, first, onUnlock]);

  const press = (d: string) => {
    if (busy || wait > 0) return;
    const next = (pin + d).slice(0, 6); setPin(next); setMsg('');
    if (next.length === 6) setTimeout(() => void submit(next), 120);
  };

  // allow a hardware / on-screen keyboard too
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (/^\d$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') setPin((p) => p.slice(0, -1)); };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  });

  if (phase === 'loading') return <div className="grid min-h-dvh place-items-center bg-navy text-white">…</div>;
  const title = phase === 'setup' ? 'Choose your 6-digit PIN' : phase === 'confirm' ? 'Type it once more' : 'Welcome back';
  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-[480px] flex-col items-center justify-between overflow-hidden bg-navy px-6 pb-[calc(var(--safe-b)+20px)] pt-[calc(var(--safe-t)+36px)] text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky/25 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-coral/20 blur-2xl" aria-hidden />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/10"><Plane className="rotate-45 text-sun" size={28} /></div>
        <h1 className="text-[28px] font-bold leading-tight">Hong Kong 2026</h1>
        <p className="text-[15px] text-white/75">Keren · Gilbert · Aya</p>
      </div>
      <div className="relative z-10 w-full space-y-5 text-center">
        <div>
          <h2 className="text-[20px] font-bold">{title}</h2>
          <p className="mx-auto mt-1 min-h-[44px] max-w-[320px] text-[14px] text-white/75" aria-live="polite">
            {wait > 0 ? `Too many tries. Please wait ${Math.ceil(wait / 1000)}s.` : msg || (phase === 'setup' ? 'You choose it — it is never shared or stored as readable text.' : phase === 'confirm' ? 'Remember this PIN. It protects your tickets on this phone.' : 'Enter your PIN to open your trip.')}
          </p>
        </div>
        <Dots n={pin.length} shake={shake} />
        <div className="mx-auto grid max-w-[300px] grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
            <button key={d} onClick={() => press(d)} className="tap h-16 rounded-2xl bg-white/10 text-[26px] font-bold active:bg-white/25" aria-label={d}>{d}</button>
          ))}
          <span />
          <button onClick={() => press('0')} className="tap h-16 rounded-2xl bg-white/10 text-[26px] font-bold active:bg-white/25" aria-label="0">0</button>
          <button onClick={() => setPin((p) => p.slice(0, -1))} className="tap grid h-16 place-items-center rounded-2xl text-white/80 active:bg-white/10" aria-label="Delete last digit"><Delete size={26} /></button>
        </div>
        {busy && <p className="text-[14px] text-white/80" role="status">Checking…</p>}
      </div>
      <div className="relative z-10 max-w-[340px] text-center text-[12px] leading-snug text-white/60">
        <p className="flex items-center justify-center gap-1.5"><ShieldCheck size={14} /> Your files are encrypted on this phone. A 6-digit PIN is a convenience lock, not bank-level security.</p>
        {phase === 'locked' && !forgot && <button className="mt-2 underline" onClick={() => setForgot(true)}>Forgot PIN?</button>}
        {forgot && (
          <div className="mt-3 rounded-2xl bg-white/10 p-3 text-left text-white/85">
            <p className="mb-2 text-[13px]">There is no way to recover a forgotten PIN — that is what keeps your documents private. You can erase this app’s data on this phone and start again, then restore from your encrypted backup file.</p>
            <div className="flex gap-2">
              <Btn variant="sun" className="flex-1" onClick={() => setForgot(false)}>Keep trying</Btn>
              <Btn variant="danger" icon={<LockIcon size={16} />} onClick={async () => { if (confirm('Erase all data stored by this app on this phone? Original files in your Hong Kong 2026 folder are not affected.')) { await wipeLocalData(); location.reload(); } }}>Erase</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
