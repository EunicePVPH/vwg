import { BarChart3, ClipboardList, Home, ListChecks, Play, Settings as SettingsIcon } from 'lucide-react';
import { StoreProvider, useStore, type View } from './store';
import { DEMO_LABEL } from './lib/types';
import { Toasts } from './components/ui';
import { Dashboard } from './components/Dashboard';
import { Routines } from './components/Routines';
import { Research } from './components/Research';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { SessionScreen } from './components/SessionScreen';

const NAV: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'routines', label: 'Routines', icon: ListChecks },
  { id: 'research', label: 'Research', icon: ClipboardList },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#0F1E38" />
      <circle cx="256" cy="256" r="150" fill="none" stroke="#2B4A7A" strokeWidth="36" />
      <path d="M256 106a150 150 0 0 1 142 102" fill="none" stroke="#F5B942" strokeWidth="36" strokeLinecap="round" />
      <path d="M256 106a150 150 0 0 0-150 150" fill="none" stroke="#2DD4BF" strokeWidth="36" strokeLinecap="round" />
      <path d="M196 262l44 44 84-96" fill="none" stroke="#F8FAFC" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DemoToggle() {
  const { isDemo, setDemoMode } = useStore();
  return (
    <label className="demo-toggle">
      <span className="switch">
        <input type="checkbox" role="switch" checked={isDemo} onChange={(e) => setDemoMode(e.target.checked)} aria-label="Demo Mode" />
        <span className="track" /><span className="thumb" />
      </span>
      <span>Demo Mode</span>
    </label>
  );
}

function SaveChip() {
  const { storage, lastSavedAt } = useStore();
  const ok = storage !== 'memory';
  const t = lastSavedAt ? new Date(lastSavedAt).toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' }) : null;
  return (
    <span className="save-chip" title="Records are stored on this device only. Laptop and phone do not sync automatically.">
      <span className={`save-dot ${ok ? '' : 'warn'}`} />
      {ok ? `Saved on this device${t ? ` · ${t}` : ''}` : 'Not saving. Export a backup!'}
    </span>
  );
}

function Shell() {
  const st = useStore();
  const { view, go, isDemo, ready, sessionOpen, active } = st;
  if (!ready) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', color: 'var(--muted)', fontWeight: 700 }}>Loading your records…</div>;
  }
  const page = view === 'dashboard' ? <Dashboard /> : view === 'routines' ? <Routines /> : view === 'research' ? <Research /> : view === 'reports' ? <Reports /> : <Settings />;
  return (
    <>
      {isDemo && <div className="demo-banner no-print" role="note">{DEMO_LABEL}</div>}
      <div className="app">
        <aside className="sidebar" aria-label="Main">
          <div className="brand"><Logo /><div><div className="brand-name">Transition<br />Tracker</div><div className="brand-sub">San Jose Central School</div></div></div>
          <button className="btn btn-primary btn-lg" style={{ marginBottom: 10, background: '#14B8A6', color: '#06312D' }} onClick={() => st.openSession()}>
            <Play size={20} fill="currentColor" /> {active ? 'Return to timer' : 'Start a transition'}
          </button>
          <nav aria-label="Sections" className="stack" style={{ gap: 4 }}>
            {NAV.map((n) => (
              <button key={n.id} className="nav-btn" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}><n.icon size={20} />{n.label}</button>
            ))}
          </nav>
          <div className="side-foot">
            <div className="side-card"><DemoToggle /><div style={{ marginTop: 6, fontSize: '.75rem' }}>Sample data only. Kept apart from real records.</div></div>
            <SaveChip />
          </div>
        </aside>
        <div className="main">
          <header className="topbar">
            <div className="row" style={{ gap: 10, flexWrap: 'nowrap' }}><Logo size={34} /><div><div className="brand-name" style={{ fontSize: '1.05rem' }}>Transition Tracker</div><SaveChip /></div></div>
            <DemoToggle />
          </header>
          <main className="page" key={view}><div className="view-enter">{page}</div></main>
        </div>
      </div>
      <nav className="tabbar no-print" aria-label="Sections">
        {NAV.map((n) => (
          <button key={n.id} className="tab" aria-current={view === n.id ? 'page' : undefined} onClick={() => go(n.id)}><n.icon size={22} />{n.label}</button>
        ))}
      </nav>
      {sessionOpen && <SessionScreen />}
      <Toasts />
    </>
  );
}

export default function App() {
  return <StoreProvider><Shell /></StoreProvider>;
}
