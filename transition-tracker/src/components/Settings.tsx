import { useRef, useState } from 'react';
import { AlertTriangle, FileJson, FlaskConical, HardDrive, Info, Sheet, Trash2, Upload, Volume2 } from 'lucide-react';
import { useStore } from '../store';
import { observationsToCsv, exportFilename } from '../lib/csv';
import { buildBackup, parseBackup, type BackupFile, type ImportPlan } from '../lib/backup';
import { saveFile } from '../lib/files';
import { storageSelfCheck } from '../lib/db';
import { playCue, unlockAudio } from '../lib/audio';
import { fmtClock } from '../lib/format';
import { Badge, Button, Field, Modal, Panel, Seg, Stepper, Switch } from './ui';

function ImportFlow({ file, plan, onClose }: { file: BackupFile; plan: ImportPlan; onClose: () => void }) {
  const st = useStore();
  const [overwrite, setOverwrite] = useState(false);
  const [config, setConfig] = useState(false);
  const nothing = plan.added.length === 0 && (!overwrite || plan.conflicts.length === 0) && !config;
  return (
    <Modal title="Restore from backup" onClose={onClose}
      footer={<><Button onClick={onClose}>Cancel</Button><Button variant="primary" disabled={nothing} onClick={() => { st.applyImport(plan, overwrite); if (config) st.restoreConfig(file.settings, file.routines); onClose(); }}>Restore</Button></>}>
      <p className="small muted">Backup made {new Date(file.exportedAt).toLocaleString('en-PH')}. Nothing in your current records is overwritten unless you choose to below.</p>
      <ul className="checklist">
        <li><span className="check-ico ok">{plan.added.length}</span><span><b>New records</b> will be added.</span></li>
        <li><span className="check-ico ok">{plan.identical}</span><span><b>Identical records</b> already exist and are skipped, so nothing is duplicated.</span></li>
        <li><span className={`check-ico ${plan.conflicts.length ? 'todo' : 'ok'}`}>{plan.conflicts.length}</span><span><b>Records that differ</b> from the copy on this device.</span></li>
      </ul>
      {plan.conflicts.length > 0 && (
        <label className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
          <input type="checkbox" style={{ width: 22, height: 22, marginTop: 2 }} checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} />
          <span className="small">Replace the {plan.conflicts.length} differing record(s) on this device with the backup's version. Leave unticked to keep what is on this device.</span>
        </label>
      )}
      <label className="row" style={{ gap: 10, alignItems: 'flex-start' }}>
        <input type="checkbox" style={{ width: 22, height: 22, marginTop: 2 }} checked={config} onChange={(e) => setConfig(e.target.checked)} />
        <span className="small">Also restore settings and routines from the backup (replaces the current ones).</span>
      </label>
    </Modal>
  );
}

