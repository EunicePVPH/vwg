import { useEffect, useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, X, Plane } from 'lucide-react';
import type { Status } from '../types';

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

const STATUS: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmed', cls: 'bg-turq-soft text-[#0b6b61]' },
  paid: { label: 'Paid', cls: 'bg-turq-soft text-[#0b6b61]' },
  estimated: { label: 'Estimated', cls: 'bg-sky-soft text-[#1d5f99]' },
  pending: { label: 'Pending', cls: 'bg-coral-soft text-[#a63a2b]' },
  optional: { label: 'Optional', cls: 'bg-lav-soft text-[#5046b4]' },
  verify: { label: 'Needs verification', cls: 'bg-sun-soft text-[#8a5f00]' },
};
export function StatusPill({ status, label }: { status: Status; label?: string }) {
  const s = STATUS[status];
  return <span className={cx('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-bold leading-5 whitespace-nowrap', s.cls)}>
    {(status === 'confirmed' || status === 'paid') && <Check size={12} strokeWidth={3} />}{label ?? s.label}</span>;
}

export function Btn({ variant = 'primary', icon, children, className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'ghost' | 'danger' | 'sun'; icon?: ReactNode }) {
  const v = {
    primary: 'bg-navy text-white active:bg-navy-2',
    soft: 'bg-sky-soft text-navy active:bg-[#cfe8ff]',
    ghost: 'bg-transparent text-navy ring-1 ring-inset ring-navy/15 active:bg-navy/5',
    danger: 'bg-coral-soft text-[#a63a2b] active:bg-[#ffd3cb]',
    sun: 'bg-sun text-navy active:bg-[#f0b52a]',
  }[variant];
  return <button {...p} className={cx('tap inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 font-bold transition-transform active:scale-[.97] disabled:opacity-50', v, className)}>{icon}{children}</button>;
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return onClick
    ? <button onClick={onClick} className={cx('card block w-full text-left transition-transform active:scale-[.99]', className)}>{children}</button>
    : <div className={cx('card', className)}>{children}</div>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="flex items-end justify-between px-1 pt-5 pb-2"><h2 className="text-[20px] font-bold text-navy leading-tight">{children}</h2>{action}</div>;
}

export function PageHeader({ title, back, right, sub }: { title: string; back?: string; right?: ReactNode; sub?: string }) {
  return (
    <div className="sticky top-0 z-20 -mx-4 mb-2 bg-paper/90 px-4 pb-2 pt-[calc(var(--safe-t)+12px)] backdrop-blur">
      <div className="flex items-center gap-2">
        {back !== undefined && <a href={'#/' + back} aria-label="Back" className="tap -ml-2 grid place-items-center rounded-full text-navy"><ChevronLeft size={26} /></a>}
        <div className="min-w-0 flex-1"><h1 className="truncate text-[24px] font-bold leading-tight text-navy">{title}</h1>{sub && <p className="truncate text-[13px] text-muted">{sub}</p>}</div>
        {right}
      </div>
    </div>
  );
}

// Android Back closes the top sheet. Programmatic closes call history.back(); the global listener below
// marks that resulting event as "ours" so a newly opened sheet never mistakes it for a real Back press.
let ignorePops = 0; let skipPop = false;
if (typeof window !== 'undefined') window.addEventListener('popstate', () => { if (ignorePops > 0) { ignorePops--; skipPop = true; } else skipPop = false; });
export function useBackClose(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose); closeRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    history.pushState({ sheet: 1 }, '');
    let popped = false;
    const onPop = () => { if (skipPop) return; popped = true; closeRef.current(); };
    window.addEventListener('popstate', onPop);
    return () => { window.removeEventListener('popstate', onPop); if (!popped && history.state?.sheet) { ignorePops++; history.back(); } };
  }, [open]);
}

/** Bottom sheet. Android's back button closes it. */
export function Sheet({ open, onClose, title, children, tall }: { open: boolean; onClose: () => void; title: string; children: ReactNode; tall?: boolean }) {
  useBackClose(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-navy/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cx('absolute inset-x-0 bottom-0 mx-auto flex w-full max-w-[560px] flex-col rounded-t-[28px] bg-white shadow-2xl', tall ? 'h-[92dvh]' : 'max-h-[92dvh]')}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 340 }}>
            <div className="flex items-center gap-2 px-5 pt-4 pb-2">
              <h2 className="flex-1 text-[20px] font-bold text-navy">{title}</h2>
              <button onClick={onClose} aria-label="Close" className="tap grid place-items-center rounded-full bg-paper text-navy"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto px-5 pb-[calc(var(--safe-b)+20px)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function PlaneLoader({ label = 'Opening…' }: { label?: string }) {
  return (
    <div className="grid place-items-center gap-3 py-10 text-muted" role="status" aria-live="polite">
      <div className="relative h-10 w-44 overflow-hidden rounded-full bg-sky-soft">
        <motion.div className="absolute top-1/2 -translate-y-1/2 text-navy" animate={{ x: [-24, 176] }} transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}><Plane size={22} className="rotate-45" /></motion.div>
      </div>
      <span className="text-[14px] font-semibold">{label}</span>
    </div>
  );
}

export function Empty({ icon, title, children }: { icon: ReactNode; title: string; children?: ReactNode }) {
  return <div className="card grid place-items-center gap-2 px-6 py-8 text-center"><div className="text-sky">{icon}</div><div className="text-[17px] font-bold text-navy">{title}</div><div className="text-[14px] text-muted">{children}</div></div>;
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} className={cx('tap relative h-8 w-14 shrink-0 rounded-full transition-colors', on ? 'bg-turq' : 'bg-navy/20')}>
      <span className={cx('absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all', on ? 'left-7' : 'left-1')} />
    </button>
  );
}

export const accentBg: Record<string, string> = { sky: 'bg-sky', coral: 'bg-coral', turq: 'bg-turq', lav: 'bg-lav', sun: 'bg-sun' };
export const accentSoft: Record<string, string> = { sky: 'bg-sky-soft', coral: 'bg-coral-soft', turq: 'bg-turq-soft', lav: 'bg-lav-soft', sun: 'bg-sun-soft' };
