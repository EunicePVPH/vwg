import { useEffect, useRef, useState } from 'react';
import { fmtClock, fmtDateShort, fmtNum, fmtSecWords } from '../lib/format';
import { PHASE_SHORT, PHASES, type Phase } from '../lib/types';
import type { RoutineRow, SavingsRow, Summary, TrendPoint } from '../lib/stats';

export const PHASE_COLOR: Record<Phase, string> = { baseline: '#F28C75', intervention: '#F5B942', posttest: '#0D9488' };

function useWidth(): [React.RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(320);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth || 320);
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setW(el.clientWidth || 320));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function niceMax(maxVal: number): { max: number; step: number } {
  const steps = [10, 15, 20, 30, 45, 60, 90, 120, 150, 180, 240, 300, 600, 900, 1800];
  const step = steps.find((s) => maxVal / s <= 5) ?? 1800;
  return { max: Math.max(step, Math.ceil(maxVal / step) * step), step };
}

export function PhaseLegend() {
  return (
    <div className="legend" aria-label="Legend">
      {PHASES.map((p) => <span key={p}><i className="sw" style={{ background: PHASE_COLOR[p] }} />{PHASE_SHORT[p]}</span>)}
    </div>
  );
}

/* ---------- 1. pre / post comparison (mean ± SD bars) ---------- */
export function PrePostChart({ data }: { data: Record<Phase, Summary> }) {
  const [ref, w] = useWidth();
  const H = 280, m = { t: 26, r: 12, b: 54, l: 46 };
  const any = PHASES.some((p) => data[p].n > 0);
  const top = Math.max(60, ...PHASES.map((p) => (data[p].mean ?? 0) + (data[p].sd ?? 0)));
  const { max, step } = niceMax(top * 1.05);
  const iw = w - m.l - m.r, ih = H - m.t - m.b;
  const y = (v: number) => m.t + ih - (v / max) * ih;
  const slot = iw / 3;
  const bw = Math.min(88, slot * 0.6);
  const ticks: number[] = [];
  for (let v = 0; v <= max + 0.001; v += step) ticks.push(v);
  const summary = any
    ? PHASES.map((p) => `${PHASE_SHORT[p]}: ${data[p].n ? `mean ${fmtClock(data[p].mean as number)} from ${data[p].n} observations` : 'no valid observations'}`).join('. ')
    : 'No valid observations yet.';
  return (
    <div ref={ref} className="chart">
      <svg width={w} height={H} role="img" aria-label={`Average transition time by phase. ${summary}`}>
        <g className="axis">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={m.l} x2={w - m.r} y1={y(v)} y2={y(v)} stroke="#E1E7EF" strokeWidth="1" />
              <text x={m.l - 8} y={y(v) + 4} textAnchor="end">{fmtClock(v)}</text>
            </g>
          ))}
        </g>
        {PHASES.map((p, i) => {
          const s = data[p];
          const cx = m.l + slot * i + slot / 2;
          return (
            <g key={p}>
              {s.n > 0 && s.mean != null ? (
                <>
                  <rect className="bar-v" x={cx - bw / 2} y={y(s.mean)} width={bw} height={Math.max(2, m.t + ih - y(s.mean))} rx="8" fill={PHASE_COLOR[p]} style={{ animationDelay: `${i * 90}ms` }} />
                  {s.sd != null && (
                    <g stroke="#172B4D" strokeWidth="2" strokeLinecap="round">
                      <line x1={cx} x2={cx} y1={y(Math.max(0, s.mean - s.sd))} y2={y(s.mean + s.sd)} />
                      <line x1={cx - 8} x2={cx + 8} y1={y(s.mean + s.sd)} y2={y(s.mean + s.sd)} />
                      <line x1={cx - 8} x2={cx + 8} y1={y(Math.max(0, s.mean - s.sd))} y2={y(Math.max(0, s.mean - s.sd))} />
                    </g>
                  )}
                  <text x={cx} y={Math.max(14, y(s.mean + (s.sd ?? 0)) - 8)} textAnchor="middle" fontSize="14" fontWeight="800">{fmtClock(s.mean)}</text>
                </>
              ) : (
                <>
                  <rect x={cx - bw / 2} y={y(0) - 40} width={bw} height={40} rx="8" fill="none" stroke="#CBD5E1" strokeDasharray="5 4" />
                  <text x={cx} y={y(0) - 16} textAnchor="middle" fontSize="12" style={{ fill: '#5B6B85' }}>No data</text>
                </>
              )}
              <text x={cx} y={H - 30} textAnchor="middle" fontSize="13" fontWeight="700">{PHASE_SHORT[p]}</text>
              <text x={cx} y={H - 12} textAnchor="middle" fontSize="12" style={{ fill: '#5B6B85' }}>n = {s.n}</text>
            </g>
          );
        })}
      </svg>
      <p className="xs muted">Bars show the mean. Whiskers show ± 1 standard deviation (needs 2 or more observations).</p>
      <details className="data-alt">
        <summary>View as table</summary>
        <SummaryTable data={data} />
      </details>
    </div>
  );
}

