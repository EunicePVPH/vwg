import { useMemo, useState } from 'react';
import { AlertTriangle, BarChart3, FileJson, Info, Printer, Sheet } from 'lucide-react';
import { useStore } from '../store';
import { countedObs, dailyTrend, estimateSavings, MIN_N_FOR_ESTIMATE, paired, pctChange, summaryByPhase, summaryByRoutine } from '../lib/stats';
import { fmtClock, fmtDateLong, fmtDateShort, fmtNum, fmtPct, fmtSecWords } from '../lib/format';
import { observationsToCsv, exportFilename, REPORT_TITLE } from '../lib/csv';
import { buildBackup } from '../lib/backup';
import { saveFile } from '../lib/files';
import { DEMO_LABEL, PHASE_LABEL } from '../lib/types';
import { Badge, Button, Empty, Panel } from './ui';
import { PhaseLegend, PrePostChart, RoutineChart, SavingsChart, SummaryTable, TrendChart } from './charts';

export function Reports() {
  const st = useStore();
  const { obs, settings, routines, isDemo } = st;
  const [routineId, setRoutineId] = useState<string>('all');

  const valid = useMemo(() => countedObs(obs), [obs]);
  const routineOpts = useMemo(() => {
    const m = new Map<string, string>();
    valid.forEach((o) => m.set(o.routineId, o.routineName));
    return [...m.entries()];
  }, [valid]);
  const rid = routineOpts.some(([id]) => id === routineId) ? routineId : 'all';

  const byPhase = useMemo(() => summaryByPhase(obs, rid), [obs, rid]);
  const trend = useMemo(() => dailyTrend(obs, rid), [obs, rid]);
  const byRoutine = useMemo(() => summaryByRoutine(obs), [obs]);
  const savings = useMemo(() => estimateSavings(obs), [obs]);
  const t = useMemo(() => paired(obs, settings.pairingRule, settings.pairingApproved), [obs, settings.pairingRule, settings.pairingApproved]);

  const change = pctChange(byPhase.baseline.mean, byPhase.posttest.mean);
  const diffSec = byPhase.baseline.mean != null && byPhase.posttest.mean != null ? byPhase.posttest.mean - byPhase.baseline.mean : null;
  const dates = obs.map((o) => o.date).sort();
  const range = dates.length ? `${fmtDateShort(dates[0])} to ${fmtDateShort(dates[dates.length - 1])}` : 'no records yet';
  const excludedCount = obs.length - valid.length;
  const savingsTotal = savings.reduce((a, r) => a + r.observedTotalSec, 0);
  const pooledNote = rid === 'all' && routineOpts.length > 1;

  const exportCsv = async () => {
    const r = await saveFile(exportFilename('csv', isDemo), observationsToCsv(obs), 'text/csv;charset=utf-8');
    st.toast(r === 'saved' ? 'CSV exported. It opens in Excel and Google Sheets.' : 'Export was cancelled.', r === 'saved' ? 'ok' : 'warn');
  };
  const exportJson = async () => {
    const b = buildBackup(isDemo ? 'demo' : 'real', settings, routines, obs);
    const r = await saveFile(exportFilename('json', isDemo), JSON.stringify(b, null, 2), 'application/json');
    st.toast(r === 'saved' ? 'Backup exported.' : 'Export was cancelled.', r === 'saved' ? 'ok' : 'warn');
  };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head no-print">
        <div>
          <div className="eyebrow">Analytics</div>
          <h1>Reports</h1>
          <p className="muted" style={{ maxWidth: '62ch' }}>Charts and statistics come only from your valid saved observations. Empty sections stay empty.</p>
        </div>
        <div className="row">
          <Button variant="secondary" onClick={exportCsv}><Sheet size={18} /> CSV (Excel)</Button>
          <Button variant="secondary" onClick={exportJson}><FileJson size={18} /> JSON backup</Button>
          {!__ARTIFACT__ && <Button variant="primary" onClick={() => window.print()}><Printer size={18} /> Print / PDF</Button>}
        </div>
      </div>
      {__ARTIFACT__ && <div className="banner banner-sky no-print"><Info size={18} /><span>Printing to PDF is not available inside this preview. In the full desktop app this page has a Print / PDF button with a clean print layout.</span></div>}

      <section className="card" style={{ padding: 20 }}>
        {isDemo && <div className="demo-strip" role="note" style={{ margin: '-20px -20px 16px' }}>{DEMO_LABEL}</div>}
        <div className="eyebrow">Research report</div>
        <p className="report-title" style={{ margin: '6px 0 12px' }}>{REPORT_TITLE}</p>
        <dl className="kv">
          <dt>School</dt><dd>{settings.schoolName}</dd>
          <dt>Class</dt><dd>{settings.className}{isDemo ? ' (demo)' : ''}</dd>
          <dt>Current phase</dt><dd>{PHASE_LABEL[settings.phase]}{settings.phase === 'posttest' ? ` · ${settings.posttestUse === 'unset' ? 'tracker use not chosen' : settings.posttestUse === 'with-tracker' ? 'with pupil display' : 'teacher stopwatch only'}` : ''}</dd>
          <dt>Records dated</dt><dd>{range}</dd>
          <dt>Observations</dt><dd>{obs.length} saved · {valid.length} counted · {excludedCount} not counted</dd>
          <dt>Readiness criterion</dt><dd>{settings.readinessConfirmed ? `${settings.readinessValue}${settings.readinessType === 'percent' ? '% of pupils present' : ' pupils'}` : 'Not yet confirmed'}</dd>
          <dt>Generated</dt><dd>{fmtDateLong(Date.now())}</dd>
        </dl>
      </section>

      {obs.length === 0 ? (
        <Panel data={false}>
          <Empty icon={<BarChart3 size={26} />} title="No data to chart yet" action={<Button variant="primary" onClick={() => st.openSession()}>Start a transition</Button>}>
            Once you save observations in the Baseline, Intervention and Posttest phases, charts and statistics appear here. Turn on Demo Mode to preview them with sample data.
          </Empty>
        </Panel>
      ) : (
        <>
          <div className="row no-print">
            <label htmlFor="rp-rt" className="label">Show charts for</label>
            <select id="rp-rt" className="select" style={{ width: 'auto', minWidth: 240 }} value={rid} onChange={(e) => setRoutineId(e.target.value)}>
              <option value="all">All routines (pooled)</option>
              {routineOpts.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
          </div>
          {pooledNote && <div className="banner banner-sky"><Info size={18} /><span><b>Pooled view.</b> Routines differ in how long they naturally take, so combined averages can mislead. Pick one routine above for a like-for-like comparison.</span></div>}

          <div className="chart-grid">
            <Panel title="1. Before and after" sub={rid === 'all' ? 'Mean transition time by phase, all routines pooled' : routineOpts.find(([id]) => id === rid)?.[1]} actions={<PhaseLegend />}>
              <PrePostChart data={byPhase} />
            </Panel>
            <Panel title="2. Daily trend" sub="Mean transition time per day, coloured by phase" actions={<PhaseLegend />}>
              {trend.length ? <TrendChart points={trend} /> : <Empty icon={<BarChart3 size={24} />} title="No valid records yet" />}
            </Panel>
            <Panel title="3. Routine comparison" sub="Mean time per routine and phase">
              {byRoutine.length ? <RoutineChart rows={byRoutine} /> : <Empty icon={<BarChart3 size={24} />} title="No valid records yet" />}
            </Panel>
            <Panel title="4. Estimated time savings" sub="Baseline mean minus posttest mean, per routine">
              {savings.length ? (
                <div className="stack">
                  <div>
                    <div className="big-number">{savingsTotal >= 0 ? '' : '−'}{fmtSecWords(Math.abs(savingsTotal))}</div>
                    <p className="small muted">estimated {savingsTotal >= 0 ? 'time recovered' : 'extra time'} across the {savings.reduce((a, r) => a + r.nPost, 0)} posttest transitions observed</p>
                  </div>
                  <SavingsChart rows={savings} />
                </div>
              ) : (
                <Empty icon={<BarChart3 size={24} />} title="Not enough comparable data yet">
                  An estimate needs at least {MIN_N_FOR_ESTIMATE} valid baseline and {MIN_N_FOR_ESTIMATE} valid posttest observations of the <b>same routine</b>.
                </Empty>
              )}
              <p className="xs muted" style={{ marginTop: 10 }}>This is an estimate of transition time only. It does not show that pupils learned more.</p>
            </Panel>
          </div>

          <Panel title="Statistics" sub={rid === 'all' ? 'All routines pooled. Raw seconds are used for every calculation.' : 'For the selected routine'}>
            <div className="stack">
              <SummaryTable data={byPhase} />
              <dl className="kv">
                <dt>Difference (posttest − baseline)</dt><dd>{diffSec != null ? `${diffSec > 0 ? '+' : diffSec < 0 ? '−' : ''}${fmtNum(Math.abs(diffSec), 1)} sec (${fmtClock(Math.abs(diffSec))})` : 'Needs valid baseline and posttest records'}</dd>
                <dt>Change from baseline</dt><dd>{change != null ? `${fmtPct(change)} ${change < 0 ? '(shorter transitions)' : change > 0 ? '(longer transitions)' : ''}` : 'Needs valid baseline and posttest records'}</dd>
                <dt>Standard deviation</dt><dd>Sample SD (n − 1). Shown only when a phase has 2 or more observations.</dd>
              </dl>
            </div>
          </Panel>

          <Panel title="Paired-samples t-test" sub="Significance level α = 0.05">
            {t.ok ? (
              <div className="stack">
                <div className="banner banner-sky"><Info size={18} /><span>Pairing rule: same routine, observations matched in order of start time, as chosen and approved in Research setup. {t.pairs.length} pairs used. Unmatched records are left out.</span></div>
                <dl className="kv">
                  <dt>Mean difference (post − base)</dt><dd>{fmtNum(t.result.meanDiff, 1)} sec</dd>
                  <dt>SD of differences</dt><dd>{fmtNum(t.result.sdDiff, 1)} sec</dd>
                  <dt>t ({t.result.df})</dt><dd>{fmtNum(t.result.t, 3)}</dd>
                  <dt>p (two-tailed)</dt><dd>{t.result.p < 0.001 ? '< 0.001' : fmtNum(t.result.p, 3)} · {t.result.p < 0.05 ? <Badge tone="teal">below 0.05</Badge> : <Badge tone="gray">not below 0.05</Badge>}</dd>
                </dl>
                {isDemo && <p className="small" style={{ fontWeight: 700 }}>This result comes from sample data and means nothing for the research.</p>}
              </div>
            ) : (
              <div className="banner banner-sun"><AlertTriangle size={18} /><span><b>Test withheld.</b> {t.reason} Choose and get approval for a pairing method in Research setup. No p-value is shown until then.</span></div>
            )}
          </Panel>
        </>
      )}

      <Panel data={false} title="Method notes">
        <ul className="method-list">
          <li>A transition starts when the teacher presses Start (when pupils are told to change activities) and ends when the teacher presses Class Ready, using the readiness criterion shown above.</li>
          <li>Actual time is measured from timestamps and is separate from the countdown. If the countdown reaches zero, the stopwatch keeps running until Class Ready.</li>
          <li>Counted in statistics: records with status Valid or Manual entry. Interrupted, Excluded and Needs review records are kept but not counted.</li>
          <li>Records paused during timing, or recovered after a page reload, are flagged for teacher review before they are counted.</li>
          <li>Mean and sample standard deviation use raw seconds. Minutes:seconds is for display only.</li>
          <li>Baseline records are taken with teacher-only timing and no pupil display.</li>
          <li>Estimated time savings compare like routines only and are an estimate of transition time. They are not evidence of learning gains.</li>
          <li>Laptop and phone keep separate records unless moved with the JSON backup.</li>
          {isDemo && <li><b>{DEMO_LABEL}</b></li>}
        </ul>
      </Panel>
    </div>
  );
}