export function Settings() {
  const st = useStore();
  const { settings, obs, routines, isDemo } = st;
  const fileRef = useRef<HTMLInputElement>(null);
  const [imp, setImp] = useState<{ file: BackupFile; plan: ImportPlan } | null>(null);
  const [impErr, setImpErr] = useState('');
  const [clearAsk, setClearAsk] = useState(false);
  const [typed, setTyped] = useState('');
  const [check, setCheck] = useState<string>('');

  const onFile = async (f: File | undefined) => {
    setImpErr('');
    if (!f) return;
    const res = parseBackup(await f.text());
    if (!res.ok) return setImpErr(res.error);
    if (res.file.dataset === 'demo') return setImpErr('This file contains demonstration data. It cannot be imported into real research records.');
    setImp({ file: res.file, plan: st.previewImport(res.file.observations) });
    if (fileRef.current) fileRef.current.value = '';
  };
  const exportCsv = async () => { const r = await saveFile(exportFilename('csv', isDemo), observationsToCsv(obs), 'text/csv;charset=utf-8'); st.toast(r === 'saved' ? 'CSV exported.' : 'Export cancelled.', r === 'saved' ? 'ok' : 'warn'); };
  const exportJson = async () => { const r = await saveFile(exportFilename('json', isDemo), JSON.stringify(buildBackup(isDemo ? 'demo' : 'real', settings, routines, obs), null, 2), 'application/json'); st.toast(r === 'saved' ? 'Backup exported.' : 'Export cancelled.', r === 'saved' ? 'ok' : 'warn'); };
  const runCheck = async () => {
    const r = await storageSelfCheck();
    setCheck(r.ok ? `Write and read-back worked using ${r.mode}. This only proves saving works right now in this browser.` : `Storage check failed (${r.mode}). Records may not survive a refresh. Export a backup.`);
  };

  const storageLabel = st.storage === 'indexeddb' ? 'IndexedDB (on this device)' : st.storage === 'localstorage' ? 'Browser local storage (fallback)' : 'Memory only (will be lost on refresh)';

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="page-head">
        <div><div className="eyebrow">Preferences</div><h1>Settings</h1></div>
      </div>

      <Panel data={false} title="School and class" sub="No pupil names or personal details are collected.">
        <div className="grid3">
          <Field label="School" htmlFor="s-school"><input id="s-school" className="input" value={settings.schoolName} onChange={(e) => st.updateSettings({ schoolName: e.target.value })} /></Field>
          <Field label="Class name" htmlFor="s-class"><input id="s-class" className="input" value={settings.className} onChange={(e) => st.updateSettings({ className: e.target.value })} /></Field>
          <Field label="Grade" htmlFor="s-grade"><input id="s-grade" className="input" value={settings.grade} onChange={(e) => st.updateSettings({ grade: e.target.value })} /></Field>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <span className="label">Default target for new routines</span>
          <Stepper value={settings.defaultTargetSec} onChange={(v) => st.updateSettings({ defaultTargetSec: v })} format={fmtClock} min={15} max={1800} />
        </div>
      </Panel>

      <Panel data={false} title="Sound and motion" sub="Sound is optional and starts off. The app works fully muted.">
        <div className="stack">
          <label className="row-between"><span className="row" style={{ gap: 10 }}><Volume2 size={20} /><b>Sound cues in the classroom display</b></span><Switch checked={settings.soundOn} onChange={(v) => { unlockAudio(); st.updateSettings({ soundOn: v }); }} label="Sound cues" /></label>
          <div className="row" style={{ gap: 14 }}>
            <label htmlFor="vol" className="label" style={{ minWidth: 70 }}>Volume</label>
            <input id="vol" type="range" min={0.05} max={1} step={0.05} value={settings.volume} onChange={(e) => st.updateSettings({ volume: Number(e.target.value) })} style={{ flex: 1, minWidth: 160, height: 32, accentColor: '#0F766E' }} />
            <Button size="sm" onClick={() => { unlockAudio(); playCue('end', settings.volume); }}>Play test chime</Button>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            <span className="label">Animations</span>
            <Seg label="Motion" value={settings.motion} onChange={(v) => st.updateSettings({ motion: v })} options={[{ value: 'system', label: 'Match my device' }, { value: 'reduced', label: 'Reduced' }, { value: 'full', label: 'Full' }]} />
            <span className="hint">Reduced motion removes sliding, pulsing and confetti. Timing is never affected.</span>
          </div>
        </div>
      </Panel>

      <Panel data={false} title="Records and backups" sub={isDemo ? 'Demo Mode is on. Exports are labelled as demonstration data.' : 'Laptop and phone keep separate records. Use a JSON backup to move them.'}>
        <div className="stack">
          <div className="row">
            <Button onClick={exportCsv}><Sheet size={18} /> Export CSV</Button>
            <Button onClick={exportJson}><FileJson size={18} /> Export JSON backup</Button>
            <Button disabled={isDemo} onClick={() => fileRef.current?.click()}><Upload size={18} /> Restore from backup…</Button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden aria-label="Choose backup file" onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          {isDemo && <p className="small muted">Restoring is turned off while Demo Mode is on, so sample and real records can never mix.</p>}
          {impErr && <div className="banner banner-coral" role="alert"><AlertTriangle size={18} /><span>{impErr}</span></div>}
          <hr style={{ border: 0, borderTop: '1px solid var(--line)', width: '100%' }} />
          {isDemo ? (
            <div className="row-between"><span className="small"><b>Demo data</b> is a fixed sample set kept apart from real records.</span><Button onClick={st.reseedDemo}>Reset demo data</Button></div>
          ) : (
            <div className="row-between"><span className="small"><b>{obs.length}</b> real record(s) on this device.</span><Button variant="danger" disabled={obs.length === 0} onClick={() => { setTyped(''); setClearAsk(true); }}><Trash2 size={16} /> Delete all real records</Button></div>
          )}
        </div>
      </Panel>

      <Panel data={false} title="Storage and testing status" sub="What works, and what has actually been tested.">
        <div className="stack">
          <div className="row" style={{ gap: 10 }}><HardDrive size={20} /><span>Records are saved on this device in <b>{storageLabel}</b>.</span></div>
          <div className="row"><Button size="sm" onClick={runCheck}><FlaskConical size={16} /> Run storage check</Button>{check && <span className="small" role="status">{check}</span>}</div>
          <table className="status-table">
            <tbody>
              <tr><td><b>Saves to this device</b><div className="small muted">IndexedDB with fallbacks</div></td><td><Badge tone="teal">Implemented</Badge></td></tr>
              <tr><td><b>Installs and works offline</b><div className="small muted">{__ARTIFACT__ ? 'Not available in this preview (service workers are blocked). The desktop build includes it.' : 'Built in, but must be tested on the school laptop and phone before December 1.'}</div></td><td><Badge tone="sun">{__ARTIFACT__ ? 'Not in preview' : 'Not tested yet'}</Badge></td></tr>
              <tr><td><b>Data survives restarts and clearing</b><div className="small muted">Not yet checked on the target devices. Export a backup after each session.</div></td><td><Badge tone="sun">Not tested yet</Badge></td></tr>
              <tr><td><b>Projector / Smart TV layout</b><div className="small muted">Designed for 16:9. Needs a check on the real display.</div></td><td><Badge tone="sun">Not tested yet</Badge></td></tr>
              <tr><td><b>Sound cues</b><div className="small muted">Needs a check on the classroom speakers.</div></td><td><Badge tone="sun">Not tested yet</Badge></td></tr>
              <tr><td><b>Sync between laptop and phone</b><div className="small muted">Not built. Use JSON backup and restore.</div></td><td><Badge tone="gray">Not implemented</Badge></td></tr>
            </tbody>
          </table>
        </div>
      </Panel>

      <p className="small muted row" style={{ gap: 8 }}><Info size={16} /> Transition Tracker · prototype v0.1 · {settings.schoolName}</p>

      {imp && <ImportFlow file={imp.file} plan={imp.plan} onClose={() => setImp(null)} />}
      {clearAsk && (
        <Modal title="Delete all real records?" onClose={() => setClearAsk(false)}
          footer={<><Button onClick={() => setClearAsk(false)}>Keep my records</Button><Button variant="danger" disabled={typed !== 'DELETE'} onClick={() => { st.clearRealData(); setClearAsk(false); }}>Delete everything</Button></>}>
          <div className="banner banner-coral"><AlertTriangle size={18} /><span>This permanently removes {obs.length} observation(s) from this device. Export a JSON backup first if you might need them.</span></div>
          <Field label="Type DELETE to confirm" htmlFor="del-t"><input id="del-t" className="input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" /></Field>
        </Modal>
      )}
    </div>
  );
}
