import { useMemo } from 'react';
const COLORS = ['#ff6b57', '#3aa8f5', '#14b8a6', '#8f84ee', '#ffc83d', '#ff9fbd'];
/** Lightweight CSS-only confetti. Renders nothing when `burst` is 0. Respects reduced motion via global CSS. */
export function Confetti({ burst }: { burst: number }) {
  const bits = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    x: (Math.random() - 0.5) * 340, y: -(120 + Math.random() * 260), r: Math.random() * 720 - 360, d: 0.9 + Math.random() * 0.8, c: COLORS[i % COLORS.length], w: 6 + Math.random() * 6,
  })), [burst]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!burst) return null;
  return (
    <div key={burst} className="pointer-events-none fixed inset-x-0 top-1/2 z-[60] h-0" aria-hidden>
      <style>{`@keyframes cf{0%{transform:translate(0,0) rotate(0);opacity:1}70%{opacity:1}100%{transform:translate(var(--x),calc(var(--y) * -1 + 380px)) rotate(var(--r));opacity:0}}`}</style>
      {bits.map((b, i) => (
        <span key={i} style={{ ['--x' as string]: b.x + 'px', ['--y' as string]: b.y + 'px', ['--r' as string]: b.r + 'deg', animation: `cf ${b.d}s cubic-bezier(.2,.7,.4,1) forwards`, background: b.c, width: b.w, height: b.w * 0.6 }}
          className="absolute left-1/2 top-0 rounded-[2px]" />
      ))}
    </div>
  );
}