export function SummaryTable({ data }: { data: Record<Phase, Summary> }) {
  return (
    <div className="table-wrap">
      <table className="stats-table">
        <thead><tr><th>Phase</th><th>n</th><th>Mean</th><th>SD</th><th>Min</th><th>Max</th></tr></thead>
        <tbody>
          {PHASES.map((p) => {
            const s = data[p];
            return (
              <tr key={p}>
                <td>{PHASE_SHORT[p]}</td><td>{s.n}</td>
                <td>{s.mean != null ? `${fmtClock(s.mean)} (${fmtNum(s.mean, 1)} s)` : '—'}</td>
                <td>{s.sd != null ? `${fmtNum(s.sd, 1)} s` : '—'}</td>
                <td>{s.min != null ? fmtClock(s.min) : '—'}</td><td>{s.max != null ? fmtClock(s.max) : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- 2. daily trend ---------- */
export function TrendChart({ points }: { points: TrendPoint[] }) {
  const [ref, w] = useWidth();
  const H = 270, m = { t: 20, r: 16, b: 44, l: 46 };
  if (points.length === 0) return <div ref={ref} className="chart" />;
  const top = Math.max(60, ...points.map((p) => p.mean));
  const { max, step } = niceMax(top * 1.08);
  const iw = w - m.l - m.r, ih = H - m.t - m.b;
  const x = (i: number) => m.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => m.t + ih - (v / max) * ih;
  const ticks: number[] = [];
  for (let v = 0; v <= max + 0.001; v += step) ticks.push(v);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.mean).toFixed(1)}`).join(' ');
  const every = Math.max(1, Math.ceil(points.length / Math.max(2, Math.floor(iw / 62))));
  const summary = `Daily average transition time across ${points.length} day${points.length === 1 ? '' : 's'}, from ${fmtClock(points[0].mean)} on ${fmtDateShort(points[0].date)} to ${fmtClock(points[points.length - 1].mean)} on ${fmtDateShort(points[points.length - 1].date)}.`;
  return (
    <div ref={ref} className="chart">
      <svg width={w} height={H} role="img" aria-label={summary}>
        <g className="axis">
          {ticks.map((v) => (
            <g key={v}>
              <line x1={m.l} x2={w - m.r} y1={y(v)} y2={y(v)} stroke="#E1E7EF" />
              <text x={m.l - 8} y={y(v) + 4} textAnchor="end">{fmtClock(v)}</text>
            </g>
          ))}
          {points.map((p, i) => (i % every === 0 || i === points.length - 1) && (
            <text key={p.date} x={x(i)} y={H - 20} textAnchor="middle">{fmtDateShort(p.date)}</text>
          ))}
        </g>
        {points.length > 1 && <path className="line-draw" pathLength={1} d={path} fill="none" stroke="#172B4D" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" opacity=".55" />}
        {points.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.mean)} r="7" fill={PHASE_COLOR[p.phase]} stroke="#fff" strokeWidth="2.5">
              <title>{`${fmtDateShort(p.date)} · ${PHASE_SHORT[p.phase]} · mean ${fmtClock(p.mean)} · n=${p.n}`}</title>
            </circle>
          </g>
        ))}
      </svg>
      <details className="data-alt">
        <summary>View as table</summary>
        <div className="table-wrap">
          <table className="stats-table">
            <thead><tr><th>Date</th><th>Phase</th><th>Mean</th><th>n</th></tr></thead>
            <tbody>{points.map((p) => <tr key={p.date}><td>{fmtDateShort(p.date)}</td><td>{PHASE_SHORT[p.phase]}</td><td>{fmtClock(p.mean)}</td><td>{p.n}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

/* ---------- 3. routine comparison (HTML bars, labels always visible) ---------- */
export function RoutineChart({ rows }: { rows: RoutineRow[] }) {
  const maxV = Math.max(1, ...rows.flatMap((r) => PHASES.map((p) => r.byPhase[p].mean ?? 0)));
  return (
    <div className="stack" style={{ gap: 18 }}>
      {rows.map((r, ri) => (
        <div key={r.routineId} role="group" aria-label={r.routineName}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}>{r.routineName}</div>
          <div className="stack" style={{ gap: 6 }}>
            {PHASES.map((p, pi) => {
              const s = r.byPhase[p];
              return (
                <div className="hbar-row" key={p}>
                  <span className="hbar-label">{PHASE_SHORT[p]}</span>
                  <div className="hbar-track">
                    {s.mean != null && <div className="hbar" style={{ width: `${Math.max(2, (s.mean / maxV) * 100)}%`, background: PHASE_COLOR[p], animationDelay: `${(ri * 3 + pi) * 60}ms` }} />}
                  </div>
                  <span className="hbar-val num">{s.mean != null ? <>{fmtClock(s.mean)} <small>n={s.n}</small></> : <small>no data</small>}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 4. time savings ---------- */
export function SavingsChart({ rows }: { rows: SavingsRow[] }) {
  const maxV = Math.max(1, ...rows.map((r) => Math.abs(r.perTransitionSec)));
  return (
    <div className="stack" style={{ gap: 12 }}>
      {rows.map((r, i) => {
        const good = r.perTransitionSec >= 0;
        return (
          <div key={r.routineId}>
            <div className="row-between" style={{ marginBottom: 4 }}>
              <b>{r.routineName}</b>
              <span className="small muted">baseline n={r.nBase} · posttest n={r.nPost}</span>
            </div>
            <div className="hbar-row" style={{ gridTemplateColumns: '1fr auto' }}>
              <div className="hbar-track"><div className="hbar" style={{ width: `${Math.max(2, (Math.abs(r.perTransitionSec) / maxV) * 100)}%`, background: good ? '#0D9488' : '#F28C75', animationDelay: `${i * 80}ms` }} /></div>
              <span className="hbar-val num" style={{ minWidth: 150 }}>{good ? 'saved ' : 'slower by '}{fmtSecWords(Math.abs(r.perTransitionSec))}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
