import { useEffect, useState, type ReactNode } from 'react';
import { getCustomPhoto, loadCredits, type Credit } from '../lib/photos';
import { cx } from './primitives';

// Honest placeholder scenes: simple illustrations, clearly NOT photographs.
function Scene({ k }: { k: string }) {
  const sky = { airport: ['#7cc4ff', '#e3f2ff'], peak: ['#ffb199', '#ffe9c9'], oceanpark: ['#5fd3c5', '#d9f6f1'], wheel: ['#3b3b8f', '#8f84ee'], science: ['#2fb8c9', '#d9f6f1'], disney: ['#b9a8ff', '#ffe5ee'], harbour: ['#ffd08a', '#ffe5ee'], hotel: ['#7cc4ff', '#e3f2ff'] }[k] ?? ['#7cc4ff', '#e3f2ff'];
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs><linearGradient id={'g' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient></defs>
      <rect width="400" height="200" fill={`url(#g${k})`} />
      <circle cx="320" cy="48" r="22" fill="#ffe08a" opacity=".9" />
      {k === 'airport' && <g><path d="M-10 150 Q150 80 410 40" stroke="#fff" strokeWidth="3" strokeDasharray="8 8" fill="none" /><g transform="translate(250 62) rotate(-18)" fill="#12284c"><path d="M0 0 L40 6 L52 0 L40 -6 Z" /><path d="M18 0 L8 -20 L14 -20 L30 -2 Z" /><path d="M18 0 L8 20 L14 20 L30 2 Z" /></g><path d="M0 200 L0 168 Q100 150 200 170 T400 160 L400 200Z" fill="#fff" opacity=".7" /></g>}
      {(k === 'peak' || k === 'harbour' || k === 'wheel') && <g><path d="M0 200 L0 140 L60 90 L120 150 L190 70 L270 160 L330 100 L400 150 L400 200Z" fill={k === 'peak' ? '#2c7a6b' : '#12284c'} opacity={k === 'peak' ? 1 : .35} /><g fill="#12284c" opacity=".85">{[20, 55, 90, 130, 170, 215, 255, 300, 340].map((x, i) => <rect key={x} x={x} y={150 - ((i * 37) % 60) - 10} width="26" height={60 + ((i * 37) % 60)} rx="2" />)}</g>{k === 'wheel' && <g stroke="#ffc83d" strokeWidth="2.5" fill="none"><circle cx="200" cy="95" r="58" /><circle cx="200" cy="95" r="4" fill="#ffc83d" />{Array.from({ length: 12 }, (_, i) => <line key={i} x1="200" y1="95" x2={200 + 58 * Math.cos(i * Math.PI / 6)} y2={95 + 58 * Math.sin(i * Math.PI / 6)} />)}</g>}<rect y="168" width="400" height="32" fill="#3aa8f5" opacity=".6" /></g>}
      {k === 'oceanpark' && <g><path d="M0 200 L0 130 Q100 100 200 140 T400 120 L400 200Z" fill="#14b8a6" opacity=".55" /><path d="M0 200 L0 160 Q100 140 200 165 T400 150 L400 200Z" fill="#3aa8f5" opacity=".7" /><g transform="translate(160 70)"><circle cx="40" cy="40" r="32" fill="#fff" /><circle cx="22" cy="14" r="12" fill="#12284c" /><circle cx="58" cy="14" r="12" fill="#12284c" /><ellipse cx="28" cy="40" rx="8" ry="10" fill="#12284c" /><ellipse cx="52" cy="40" rx="8" ry="10" fill="#12284c" /><ellipse cx="40" cy="52" rx="5" ry="4" fill="#12284c" /></g></g>}
      {k === 'science' && <g><rect x="120" y="110" width="160" height="90" fill="#12284c" opacity=".8" rx="6" /><path d="M150 110 L150 70 L250 70 L250 110" fill="#1d3a6b" /><g stroke="#ffc83d" strokeWidth="3" fill="none"><ellipse cx="200" cy="55" rx="40" ry="14" /><ellipse cx="200" cy="55" rx="40" ry="14" transform="rotate(60 200 55)" /><ellipse cx="200" cy="55" rx="40" ry="14" transform="rotate(-60 200 55)" /></g></g>}
      {k === 'disney' && <g><rect y="170" width="400" height="30" fill="#5fd3c5" /><g fill="#fff" stroke="#12284c" strokeWidth="2"><rect x="150" y="100" width="100" height="75" /><rect x="120" y="120" width="35" height="55" /><rect x="245" y="120" width="35" height="55" /></g><g fill="#8f84ee"><path d="M170 100 L185 55 L200 100Z" /><path d="M200 100 L215 40 L230 100Z" /><path d="M128 120 L138 85 L148 120Z" /><path d="M252 120 L262 85 L272 120Z" /></g></g>}
      {k === 'hotel' && <g><rect x="140" y="50" width="120" height="150" fill="#12284c" opacity=".85" rx="4" />{Array.from({ length: 12 }, (_, i) => <rect key={i} x={156 + (i % 3) * 36} y={66 + Math.floor(i / 3) * 34} width="20" height="20" rx="2" fill="#ffc83d" opacity=".9" />)}</g>}
    </svg>
  );
}

export function Photo({ k, className, children, showCredit = true }: { k: string; className?: string; children?: ReactNode; showCredit?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [err, setErr] = useState(false);
  const [credit, setCredit] = useState<Credit | null>(null);
  const [mine, setMine] = useState(false);
  useEffect(() => {
    let url: string | null = null, live = true;
    setErr(false); setSrc(null); setMine(false);
    getCustomPhoto(k).then((b) => { if (live && b) { url = URL.createObjectURL(b); setSrc(url); setMine(true); } else if (live) setSrc(`/photos/${k}.jpg`); }).catch(() => live && setSrc(`/photos/${k}.jpg`));
    loadCredits().then((c) => live && setCredit(c[k] ?? null));
    return () => { live = false; if (url) URL.revokeObjectURL(url); };
  }, [k]);
  return (
    <div className={cx('relative overflow-hidden bg-sky-soft', className)}>
      {(!src || err) && <Scene k={k} />}
      {src && !err && <img src={src} alt="" loading="lazy" decoding="async" onError={() => setErr(true)} className="absolute inset-0 h-full w-full object-cover" />}
      {children}
      {showCredit && src && !err && !mine && credit && (credit.author || credit.license) && (
        <span className="absolute bottom-1 right-2 max-w-[70%] truncate rounded bg-black/40 px-1.5 text-[10px] text-white">Photo: {credit.author ?? 'unknown'}{credit.license ? ` · ${credit.license}` : ''}</span>
      )}
    </div>
  );
}
