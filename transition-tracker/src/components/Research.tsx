import { useMemo, useState } from 'react';
import { AlertTriangle, Check, ClipboardList, EyeOff, History, MonitorPlay, Plus } from 'lucide-react';
import { useStore } from '../store';
import { fmtClock, fmtTime, localDateStr } from '../lib/format';
import { PHASES, PHASE_LABEL, PHASE_SHORT, STATUS_LABEL, type ObsStatus, type Observation, type Phase, type PosttestUse } from '../lib/types';
import { isCounted } from '../lib/stats';
import { Badge, Button, Empty, Field, Modal, Panel, PhaseDot, Seg } from './ui';

const PHASE_INFO: Record<Phase, { icon: JSX.Element; text: string }> = {
  baseline: { icon: <EyeOff size={18} />, text: 'Teacher-only stopwatch and record form. Pupils see no tracker or intervention visuals.' },
  intervention: { icon: <MonitorPlay size={18} />, text: 'Full classroom display with countdown, steps and celebration, plus actual-time logging.' },
  posttest: { icon: <ClipboardList size={18} />, text: 'Records collected under the approved procedure. You choose below whether the pupil display is shown.' },
};

const statusTone = (s: ObsStatus) => (s === 'valid' ? 'teal' : s === 'manual' ? 'sky' : s === 'review' ? 'sun' : s === 'interrupted' ? 'coral' : 'gray');

function Setup() {
  const { settings, updateSettings, isDemo } = useStore();
  const [val, setVal] = useState(settings.readinessValue != null ? String(settings.readinessValue) : '');
  const n = Number(val);
  const validVal = val.trim() !== '' && isFinite(n) && n > 0 && (settings.readinessType === 'count' || n <= 100);
  const confirm = () => {
    if (!validVal) return;
    updateSettings({ readinessValue: Math.round(n), readinessConfirmed: true });
  };
  const posttestOptions: { value: PosttestUse; title: string; text: string }[] = [
    { value: 'with-tracker', title: 'With the pupil display', text: 'Countdown, steps and celebration are shown during posttest.' },
    { value: 'without-tracker', title: 'Teacher stopwatch only', text: 'Pupils see no tracker. Records are tagged as measured without it.' },
  ];
  return (
    <Panel data={false} title="Study setup" sub="These choices control how observations are recorded and labelled.">
      <div className="stack" style={{ gap: 22 }}>
        <div className="stack" style={{ gap: 10 }}>
          <span className="label">Current research phase</span>
          <div className="phase-cards">
            {PHASES.map((p) => (
              <button key={p} className="phase-card" aria-pressed={settings.phase === p} onClick={() => updateSettings({ phase: p })}>
                <b><PhaseDot phase={p} />{PHASE_LABEL[p]}</b>
                <span className="small muted">{PHASE_INFO[p].text}</span>
              </button>
            ))}
          </div>
        </div>

        {settings.phase === 'posttest' && (
          <div className="stack" style={{ gap: 10 }}>
            <span className="label">How is the tracker used in posttest?</span>
            <div className="phase-cards">
              {posttestOptions.map((o) => (
                <button key={o.value} className="phase-card" aria-pressed={settings.posttestUse === o.value} onClick={() => updateSettings({ posttestUse: o.value })}>
                  <b>{o.title}</b><span className="small muted">{o.text}</span>
                </button>
              ))}
            </div>
            {settings.posttestUse === 'unset' && <div className="banner banner-sun"><AlertTriangle size={18} /><span>Not chosen yet. Recording is paused until you decide, so nothing is assumed.</span></div>}
          </div>
        )}

        <div className="stack" style={{ gap: 10 }}>
          <div className="row-between">
            <span className="label">Readiness criterion: when are "most pupils ready"?</span>
            {settings.readinessConfirmed ? <Badge tone="teal"><Check size={12} /> Confirmed</Badge> : isDemo ? <Badge tone="sun">Not needed in Demo Mode</Badge> : <Badge tone="sun">Needs confirming</Badge>}
          </div>
          <p className="small muted">The study defines a transition as ending when most pupils are ready, but not what "most" means. Enter the rule you and your adviser agreed on. It is saved with every observation. No default is assumed.</p>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <Seg label="Criterion type" value={settings.readinessType} onChange={(v) => updateSettings({ readinessType: v, readinessConfirmed: false })} options={[{ value: 'percent', label: 'Percent of class' }, { value: 'count', label: 'Number of pupils' }]} />
            <div className="field" style={{ width: 140 }}>
              <label htmlFor="rd-val">{settings.readinessType === 'percent' ? 'Percent (1–100)' : 'Pupils ready'}</label>
              <input id="rd-val" className="input" inputMode="numeric" value={val} onChange={(e) => { setVal(e.target.value); if (settings.readinessConfirmed) updateSettings({ readinessConfirmed: false }); }} placeholder="e.g. 90" />
            </div>
            <Button variant="primary" disabled={!validVal} onClick={confirm}>{settings.readinessConfirmed ? 'Confirmed' : 'Confirm criterion'}</Button>
          </div>
          {settings.readinessConfirmed && <p className="small" style={{ color: '#0B5F59', fontWeight: 700 }}>Class Ready means at least {settings.readinessValue}{settings.readinessType === 'percent' ? '% of pupils present are ready' : ' pupils are ready'}.</p>}
        </div>

        <div className="stack" style={{ gap: 10 }}>
          <span className="label">Pairing method for the paired t-test</span>
          <p className="small muted">Matching baseline and posttest observations needs a rule your adviser approves. Until a rule is chosen <b>and</b> approved, no t-test or p-value is shown.</p>
          <div className="row" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ minWidth: 260, flex: 1 }}>
              <label htmlFor="pair-rule">Pairing rule</label>
              <select id="pair-rule" className="select" value={settings.pairingRule} onChange={(e) => updateSettings({ pairingRule: e.target.value as 'unset' | 'routine-order', pairingApproved: false })}>
                <option value="unset">Not chosen yet</option>
                <option value="routine-order">Same routine, matched in order (1st with 1st, 2nd with 2nd…)</option>
              </select>
            </div>
            <label className="row" style={{ gap: 10, minHeight: 44 }}>
              <input type="checkbox" style={{ width: 22, height: 22 }} disabled={settings.pairingRule === 'unset'} checked={settings.pairingApproved} onChange={(e) => updateSettings({ pairingApproved: e.target.checked })} />
              <span className="small"><b>Approved by my research adviser</b></span>
            </label>
          </div>
        </div>
      </div>
    </Panel>
  );
}

