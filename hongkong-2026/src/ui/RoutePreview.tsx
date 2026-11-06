import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Mode } from '../types';

const EMOJI: Record<Mode, string> = { walk: '🚶', uber: '🚗', car: '🚗', mtr: '🚆', ferry: '⛴️', bus: '🚌', plane: '✈️', tram: '🚋', cable: '🚡' };

/** Schematic route (not to scale) with a moving marker. Pure SVG, very light. */
export function RoutePreview({ stops, modes, color = '#3aa8f5' }: { stops: string[]; modes: Mode[]; color?: string }) {
  const id = useId().replace(/:/g, '');
  const reduce = useReducedMotion();
  const W = 360, H = 120, n = stops.length;
  const pts = stops.map((_, i) => ({ x: 28 + (i * (W - 56)) / Math.max(1, n - 1), y: i % 2 === 0 ? 70 : 42 }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < n - 1; i++) { const mx = (pts[i].x + pts[i + 1].x) / 2; d += ` C ${mx} ${pts[i].y}, ${mx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`; }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Route: ${stops.join(' to ')}`}>
      <path id={'p' + id} d={d} fill="none" stroke={color} strokeOpacity=".25" strokeWidth="6" strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray="2 9" className="route-dash" />
      {pts.slice(0, -1).map((p, i) => {
        const q = pts[i + 1]; const m = modes[i];
        return m ? <text key={i} x={(p.x + q.x) / 2} y={(p.y + q.y) / 2 + 5} textAnchor="middle" fontSize="15">{EMOJI[m]}</text> : null;
      })}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="7" fill="#fff" stroke={i === 0 ? '#ff6b57' : i === n - 1 ? '#14b8a6' : color} strokeWidth="3.5" />
          <text x={p.x} y={i % 2 === 0 ? p.y + 25 : p.y - 14} textAnchor="middle" fontSize="11.5" fontWeight="700" fill="#12284c">{stops[i]}</text>
        </g>
      ))}
      {!reduce && (
        <circle r="5" fill="#ffc83d" stroke="#12284c" strokeWidth="1.5">
          <animateMotion dur="7s" repeatCount="indefinite" rotate="auto"><mpath href={'#p' + id} /></animateMotion>
        </circle>
      )}
    </svg>
  );
}
