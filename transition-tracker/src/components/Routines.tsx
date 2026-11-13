import { useState } from 'react';
import { ArrowDown, ArrowUp, Copy, Pencil, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useStore } from '../store';
import { fmtClock, uid } from '../lib/format';
import type { IconKey, Routine } from '../lib/types';
import { Button, Field, ICON_KEYS, Modal, Panel, RoutineIcon, Stepper, Switch } from './ui';

const PRESETS = [60, 90, 120, 180, 300];

function Editor({ initial, onClose }: { initial: Routine; onClose: () => void }) {
  const { saveRoutine } = useStore();
  const [r, setR] = useState<Routine>(() => JSON.parse(JSON.stringify(initial)));
  const [err, setErr] = useState('');
  const setStep = (i: number, v: string) => setR((x) => ({ ...x, steps: x.steps.map((s, j) => (j === i ? v : s)) }));
  const move = (i: number, d: number) => setR((x) => {
    const s = [...x.steps]; const j = i + d;
    if (j < 0 || j >= s.length) return x;
    [s[i], s[j]] = [s[j], s[i]];
    return { ...x, steps: s };
  });
  const save = () => {
    const steps = r.steps.map((s) => s.trim()).filter(Boolean);
    if (!r.title.trim()) return setErr('Please give the routine a title.');
    if (steps.length === 0) return setErr('Add at least one step.');
    saveRoutine({ ...r, title: r.title.trim(), steps });
    onClose();
  };
  return (
    <Modal title={initial.title ? 'Edit routine' : 'New routine'} onClose={onClose} wide
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save routine</Button></>}>
      <Field label="Title" htmlFor="rt-title"><input id="rt-title" className="input" value={r.title} onChange={(e) => setR({ ...r, title: e.target.value })} placeholder="e.g. Switching to English" /></Field>
      <div className="field">
        <span className="label">Icon</span>
        <div className="icon-pick">
          {ICON_KEYS.map((k) => (
            <button key={k} type="button" aria-pressed={r.icon === k} aria-label={`Icon ${k}`} onClick={() => setR({ ...r, icon: k as IconKey })}><RoutineIcon icon={k} size={24} /></button>
          ))}
        </div>
      </div>
      <div className="field">
        <span className="label">Steps shown to pupils <span className="muted" style={{ fontWeight: 500 }}>(3 or 4 read best on the projector)</span></span>
        <div className="stack" style={{ gap: 8 }}>
          {r.steps.map((s, i) => (
            <div className="step-edit" key={i}>
              <span className="n">{i + 1}</span>
              <input className="input" aria-label={`Step ${i + 1}`} value={s} onChange={(e) => setStep(i, e.target.value)} />
              <Button variant="ghost" icon aria-label="Move step up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={18} /></Button>
              <Button variant="ghost" icon aria-label="Move step down" disabled={i === r.steps.length - 1} onClick={() => move(i, 1)}><ArrowDown size={18} /></Button>
              <Button variant="ghost" icon aria-label="Remove step" onClick={() => setR({ ...r, steps: r.steps.filter((_, j) => j !== i) })}><Trash2 size={18} /></Button>
            </div>
          ))}
          <div><Button size="sm" onClick={() => setR({ ...r, steps: [...r.steps, ''] })}><Plus size={16} /> Add step</Button></div>
        </div>
      </div>
      <div className="grid2">
        <div className="field">
          <span className="label">Target countdown</span>
          <Stepper value={r.targetSec} onChange={(v) => setR({ ...r, targetSec: v })} step={15} min={15} max={1800} format={fmtClock} />
          <div className="row" style={{ gap: 6 }}>{PRESETS.map((p) => <Button key={p} size="sm" variant={r.targetSec === p ? 'primary' : 'secondary'} onClick={() => setR({ ...r, targetSec: p })}>{fmtClock(p)}</Button>)}</div>
          <span className="hint">A placeholder until you set it. The research stopwatch is separate and never stops at zero.</span>
        </div>
        <div className="field">
          <span className="label">Sound cues</span>
          <label className="row" style={{ gap: 10 }}><Switch checked={r.cueEnabled} onChange={(v) => setR({ ...r, cueEnabled: v })} label="Sound cues for this routine" /><span>{r.cueEnabled ? 'On for this routine' : 'Off'}</span></label>
          {r.cueEnabled && (<>
            <span className="label" style={{ marginTop: 6 }}>Gentle warning at</span>
            <Stepper value={r.warnSec} onChange={(v) => setR({ ...r, warnSec: v })} step={5} min={5} max={120} format={(v) => `${v} sec left`} />
          </>)}
          <span className="hint">Sound also needs the sound switch on in the classroom display. It is off by default.</span>
        </div>
      </div>
      {err && <div className="banner banner-coral" role="alert">{err}</div>}
    </Modal>
  );
}