const toNum = (v: string): number | null => (v.trim() === '' || isNaN(Number(v)) ? null : Math.max(0, Math.round(Number(v))));

function ObsEditor({ o, onClose }: { o: Observation; onClose: () => void }) {
  const { editObservation, routines } = useStore();
  const total = Math.round(o.durationMs / 1000);
  const [min, setMin] = useState(String(Math.floor(total / 60)));
  const [sec, setSec] = useState(String(total % 60));
  const [phase, setPhase] = useState<Phase>(o.phase);
  const [status, setStatus] = useState<ObsStatus>(o.status);
  const [reason, setReason] = useState('');
  const [rem, setRem] = useState(o.remindersCount != null ? String(o.remindersCount) : '');
  const [remSec, setRemSec] = useState(o.reminderSec != null ? String(o.reminderSec) : '');
  const [present, setPresent] = useState(o.present != null ? String(o.present) : '');
  const [ready, setReady] = useState(o.ready != null ? String(o.ready) : '');
  const [notes, setNotes] = useState(o.notes);
  const [err, setErr] = useState('');
  const newSec = (toNum(min) ?? 0) * 60 + (toNum(sec) ?? 0);
  const durationChanged = newSec !== total;
  const needsReason = durationChanged || status !== o.status || phase !== o.phase;
  const save = () => {
    if (newSec <= 0) return setErr('Duration must be more than 0 seconds.');
    if (needsReason && reason.trim().length < 3) return setErr('Please give a short reason for changing the duration, status or phase. It is kept in the record history.');
    const patch: Partial<Observation> = {
      phase, status, remindersCount: toNum(rem), reminderSec: toNum(remSec), present: toNum(present), ready: toNum(ready), notes: notes.trim(),
    };
    if (durationChanged) patch.durationMs = newSec * 1000;
    if (needsReason) patch.statusReason = reason.trim();
    if (durationChanged && !o.flags.includes('edited')) patch.flags = [...o.flags, 'edited'];
    editObservation(o.id, patch, reason.trim() || 'Details updated');
    onClose();
  };
  const snapRoutine = routines.find((r) => r.id === o.routineId);
  return (
    <Modal title="Observation details" onClose={onClose} wide
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save changes</Button></>}>
      <div className="row" style={{ gap: 8 }}>
        <Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>
        {o.isDemo && <Badge tone="sun">Demo record</Badge>}
        {o.source === 'manual' && <Badge tone="sky">Entered manually</Badge>}
        {o.flags.includes('edited') && <Badge tone="navy">Edited</Badge>}
      </div>
      <dl className="kv">
        <dt>Routine</dt><dd>{o.routineName}</dd>
        <dt>Started</dt><dd>{new Date(o.startedAt).toLocaleString('en-PH')}</dd>
        <dt>Ended</dt><dd>{new Date(o.endedAt).toLocaleString('en-PH')}</dd>
        <dt>Target countdown</dt><dd>{o.targetSec != null ? fmtClock(o.targetSec) : 'None (teacher-only timing)'}</dd>
        <dt>Pupil display shown</dt><dd>{o.trackerShown ? 'Yes' : 'No'}</dd>
        <dt>Readiness criterion</dt><dd>{o.readinessType ? `${o.readinessValue}${o.readinessType === 'percent' ? '%' : ' pupils'}` : 'Not recorded'}</dd>
        <dt>Pauses</dt><dd>{o.pauseCount ? `${o.pauseCount} (paused ${fmtClock(o.pausedMs / 1000)} in total, not counted)` : 'None'}</dd>
        {o.originalDurationMs != null && (<><dt>Original duration</dt><dd>{fmtClock(o.originalDurationMs / 1000)} ({o.originalDurationMs} ms)</dd></>)}
        <dt>Routine snapshot</dt><dd>{o.routineSnapshot.steps.join(' → ')}{snapRoutine && JSON.stringify(snapRoutine.steps) !== JSON.stringify(o.routineSnapshot.steps) ? ' (the routine has been edited since)' : ''}</dd>
      </dl>
      {o.statusReason && <div className="banner banner-sun"><AlertTriangle size={18} /><span>{o.statusReason}</span></div>}
      <div className="grid3">
        <Field label="Actual minutes" htmlFor="e-min"><input id="e-min" className="input" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} /></Field>
        <Field label="Actual seconds" htmlFor="e-sec"><input id="e-sec" className="input" inputMode="numeric" value={sec} onChange={(e) => setSec(e.target.value)} /></Field>
        <Field label="Phase" htmlFor="e-phase">
          <select id="e-phase" className="select" value={phase} onChange={(e) => setPhase(e.target.value as Phase)}>{PHASES.map((p) => <option key={p} value={p}>{PHASE_SHORT[p]}</option>)}</select>
        </Field>
        <Field label="Status" htmlFor="e-status" hint={isCounted({ ...o, status }) ? 'Counted in statistics' : 'Not counted in statistics'}>
          <select id="e-status" className="select" value={status} onChange={(e) => setStatus(e.target.value as ObsStatus)}>
            {(Object.keys(STATUS_LABEL) as ObsStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </Field>
        <Field label="Teacher reminders" htmlFor="e-rem"><input id="e-rem" className="input" inputMode="numeric" value={rem} onChange={(e) => setRem(e.target.value)} /></Field>
        <Field label="Reminder time (sec)" htmlFor="e-rems"><input id="e-rems" className="input" inputMode="numeric" value={remSec} onChange={(e) => setRemSec(e.target.value)} /></Field>
        <Field label="Pupils present" htmlFor="e-pres"><input id="e-pres" className="input" inputMode="numeric" value={present} onChange={(e) => setPresent(e.target.value)} /></Field>
        <Field label="Pupils ready" htmlFor="e-rdy"><input id="e-rdy" className="input" inputMode="numeric" value={ready} onChange={(e) => setReady(e.target.value)} /></Field>
      </div>
      <Field label="Notes" htmlFor="e-notes"><textarea id="e-notes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      <Field label={needsReason ? 'Reason for the change (required)' : 'Reason for changes (needed only for duration, status or phase)'} htmlFor="e-reason">
        <input id="e-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Teacher confirmed from the paper log" />
      </Field>
      {err && <div className="banner banner-coral" role="alert">{err}</div>}
      {o.audit.length > 0 && (
        <div>
          <div className="row" style={{ gap: 6, marginBottom: 6 }}><History size={16} /><b className="small">History of changes</b></div>
          <ul className="list small">
            {o.audit.slice().reverse().map((a, i) => (
              <li key={i} style={{ alignItems: 'flex-start' }}><div><b>{a.field}</b>: {a.from || '—'} → {a.to || '—'}<div className="muted">{new Date(a.at).toLocaleString('en-PH')} · {a.reason}</div></div></li>
            ))}
          </ul>
        </div>
      )}
    </Modal>
  );
}

