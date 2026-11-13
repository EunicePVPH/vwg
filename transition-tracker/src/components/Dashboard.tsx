import { useMemo } from 'react';
import { AlertTriangle, ArrowRight, BarChart3, ClipboardList, Clock, ListChecks, Play, Timer, TrendingDown } from 'lucide-react';
import { useStore } from '../store';
import { countedObs, estimateSavings, mean, durSec } from '../lib/stats';
import { fmtClock, fmtDateLong, fmtSecWords, fmtTime, localDateStr } from '../lib/format';
import { DEMO_LABEL, PHASE_LABEL, STATUS_LABEL } from '../lib/types';
import { Badge, Button, Empty, Panel, PhaseDot, RoutineIcon } from './ui';

export function Dashboard() {
  const st = useStore();
  const { obs, routines, settings, active, isDemo } = st;
  const today = localDateStr(Date.now());
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const k = useMemo(() => {
    const doneToday = obs.filter((o) => o.date === today && (o.status === 'valid' || o.status === 'manual' || o.status === 'review'));
    const validToday = countedObs(obs).filter((o) => o.date === today);
    const valid = countedObs(obs);
    const savings = estimateSavings(obs);
    return {
      doneToday: doneToday.length,
      avgToday: mean(validToday.map(durSec)),
      nValidToday: validToday.length,
      avgAll: mean(valid.map(durSec)),
      nValid: valid.length,
      savingsTotal: savings.length ? savings.reduce((a, r) => a + r.observedTotalSec, 0) : null,
      savingsRoutines: savings.length,
    };
  }, [obs, today]);

  const recent = obs.slice().sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 6);
  const shownPhase = active?.phase ?? settings.phase;

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head" style={{ marginBottom: 0 }}>
        <div>
          <div className="eyebrow">{fmtDateLong(Date.now())}</div>
          <h1>{greet}, teacher</h1>
          <p className="muted">{settings.schoolName} · {settings.className}{isDemo ? ' (demo)' : ''}</p>
        </div>
      </div>

      {active && (
        <div className="banner banner-teal" role="status">
          <Timer size={20} />
          <div className="grow"><b>A transition is {active.status === 'ended' ? 'waiting for you to press Done' : active.status === 'paused' ? 'paused' : 'running'}.</b> {active.routine.title}</div>
          <Button variant="primary" size="sm" onClick={() => st.openSession()}>Return to timer</Button>
        </div>
      )}

      <section className="hero-start" aria-labelledby="start-h">
        <div className="row-between">
          <div>
            <h2 id="start-h">Start a transition</h2>
            <p>Pick a routine. The display opens, then press Start when you tell pupils to change activities.</p>
          </div>
          <span className="phase-pill"><PhaseDot phase={shownPhase} /> {PHASE_LABEL[shownPhase]}</span>
        </div>
        {routines.length === 0 ? (
          <p style={{ marginTop: 16 }}>No routines yet. Add one in the Routines tab.</p>
        ) : (
          <div className="quick-grid">
            {routines.map((r, i) => (
              <button key={r.id} className="quick" style={{ animationDelay: `${i * 60}ms` }} onClick={() => st.openSession(r.id)}>
                <span className="ico"><RoutineIcon icon={r.icon} size={26} /></span>
                <span><b>{r.title}</b><span>{fmtClock(r.targetSec)} target · {r.steps.length} steps</span></span>
              </button>
            ))}
          </div>
        )}
      </section>

      {st.blockers.map((b) => (
        <div key={b.id} className="banner banner-sun">
          <AlertTriangle size={20} />
          <div className="grow">{b.text}</div>
          <Button size="sm" variant="secondary" onClick={() => st.go(b.fixView)}>Set up <ArrowRight size={14} /></Button>
        </div>
      ))}

      <div className="stack" style={{ gap: 8 }}>
        {isDemo && <div className="demo-strip" role="note" style={{ borderRadius: 10, border: '1px solid #E8C468' }}>{DEMO_LABEL}</div>}
        <div className="stat-grid">
          <div className="card stat"><div className="k">Completed today</div><div className="v">{k.doneToday}</div><div className="s">transitions timed</div></div>
          <div className="card stat"><div className="k">Average today</div><div className="v">{k.avgToday != null ? fmtClock(k.avgToday) : '—'}</div><div className="s">{k.nValidToday ? `from ${k.nValidToday} valid record${k.nValidToday === 1 ? '' : 's'}` : 'no valid records today'}</div></div>
          <div className="card stat"><div className="k">Average, all valid records</div><div className="v">{k.avgAll != null ? fmtClock(k.avgAll) : '—'}</div><div className="s">{k.nValid} valid · all phases and routines pooled</div></div>
          <div className="card stat">
            <div className="k">Estimated time recovered</div>
            <div className="v">{k.savingsTotal != null ? fmtSecWords(k.savingsTotal) : '—'}</div>
            <div className="s">{k.savingsTotal != null ? `estimate across ${k.savingsRoutines} routine${k.savingsRoutines === 1 ? '' : 's'} (posttest vs baseline)` : 'Needs 3+ valid baseline and posttest records of the same routine'}</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <Panel title="Recent activity" sub="Latest timed transitions" actions={<Button size="sm" variant="ghost" onClick={() => st.go('research')}>All records <ArrowRight size={14} /></Button>}>
          {recent.length === 0 ? (
            <Empty icon={<Clock size={26} />} title="No transitions recorded yet" action={<Button variant="primary" onClick={() => st.openSession()}><Play size={16} fill="currentColor" /> Start your first transition</Button>}>
              Your timed transitions will show up here. Turn on Demo Mode to look around with sample data.
            </Empty>
          ) : (
            <ul className="list">
              {recent.map((o) => (
                <li key={o.id}>
                  <span className="ico-sq"><RoutineIcon icon={o.routineSnapshot.icon} size={20} /></span>
                  <div className="grow">
                    <b>{o.routineName}</b>
                    <div className="small muted row" style={{ gap: 6 }}><PhaseDot phase={o.phase} />{PHASE_LABEL[o.phase]} · {o.date === today ? 'Today' : o.date} {fmtTime(o.startedAt)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="dur" style={{ fontSize: '1.15rem' }}>{fmtClock(o.durationMs / 1000)}</div>
                    {o.status !== 'valid' && <Badge tone={o.status === 'manual' ? 'sky' : o.status === 'review' ? 'sun' : 'gray'}>{STATUS_LABEL[o.status]}</Badge>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="stack">
          <Panel data={false} title="Jump to">
            <div className="stack" style={{ gap: 10 }}>
              <Button variant="secondary" size="lg" onClick={() => st.go('research')} style={{ justifyContent: 'flex-start' }}><ClipboardList size={20} /> Research tracker</Button>
              <Button variant="secondary" size="lg" onClick={() => st.go('reports')} style={{ justifyContent: 'flex-start' }}><BarChart3 size={20} /> Reports and charts</Button>
              <Button variant="secondary" size="lg" onClick={() => st.go('routines')} style={{ justifyContent: 'flex-start' }}><ListChecks size={20} /> Edit routines</Button>
            </div>
          </Panel>
          <Panel data={false} title="Research status">
            <ul className="checklist">
              <Step ok={isDemo || settings.readinessConfirmed} text={isDemo ? 'Readiness criterion (not needed in Demo Mode)' : settings.readinessConfirmed ? `Readiness criterion confirmed: ${settings.readinessValue}${settings.readinessType === 'percent' ? '%' : ' pupils'}` : 'Readiness criterion not confirmed yet'} />
              <Step ok={settings.phase !== 'posttest' || settings.posttestUse !== 'unset'} text={settings.posttestUse === 'unset' ? 'Posttest tracker use not chosen yet' : `Posttest: ${settings.posttestUse === 'with-tracker' ? 'with pupil display' : 'teacher stopwatch only'}`} />
              <Step ok={settings.pairingRule !== 'unset' && settings.pairingApproved} text={settings.pairingRule === 'unset' ? 'Pairing method for t-test not chosen (test withheld)' : settings.pairingApproved ? 'Pairing method approved' : 'Pairing method not yet approved (test withheld)'} />
            </ul>
          </Panel>
          <p className="small muted row" style={{ gap: 6 }}><TrendingDown size={16} /> Time recovered is an estimate of transition time only. It does not show learning gains.</p>
        </div>
      </div>
    </div>
  );
}

function Step({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li><span className={`check-ico ${ok ? 'ok' : 'todo'}`} aria-hidden="true">{ok ? '✓' : '!'}</span><span>{text}</span></li>
  );
}
