import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, Check, Maximize2, Minimize2, Pause, Play, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { useStore } from '../store';
import { elapsedMs, remainingMs, urgency, type Urgency } from '../lib/timer';
import { fmtClock, fmtClockFloor } from '../lib/format';
import { playCue, unlockAudio } from '../lib/audio';
import { PHASE_LABEL } from '../lib/types';
import { Button, Confetti, RoutineIcon, Stepper } from './ui';

function useNow(running: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!running) { setNow(Date.now()); return; }
    // timestamps, not tick counts: every tick just re-reads the clock
    const id = setInterval(() => setNow(Date.now()), 200);
    const sync = () => setNow(Date.now());
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('focus', sync);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', sync); window.removeEventListener('focus', sync); };
  }, [running]);
  return now;
}

const RING_COLOR: Record<Urgency, string> = { plenty: '#2DD4BF', half: '#F5B942', low: '#F58A2E', over: '#F28C75' };
const URG_LABEL: Record<Urgency, string> = {
  plenty: "You've got this!", half: 'Keep going!', low: 'Almost time!', over: 'Finish getting ready!',
};

function Ring({ remaining, targetSec, status }: { remaining: number; targetSec: number; status: 'idle' | 'running' | 'paused' | 'ended' }) {
  const R = 88;
  const C = 2 * Math.PI * R;
  const idle = status === 'idle';
  const frac = idle ? 1 : Math.max(0, Math.min(1, remaining / (targetSec * 1000)));
  const urg: Urgency = idle ? 'plenty' : urgency(remaining, targetSec);
  const color = RING_COLOR[urg];
  const text = idle ? fmtClock(targetSec) : remaining > 0 ? fmtClock(Math.ceil(remaining / 1000)) : '0:00';
  const label = idle ? 'Ready when you are' : status === 'paused' ? 'Paused' : URG_LABEL[urg];
  return (
    <div className="ring" role="timer" aria-label={`Countdown ${text}. ${label}`} style={{ opacity: status === 'paused' ? 0.65 : 1 }}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle className="track" cx="100" cy="100" r={R} fill="none" strokeWidth="16" />
        {urg === 'over' && !idle && <circle className="pulse" cx="100" cy="100" r={R + 2} fill="none" stroke={color} strokeWidth="3" />}
        <circle className="prog" cx="100" cy="100" r={R} fill="none" strokeWidth="16" strokeLinecap="round" stroke={color}
          strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
      </svg>
      <div className="ring-center">
        <div className="cd-time">{text}</div>
        <div className="cd-label" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

function DetailsSheet({ onDone }: { onDone: () => void }) {
  const { active, obs, patchObservation, settings } = useStore();
  const o = obs.find((x) => x.id === active?.savedObsId);
  const [reminders, setReminders] = useState('');
  const [reminderSec, setReminderSec] = useState('');
  const [present, setPresent] = useState('');
  const [ready, setReady] = useState('');
  const [notes, setNotes] = useState('');
  const num = (v: string) => (v.trim() === '' || isNaN(Number(v)) ? null : Math.max(0, Math.round(Number(v))));
  const commit = () => {
    if (!o) return;
    patchObservation(o.id, { remindersCount: num(reminders), reminderSec: num(reminderSec), present: num(present), ready: num(ready), notes: notes.trim() });
  };
  const p = num(present), r = num(ready);
  let belowCriterion = false;
  if (p && r != null && settings.readinessConfirmed && settings.readinessValue != null) {
    belowCriterion = settings.readinessType === 'percent' ? (r / p) * 100 < settings.readinessValue : r < settings.readinessValue;
  }
  if (!active || !o) return null;
  return (
    <div className="sheet" role="region" aria-label="Observation saved">
      <div className="sheet-inner">
        <div className="row-between">
          <div>
            <div className="row" style={{ gap: 8 }}>
              <Check size={20} color="#0F766E" strokeWidth={3} />
              <b style={{ fontSize: '1.1rem' }}>Saved: {fmtClock(o.durationMs / 1000)} actual time</b>
              {o.status === 'review' && <span className="badge b-sun">Needs review</span>}
              {active.demo && <span className="badge b-sun">Demo</span>}
            </div>
            {o.statusReason && <p className="small muted" style={{ marginTop: 4 }}>{o.statusReason} You can fix this later in Research.</p>}
            {!o.statusReason && <p className="small muted" style={{ marginTop: 4 }}>Optional details below. Everything is already saved on this device.</p>}
          </div>
          <Button variant="primary" size="lg" onClick={() => { commit(); onDone(); }}>Done</Button>
        </div>
        <div className="grid3">
          <div className="field"><label htmlFor="d-rem">Teacher reminders (count)</label>
            <input id="d-rem" className="input" inputMode="numeric" value={reminders} onChange={(e) => setReminders(e.target.value)} onBlur={commit} placeholder="0" /></div>
          <div className="field"><label htmlFor="d-rems">Reminder time (seconds)</label>
            <input id="d-rems" className="input" inputMode="numeric" value={reminderSec} onChange={(e) => setReminderSec(e.target.value)} onBlur={commit} placeholder="optional" /></div>
          <div className="field"><label htmlFor="d-pres">Pupils present</label>
            <input id="d-pres" className="input" inputMode="numeric" value={present} onChange={(e) => setPresent(e.target.value)} onBlur={commit} placeholder="optional" /></div>
          <div className="field"><label htmlFor="d-rdy">Pupils ready</label>
            <input id="d-rdy" className="input" inputMode="numeric" value={ready} onChange={(e) => setReady(e.target.value)} onBlur={commit} placeholder="optional" /></div>
        </div>
        {belowCriterion && (
          <div className="banner banner-sun"><AlertTriangle size={18} /><span>Fewer pupils were ready than your criterion ({settings.readinessValue}{settings.readinessType === 'percent' ? '%' : ' pupils'}). Check that Class Ready was pressed at the right moment.</span></div>
        )}
        <div className="field"><label htmlFor="d-notes">Notes</label>
          <input id="d-notes" className="input" value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={commit} placeholder="Anything that affected this transition (optional)" /></div>
      </div>
    </div>
  );
}

export function SessionScreen() {
  const st = useStore();
  const { active, settings, routines, draftRoutineId, draftTargetSec, blockers, isDemo } = st;
  const rootRef = useRef<HTMLDivElement>(null);
  const running = !!active && active.status !== 'ended';
  const now = useNow(running);
  const [confirm, setConfirm] = useState<null | 'cancel' | 'restart'>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [full, setFull] = useState(false);

  const phase = active?.phase ?? settings.phase;
  const shown = active ? active.trackerShown : st.trackerShownFor(phase);
  const routine = active?.routine ?? routines.find((r) => r.id === draftRoutineId) ?? routines[0];
  const targetSec = active ? active.targetSec : draftTargetSec;
  const status: 'idle' | 'running' | 'paused' | 'ended' = active ? active.status : 'idle';
  const elapsed = active ? elapsedMs(active, now) : 0;
  const remaining = active ? remainingMs(active, now) : targetSec * 1000;
  const ended = status === 'ended';

  /* celebration after the teacher marks the class ready */
  useEffect(() => {
    if (!ended || !shown) return;
    setCelebrating(true);
    const t = setTimeout(() => setCelebrating(false), 3400);
    return () => clearTimeout(t);
  }, [ended, shown, active?.id]);

  /* gentle, optional sound cues (only when the pupil display is shown) */
  const cues = useRef({ id: '', warn: false, end: false });
  useEffect(() => {
    if (!active || !shown || active.status !== 'running' || !routine) return;
    if (cues.current.id !== active.id) cues.current = { id: active.id, warn: false, end: false };
    if (!settings.soundOn || !routine.cueEnabled) return;
    if (remaining <= routine.warnSec * 1000 && remaining > 0 && !cues.current.warn) { cues.current.warn = true; playCue('warn', settings.volume); }
    if (remaining <= 0 && remaining > -8000 && !cues.current.end) { cues.current.end = true; playCue('end', settings.volume); }
  }, [remaining, active, shown, routine, settings.soundOn, settings.volume]);

  /* keep the screen awake while timing (optional, may be refused) */
  useEffect(() => {
    if (!running) return;
    let lock: { release: () => Promise<void> } | null = null;
    const req = async () => {
      try { lock = await (navigator as unknown as { wakeLock?: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock?.request('screen') ?? null; } catch { /* optional */ }
    };
    void req();
    const vis = () => { if (document.visibilityState === 'visible') void req(); };
    document.addEventListener('visibilitychange', vis);
    return () => { document.removeEventListener('visibilitychange', vis); void lock?.release?.().catch(() => undefined); };
  }, [running]);

  /* fullscreen */
  useEffect(() => {
    const f = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', f);
    return () => document.removeEventListener('fullscreenchange', f);
  }, []);
  const toggleFull = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await rootRef.current?.requestFullscreen();
    } catch { st.toast('Fullscreen is not available in this view. The display already fills the window.', 'warn'); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => () => { if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined); }, []);

  const doStart = () => { unlockAudio(); st.startSession(); };
  const doReady = () => {
    if (shown && settings.soundOn) playCue('ready', settings.volume);
    st.classReady();
  };

  /* keyboard: Enter = Start / Class Ready, P = pause or resume */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (confirm || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(t.tagName)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        if (status === 'idle' && !blockers.length) doStart();
        else if (status === 'running' || status === 'paused') doReady();
      }
      if ((e.key === 'p' || e.key === 'P') && (status === 'running' || status === 'paused')) { e.preventDefault(); status === 'running' ? st.pause() : st.resume(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, confirm, blockers.length, active, settings.soundOn, draftRoutineId, draftTargetSec]);

  const urg = useMemo(() => (active && shown ? urgency(remaining, targetSec) : 'plenty'), [active, shown, remaining, targetSec]);

  if (!routine) {
    return (
      <div className="session neutral" ref={rootRef}>
        <div className="neutral-center">
          <h2>No routines yet</h2>
          <p>Create a routine first, then start a transition.</p>
          <Button variant="primary" onClick={st.closeSession}>Back</Button>
        </div>
      </div>
    );
  }

  const cls = `session ${shown ? '' : 'neutral'}`;
  const chip = status === 'running' ? (urg === 'over' && shown ? 'over' : 'running') : status === 'paused' ? 'paused' : '';
  const chipText = status === 'idle' ? 'Ready to start' : status === 'running' ? (urg === 'over' && shown ? 'Waiting for class' : 'Timing') : status === 'paused' ? 'Paused' : 'Class ready';

  const header = shown ? (
    <header className="sess-head">
      <div className="sess-icon"><RoutineIcon icon={routine.icon} size={34} /></div>
      <div style={{ minWidth: 0 }}>
        <div className="sess-eyebrow">Transition time</div>
        <h1 className="sess-title">{routine.title}</h1>
      </div>
      <div className="sess-tools">
        <span className={`status-chip ${chip}`}>{chipText}</span>
        {document.fullscreenEnabled !== false && (
          <Button variant="dark" icon aria-label={full ? 'Exit fullscreen' : 'Enter fullscreen'} onClick={toggleFull}>{full ? <Minimize2 size={20} /> : <Maximize2 size={20} />}</Button>
        )}
        <Button variant="dark" icon aria-label="Back to teacher view" title={running ? 'Back to teacher view (timer keeps running)' : 'Back to teacher view'} onClick={st.closeSession}><X size={22} /></Button>
      </div>
    </header>
  ) : (
    <header className="sess-head">
      <Button variant="dark" size="sm" onClick={st.closeSession} aria-label="Back to teacher view"><ArrowLeft size={16} /> Back</Button>
      <div style={{ minWidth: 0 }}>
        <div className="small muted" style={{ fontWeight: 700 }}>{PHASE_LABEL[phase]} · teacher-only stopwatch</div>
      </div>
      <div className="sess-tools"><span className={`status-chip ${chip}`}>{chipText}</span></div>
    </header>
  );

  const recoveredBanner = active?.recovered && !ended && (
    <div className="banner banner-sun" style={{ margin: '8px 3vw 0' }}>
      <AlertTriangle size={18} />
      <span>This page was reloaded while timing. The clock continued from the saved start time, and the record will be flagged for review.</span>
    </div>
  );

  const idleBlocked = status === 'idle' && blockers.length > 0;

  let body;
  if (idleBlocked) {
    body = (
      <div className="sess-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="blocker-card">
          <h2>One thing to set up first</h2>
          {blockers.map((b) => <div key={b.id} className="banner banner-sun"><AlertTriangle size={18} /><span>{b.text}</span></div>)}
          <div className="row">
            <Button variant="primary" size="lg" onClick={() => { st.closeSession(); st.go('research'); }}>Open research setup</Button>
            <Button variant="secondary" onClick={st.closeSession}>Not now</Button>
          </div>
          <p className="small muted">Demo Mode skips this check, so you can practice with sample data.</p>
        </div>
      </div>
    );
  } else if (shown) {
    body = (
      <div className="sess-body">
        <div className="timer-col">
          <Ring remaining={remaining} targetSec={targetSec} status={status} />
          <span className={`status-chip ${chip} chip-mobile`}>{chipText}</span>
          {status !== 'idle' && (
            <div className="elapsed-pill">Actual time <b className="num">{ended ? fmtClock(elapsed / 1000) : fmtClockFloor(elapsed)}</b></div>
          )}
        </div>
        <ol className="steps" aria-label="Steps">
          {routine.steps.map((s, i) => (
            <li key={`${routine.id}-${i}`} className="step" style={{ ['--i' as string]: i }}>
              <span className="n">{i + 1}</span><span>{s}</span>
            </li>
          ))}
        </ol>
      </div>
    );
  } else {
    body = (
      <div className="neutral-center">
        <div className="small muted" style={{ fontWeight: 700 }}>{routine.title}</div>
        <div className="stopwatch" role="timer" aria-label={`Stopwatch ${fmtClockFloor(elapsed)}`}>{fmtClockFloor(elapsed)}</div>
        {!ended && <p className="small muted" style={{ maxWidth: '46ch' }}>
          Start when you tell the class to change activities. Press <b>Class Ready</b> when most pupils are ready
          {settings.readinessConfirmed && settings.readinessValue != null ? ` (your criterion: ${settings.readinessValue}${settings.readinessType === 'percent' ? '%' : ' pupils'})` : ''}.
          Pupils see no tracker in this phase.
        </p>}
      </div>
    );
  }

  const soundBtn = shown && (
    <Button variant="dark" icon aria-label={settings.soundOn ? 'Turn sound off' : 'Turn sound on'} aria-pressed={settings.soundOn}
      onClick={() => { unlockAudio(); st.updateSettings({ soundOn: !settings.soundOn }); }}>
      {settings.soundOn ? <Volume2 size={22} /> : <VolumeX size={22} />}
    </Button>
  );

  let controls;
  if (status === 'idle') {
    controls = (
      <div className="ctrl-bar">
        <div className="setup">
          <label className="sr-only" htmlFor="rt-select">Routine</label>
          <select id="rt-select" className="select" value={routine.id} onChange={(e) => st.setDraftRoutine(e.target.value)}>
            {routines.map((r) => <option key={r.id} value={r.id}>{r.title}</option>)}
          </select>
          {shown && <Stepper value={targetSec} onChange={st.setDraftTarget} step={15} min={15} max={1800} format={fmtClock} />}
          {soundBtn}
        </div>
        <Button variant="primary" size="xl" disabled={idleBlocked} onClick={doStart}><Play size={24} fill="currentColor" /> Start</Button>
      </div>
    );
  } else if (status === 'running' || status === 'paused') {
    controls = (
      <div className="ctrl-bar">
        <Button variant="primary" size="xl" onClick={doReady}><Check size={26} strokeWidth={3} /> Class Ready</Button>
        {status === 'running'
          ? <Button variant="dark" size="lg" onClick={st.pause}><Pause size={20} /> Pause</Button>
          : <Button variant="sun" size="lg" onClick={st.resume}><Play size={20} fill="currentColor" /> Resume</Button>}
        <Button variant="dark" size="lg" onClick={() => setConfirm('restart')}><RotateCcw size={20} /> Restart</Button>
        <Button variant="dark" size="lg" onClick={() => setConfirm('cancel')}><X size={20} /> Cancel</Button>
        {soundBtn}
      </div>
    );
  } else {
    controls = <div className="ctrl-bar" style={{ minHeight: 70 }}><span className="small" style={{ opacity: .8 }}>Saved. Add optional details below, then press Done.</span></div>;
  }

  return (
    <div className={cls} ref={rootRef} role="dialog" aria-modal="true" aria-label={shown ? 'Classroom display' : 'Baseline stopwatch'} data-phase={phase} data-demo={isDemo ? 'yes' : 'no'}>
      {header}
      {recoveredBanner}
      {body}
      {controls}
      {(status === 'idle' || status === 'running') && !idleBlocked && (
        <div className="kbd-hint" style={{ background: shown ? 'transparent' : undefined }}>Keyboard: Enter = {status === 'idle' ? 'Start' : 'Class Ready'}{status === 'running' ? ' · P = Pause' : ''}</div>
      )}

      {ended && shown && celebrating && (
        <>
          <Confetti />
          <div className="celebrate" onClick={() => setCelebrating(false)} role="status">
            <div className="celebrate-card">
              <div className="check-ring"><Check size={72} strokeWidth={4} /></div>
              <h2>Great job, {settings.className}!</h2>
              <p>Ready in {fmtClock(elapsed / 1000)}</p>
            </div>
          </div>
        </>
      )}
      {ended && !celebrating && <DetailsSheet onDone={st.finishSession} />}

      {confirm && (
        <div className="dialog-over" role="presentation">
          <div className="modal" role="alertdialog" aria-modal="true" aria-labelledby="cf-t" style={{ width: 'min(520px,100%)' }}>
            <div className="modal-head"><h2 id="cf-t">{confirm === 'cancel' ? 'Cancel this transition?' : 'Restart the timer?'}</h2></div>
            <div className="modal-body">
              {confirm === 'cancel' ? (
                <p>You can save it as <b>interrupted</b> so it is kept for your records but not counted in the statistics, or discard it completely.</p>
              ) : (
                <p>The current timing ({fmtClockFloor(elapsed)}) will be <b>discarded</b> and a new one starts from 0:00.</p>
              )}
            </div>
            <div className="modal-foot">
              <Button variant="secondary" autoFocus onClick={() => setConfirm(null)}>Keep timing</Button>
              {confirm === 'cancel' ? (
                <>
                  <Button variant="danger" onClick={() => { setConfirm(null); st.cancelSession(false); }}>Discard</Button>
                  <Button variant="primary" onClick={() => { setConfirm(null); st.cancelSession(true); }}>Save as interrupted</Button>
                </>
              ) : (
                <Button variant="danger" onClick={() => { setConfirm(null); st.restartSession(); }}>Restart and discard</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