function ManualEntry({ onClose }: { onClose: () => void }) {
  const { addManual, routines, settings } = useStore();
  const now = new Date();
  const [date, setDate] = useState(localDateStr(now.getTime()));
  const [time, setTime] = useState(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  const [phase, setPhase] = useState<Phase>(settings.phase);
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? '');
  const [min, setMin] = useState('');
  const [sec, setSec] = useState('');
  const [rem, setRem] = useState('');
  const [present, setPresent] = useState('');
  const [ready, setReady] = useState('');
  const [notes, setNotes] = useState('');
  const [reason, setReason] = useState('');
  const [err, setErr] = useState('');
  const save = () => {
    const d = (toNum(min) ?? 0) * 60 + (toNum(sec) ?? 0);
    if (!routineId) return setErr('Choose a routine.');
    if (d <= 0) return setErr('Enter the measured duration (minutes and/or seconds).');
    if (reason.trim().length < 3) return setErr('Say where this measurement came from, so it can be checked later.');
    addManual({ date, time, phase, routineId, durationSec: d, remindersCount: toNum(rem), present: toNum(present), ready: toNum(ready), notes: notes.trim(), reason: reason.trim() });
    onClose();
  };
  return (
    <Modal title="Add a manual entry" onClose={onClose} wide footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save manual entry</Button></>}>
      <div className="banner banner-sky"><ClipboardList size={18} /><span>Use this only to recover a <b>verified</b> observation, such as one timed on paper. It is clearly marked "Manual entry" everywhere, including exports.</span></div>
      <div className="grid3">
        <Field label="Date" htmlFor="m-date"><input id="m-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
        <Field label="Start time" htmlFor="m-time"><input id="m-time" type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        <Field label="Phase" htmlFor="m-phase"><select id="m-phase" className="select" value={phase} onChange={(e) => setPhase(e.target.value as Phase)}>{PHASES.map((p) => <option key={p} value={p}>{PHASE_SHORT[p]}</option>)}</select></Field>
      </div>
      <Field label="Routine" htmlFor="m-rt"><select id="m-rt" className="select" value={routineId} onChange={(e) => setRoutineId(e.target.value)}>{routines.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}</select></Field>
      <div className="grid3">
        <Field label="Actual minutes" htmlFor="m-min"><input id="m-min" className="input" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="0" /></Field>
        <Field label="Actual seconds" htmlFor="m-sec"><input id="m-sec" className="input" inputMode="numeric" value={sec} onChange={(e) => setSec(e.target.value)} placeholder="0" /></Field>
        <Field label="Teacher reminders" htmlFor="m-rem"><input id="m-rem" className="input" inputMode="numeric" value={rem} onChange={(e) => setRem(e.target.value)} placeholder="optional" /></Field>
        <Field label="Pupils present" htmlFor="m-pres"><input id="m-pres" className="input" inputMode="numeric" value={present} onChange={(e) => setPresent(e.target.value)} placeholder="optional" /></Field>
        <Field label="Pupils ready" htmlFor="m-rdy"><input id="m-rdy" className="input" inputMode="numeric" value={ready} onChange={(e) => setReady(e.target.value)} placeholder="optional" /></Field>
      </div>
      <Field label="Source of this measurement (required)" htmlFor="m-reason"><input id="m-reason" className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Timed with wall clock, written in my notebook" /></Field>
      <Field label="Notes" htmlFor="m-notes"><input id="m-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {err && <div className="banner banner-coral" role="alert">{err}</div>}
    </Modal>
  );
}

