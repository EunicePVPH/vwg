import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plane } from 'lucide-react';

export function Splash({ show, onDone }: { show: boolean; onDone: () => void }) {
  useEffect(() => { if (!show) return; const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [show, onDone]);
  return (
    <AnimatePresence>
      {show && (
        <motion.div key="splash" className="fixed inset-0 z-[80] grid place-items-center bg-navy text-white" exit={{ opacity: 0 }} transition={{ duration: 0.4 }} onClick={onDone} role="presentation">
          <div className="w-full max-w-[420px] px-8 text-center">
            <svg viewBox="0 0 320 120" className="mx-auto w-full" aria-hidden>
              <motion.path d="M20 100 Q160 -20 300 90" fill="none" stroke="#ffc83d" strokeWidth="3" strokeDasharray="6 8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: 'easeInOut' }} />
              <circle cx="20" cy="100" r="6" fill="#ff9fbd" /><circle cx="300" cy="90" r="6" fill="#14b8a6" />
              <motion.g initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: '100%' }} transition={{ duration: 1.6, ease: 'easeInOut' }} style={{ offsetPath: 'path("M20 100 Q160 -20 300 90")', offsetRotate: 'auto' } as React.CSSProperties}>
                <g transform="scale(1.5) translate(-12 -12)"><path d="M22 12 L15 10 L9 2 L6.5 2 L9.5 10 L4 10.5 L2.5 8 L1 8 L2.5 12 L1 16 L2.5 16 L4 13.5 L9.5 14 L6.5 22 L9 22 L15 14 Z" fill="#fff" stroke="#ffc83d" strokeWidth="0.8" strokeLinejoin="round" /></g>
              </motion.g>
            </svg>
            <motion.h1 className="mt-4 text-[34px] font-bold leading-tight" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>Hong Kong 2026</motion.h1>
            <motion.p className="mt-1 text-[17px] text-white/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Our Family Adventure</motion.p>
            <motion.div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[14px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}><Plane size={16} className="rotate-45 text-sun" />Goa → Hong Kong · Dec 7–11</motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