export function Routines() {
  const st = useStore();
  const [editing, setEditing] = useState<Routine | null>(null);
  const [del, setDel] = useState<Routine | null>(null);
  const [resetAsk, setResetAsk] = useState(false);
  const blank = (): Routine => ({ id: uid('r'), title: '', icon: 'star', steps: ['', '', ''], targetSec: st.settings.defaultTargetSec, cueEnabled: true, warnSec: 20 });
  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Library</div>
          <h1>Routines</h1>
          <p className="muted" style={{ maxWidth: '60ch' }}>These four are editable suggestions. Each saved observation keeps its own copy of the routine, so edits never change past records.</p>
        </div>
        <div className="row">
          <Button variant="secondary" onClick={() => setResetAsk(true)}><RotateCcw size={16} /> Restore defaults</Button>
          <Button variant="primary" onClick={() => setEditing(blank())}><Plus size={18} /> New routine</Button>
        </div>
      </div>
      <div className="routine-grid">
        {st.routines.map((r, i) => (
          <article key={r.id} className="card routine-card" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="row" style={{ gap: 12, flexWrap: 'nowrap' }}>
              <span className="ico-sq" style={{ width: 52, height: 52, borderRadius: 16 }}><RoutineIcon icon={r.icon} size={26} /></span>
              <div className="grow"><h3 style={{ fontSize: '1.1rem' }}>{r.title}</h3><div className="small muted num">Target {fmtClock(r.targetSec)} · {r.cueEnabled ? `cue at ${r.warnSec}s` : 'no cue'}</div></div>
            </div>
            <ol>{r.steps.map((s, j) => <li key={j}>{s}</li>)}</ol>
            <div className="row" style={{ marginTop: 'auto' }}>
              <Button variant="primary" size="sm" onClick={() => st.openSession(r.id)}>Start</Button>
              <Button size="sm" onClick={() => setEditing(r)}><Pencil size={15} /> Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => st.duplicateRoutine(r.id)}><Copy size={15} /> Duplicate</Button>
              <Button size="sm" variant="ghost" aria-label={`Delete ${r.title}`} onClick={() => setDel(r)}><Trash2 size={15} /></Button>
            </div>
          </article>
        ))}
      </div>
      {st.routines.length === 0 && <Panel data={false}><p className="muted">No routines. Create one or restore the defaults.</p></Panel>}
      {editing && <Editor initial={editing} onClose={() => setEditing(null)} />}
      {del && (
        <Modal title="Delete this routine?" onClose={() => setDel(null)}
          footer={<><Button onClick={() => setDel(null)}>Keep it</Button><Button variant="danger" onClick={() => { st.deleteRoutine(del.id); setDel(null); }}>Delete</Button></>}>
          <p><b>{del.title}</b> will be removed from the library. Observations already saved with it keep their own copy.</p>
        </Modal>
      )}
      {resetAsk && (
        <Modal title="Restore the four default routines?" onClose={() => setResetAsk(false)}
          footer={<><Button onClick={() => setResetAsk(false)}>Cancel</Button><Button variant="danger" onClick={() => { st.resetRoutines(); setResetAsk(false); }}>Restore defaults</Button></>}>
          <p>This replaces your current routine list, including any you created or edited. Saved observations are not affected.</p>
        </Modal>
      )}
    </div>
  );
}