export function Research() {
  const st = useStore();
  const { obs, routines, isDemo } = st;
  const [fPhase, setFPhase] = useState<Phase | 'all'>('all');
  const [fRoutine, setFRoutine] = useState('all');
  const [fStatus, setFStatus] = useState<'all' | 'counted' | ObsStatus>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<Observation | null>(null);
  const [manual, setManual] = useState(false);

  const routineOpts = useMemo(() => {
    const m = new Map<string, string>();
    obs.forEach((o) => m.set(o.routineId, o.routineName));
    return [...m.entries()];
  }, [obs]);

  const rows = useMemo(
    () => obs
      .filter((o) => (fPhase === 'all' || o.phase === fPhase)
        && (fRoutine === 'all' || o.routineId === fRoutine)
        && (fStatus === 'all' || (fStatus === 'counted' ? isCounted(o) : o.status === fStatus))
        && (!from || o.date >= from) && (!to || o.date <= to))
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt)),
    [obs, fPhase, fRoutine, fStatus, from, to],
  );
  const counted = obs.filter(isCounted).length;
  const review = obs.filter((o) => o.status === 'review').length;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div>
          <div className="eyebrow">Action research</div>
          <h1>Research tracker</h1>
          <p className="muted" style={{ maxWidth: '62ch' }}>Set up your study, then review, correct and add observations. Nothing is ever invented: every number comes from a saved record.</p>
        </div>
        <Button variant="secondary" onClick={() => setManual(true)}><Plus size={18} /> Add manual entry</Button>
      </div>

      <Setup />

      <Panel title="Observations" sub={`${rows.length} shown · ${obs.length} saved · ${counted} counted in statistics`}
        actions={review > 0 ? <Badge tone="sun"><AlertTriangle size={12} /> {review} need review</Badge> : undefined}>
        <div className="stack" style={{ gap: 14 }}>
          <div className="filters">
            <Field label="Phase" htmlFor="f-ph"><select id="f-ph" className="select" value={fPhase} onChange={(e) => setFPhase(e.target.value as Phase | 'all')}><option value="all">All phases</option>{PHASES.map((p) => <option key={p} value={p}>{PHASE_SHORT[p]}</option>)}</select></Field>
            <Field label="Routine" htmlFor="f-rt"><select id="f-rt" className="select" value={fRoutine} onChange={(e) => setFRoutine(e.target.value)}><option value="all">All routines</option>{routineOpts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></Field>
            <Field label="Status" htmlFor="f-st"><select id="f-st" className="select" value={fStatus} onChange={(e) => setFStatus(e.target.value as typeof fStatus)}><option value="all">All statuses</option><option value="counted">Counted (valid + manual)</option>{(Object.keys(STATUS_LABEL) as ObsStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select></Field>
            <Field label="From" htmlFor="f-from"><input id="f-from" type="date" className="input" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
            <Field label="To" htmlFor="f-to"><input id="f-to" type="date" className="input" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          </div>

          {obs.length === 0 ? (
            <Empty icon={<ClipboardList size={26} />} title="No observations yet" action={<Button variant="primary" onClick={() => st.openSession()}>Start a transition</Button>}>
              Timed transitions appear here automatically. You can also add a verified manual entry. Switch on Demo Mode in the menu to see how this looks with sample data.
            </Empty>
          ) : rows.length === 0 ? (
            <Empty icon={<ClipboardList size={26} />} title="No records match these filters" />
          ) : (
            <>
              <div className="table-wrap desktop-only">
                <table className="t">
                  <thead><tr><th>Date</th><th>Phase</th><th>Routine</th><th>Actual</th><th>Target</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {rows.map((o) => (
                      <tr key={o.id} className={isCounted(o) ? '' : 'excluded'} tabIndex={0} onClick={() => setOpen(o)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(o); }}>
                        <td className="num">{o.date}<div className="xs muted">{fmtTime(o.startedAt)}</div></td>
                        <td><span className="row" style={{ gap: 6, flexWrap: 'nowrap' }}><PhaseDot phase={o.phase} />{PHASE_SHORT[o.phase]}</span></td>
                        <td style={{ maxWidth: 240 }}>{o.routineName}</td>
                        <td><span className="dur">{fmtClock(o.durationMs / 1000)}</span></td>
                        <td className="num">{o.targetSec != null ? fmtClock(o.targetSec) : '—'}</td>
                        <td><Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>{o.isDemo && <> <Badge tone="sun">Demo</Badge></>}</td>
                        <td className="small muted" style={{ maxWidth: 220 }}>{o.statusReason || o.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="obs-cards">
                {rows.map((o) => (
                  <button key={o.id} className={`obs-card ${isCounted(o) ? '' : 'excluded'}`} onClick={() => setOpen(o)}>
                    <div className="row-between"><b>{o.routineName}</b><span className="dur" style={{ fontSize: '1.2rem' }}>{fmtClock(o.durationMs / 1000)}</span></div>
                    <div className="row small muted" style={{ gap: 8 }}><PhaseDot phase={o.phase} />{PHASE_SHORT[o.phase]} · {o.date} {fmtTime(o.startedAt)}</div>
                    <div className="row" style={{ gap: 6 }}><Badge tone={statusTone(o.status)}>{STATUS_LABEL[o.status]}</Badge>{o.isDemo && <Badge tone="sun">Demo</Badge>}{!isCounted(o) && <span className="xs muted">not counted</span>}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="xs muted">{isDemo ? 'These are sample records. ' : ''}Tap a record to correct it. Changes to duration, status or phase need a reason and are kept in that record's history. Records are never silently deleted: use "Excluded" to keep them out of the statistics.</p>
        </div>
      </Panel>
      {open && <ObsEditor key={open.id} o={obs.find((x) => x.id === open.id) ?? open} onClose={() => setOpen(null)} />}
      {manual && <ManualEntry onClose={() => setManual(false)} />}
      {routines.length === 0 && manual && null}
    </div>
  );
}
