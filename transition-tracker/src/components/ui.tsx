import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import {
  ArrowLeftRight, Backpack, Bell, BookOpen, Brush, Calculator, FlaskConical, Footprints, Globe, Music, Palette,
  Pencil, Shapes, Star, Sun, Users, X,
} from 'lucide-react';
import { DEMO_LABEL, type IconKey } from '../lib/types';
import { useStore } from '../store';

export const ICONS: Record<IconKey, typeof Sun> = {
  swap: ArrowLeftRight, brush: Brush, sun: Sun, users: Users, book: BookOpen, pencil: Pencil, calc: Calculator,
  flask: FlaskConical, palette: Palette, music: Music, globe: Globe, backpack: Backpack, bell: Bell,
  footprints: Footprints, star: Star, shapes: Shapes,
};
export const ICON_KEYS = Object.keys(ICONS) as IconKey[];

export function RoutineIcon({ icon, size = 24 }: { icon: IconKey; size?: number }) {
  const I = ICONS[icon] ?? Star;
  return <I size={size} strokeWidth={2.4} aria-hidden="true" />;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'sun' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  icon?: boolean;
};
export function Button({ variant = 'secondary', size = 'md', icon, className = '', type = 'button', ...p }: BtnProps) {
  const v = variant === 'dark' ? 'btn-on-dark' : `btn-${variant}`;
  const s = size === 'md' ? '' : `btn-${size}`;
  return <button type={type} className={`btn ${v} ${s} ${icon ? 'btn-icon' : ''} ${className}`} {...p} />;
}

export function Badge({ tone = 'gray', children }: { tone?: 'teal' | 'sun' | 'coral' | 'sky' | 'navy' | 'gray'; children: ReactNode }) {
  return <span className={`badge b-${tone}`}>{children}</span>;
}

/** A card. In Demo Mode every data panel shows the demonstration label. */
export function Panel({ title, sub, actions, children, data = true, className = '', pad = true }: {
  title?: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode; data?: boolean; className?: string; pad?: boolean;
}) {
  const { isDemo } = useStore();
  return (
    <section className={`card panel ${className}`}>
      {data && isDemo && <div className="demo-strip" role="note">{DEMO_LABEL}</div>}
      {(title || actions) && (
        <div className="panel-head">
          <div>
            {title && <h2>{title}</h2>}
            {sub && <p className="panel-sub">{sub}</p>}
          </div>
          {actions && <div className="row">{actions}</div>}
        </div>
      )}
      <div className={pad ? 'panel-body' : ''}>{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <span className="switch">
      <input type="checkbox" role="switch" checked={checked} aria-label={label} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" /><span className="thumb" />
    </span>
  );
}

export function Seg<T extends string>({ value, options, onChange, label }: {
  value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}

export function Stepper({ value, onChange, step = 15, min = 15, max = 3600, format }: {
  value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; format: (v: number) => string;
}) {
  return (
    <div className="stepper" role="group" aria-label="Adjust">
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <output aria-live="polite">{format(value)}</output>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  );
}

export function Modal({ title, onClose, children, footer, wide }: {
  title: string; onClose: () => void; children: ReactNode; footer?: ReactNode; wide?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const first = ref.current?.querySelector<HTMLElement>('input,select,textarea,button:not([data-close])');
    (first ?? ref.current)?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ov; prev?.focus?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="modal-back" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={id} ref={ref} tabIndex={-1} style={wide ? { width: 'min(820px,100%)' } : undefined}>
        <div className="modal-head">
          <h2 id={id}>{title}</h2>
          <Button variant="ghost" icon aria-label="Close" data-close onClick={onClose}><X size={20} /></Button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <div className="ico-sq">{icon}</div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="toasts" aria-live="polite" role="status">
      {toasts.map((t) => <div key={t.id} className={`toast ${t.kind}`}>{t.msg}</div>)}
    </div>
  );
}

const CONFETTI_COLORS = ['#F5B942', '#2DD4BF', '#F28C75', '#60A5FA', '#FFFFFF'];
export function Confetti() {
  const pieces = Array.from({ length: 46 }, (_, i) => {
    const r = (n: number) => ((i * 9301 + n * 49297) % 233280) / 233280;
    return {
      x: `${Math.round(r(1) * 100)}%`, c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      d: `${(r(2) * 0.5).toFixed(2)}s`, t: `${(2.2 + r(3) * 1.4).toFixed(2)}s`,
      dx: `${Math.round((r(4) - 0.5) * 160)}px`, rot: `${Math.round(240 + r(5) * 480)}deg`,
    };
  });
  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p, i) => (
        <i key={i} style={{ ['--x' as string]: p.x, ['--c' as string]: p.c, ['--d' as string]: p.d, ['--t' as string]: p.t, ['--dx' as string]: p.dx, ['--rot' as string]: p.rot }} />
      ))}
    </div>
  );
}

export function PhaseDot({ phase }: { phase: 'baseline' | 'intervention' | 'posttest' }) {
  return <span className="dot" aria-hidden="true" style={{ background: `var(--ph-${phase})` }} />;
}
