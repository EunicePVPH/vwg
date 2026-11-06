import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { CalendarDays, Ellipsis, Home as HomeIcon, Map as MapIcon, Ticket } from 'lucide-react';
import { Lock } from './screens/Lock';
import { StateProvider, useSettings } from './state/store';
import { VaultProvider } from './state/vault';
import { useRoute } from './ui/router';
import { PlaneLoader, cx } from './ui/primitives';
import { Splash } from './ui/Splash';
import { Home } from './screens/Home';
import { Itinerary } from './screens/Itinerary';
import { More } from './screens/More';
const Tickets = lazy(() => import('./screens/Tickets').then((m) => ({ default: m.Tickets })));
const Maps = lazy(() => import('./screens/Maps').then((m) => ({ default: m.Maps })));
const FlightsHotel = lazy(() => import('./screens/Trip').then((m) => ({ default: m.FlightsHotel })));
const Money = lazy(() => import('./screens/Money').then((m) => ({ default: m.Money })));
const Ready = lazy(() => import('./screens/Ready').then((m) => ({ default: m.Ready })));
const Packing = lazy(() => import('./screens/Packing').then((m) => ({ default: m.Packing })));
const Shopping = lazy(() => import('./screens/Shopping').then((m) => ({ default: m.Shopping })));
const Docs = lazy(() => import('./screens/Docs').then((m) => ({ default: m.Docs })));
const Food = lazy(() => import('./screens/Info').then((m) => ({ default: m.Food })));
const Guide = lazy(() => import('./screens/Info').then((m) => ({ default: m.Guide })));
const Health = lazy(() => import('./screens/Info').then((m) => ({ default: m.Health })));
const Emergency = lazy(() => import('./screens/Info').then((m) => ({ default: m.Emergency })));
const Settings = lazy(() => import('./screens/Settings').then((m) => ({ default: m.Settings })));

const TABS = [
  { id: 'home', label: 'Home', icon: HomeIcon }, { id: 'itinerary', label: 'Itinerary', icon: CalendarDays }, { id: 'maps', label: 'Maps', icon: MapIcon },
  { id: 'tickets', label: 'Tickets', icon: Ticket }, { id: 'more', label: 'More', icon: Ellipsis },
];

function Shell({ onLock }: { onLock: () => void }) {
  const [route] = useRoute();
  const { settings } = useSettings();
  const [splash, setSplash] = useState(() => { try { return !sessionStorage.getItem('hk26.splash'); } catch { return true; } });
  const doneSplash = useCallback(() => { try { sessionStorage.setItem('hk26.splash', '1'); } catch { /* */ } setSplash(false); }, []);
  useEffect(() => { document.documentElement.dataset.motion = settings.motion === 'off' ? 'off' : 'on'; }, [settings.motion]);
  const tab = TABS.some((t) => t.id === route[0]) ? route[0] : 'home';
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [route.join('/')]);

  let page: React.ReactNode;
  const sub = route[1];
  if (tab === 'home') page = <Home />;
  else if (tab === 'itinerary') page = <Itinerary dayArg={sub} />;
  else if (tab === 'maps') page = <Maps />;
  else if (tab === 'tickets') page = <Tickets focus={sub} />;
  else page = sub === 'flights' ? <FlightsHotel /> : sub === 'expenses' ? <Money /> : sub === 'ready' ? <ConfettiBoundary><Ready /></ConfettiBoundary> : sub === 'packing' ? <Packing param={route.slice(2)} /> : sub === 'shopping' ? <Shopping />
    : sub === 'documents' ? <Docs /> : sub === 'food' ? <Food /> : sub === 'guide' ? <Guide /> : sub === 'health' ? <Health /> : sub === 'emergency' ? <Emergency /> : sub === 'settings' ? <Settings onLock={onLock} /> : <More onLock={onLock} />;

  return (
    <MotionConfig reducedMotion={settings.motion === 'off' ? 'always' : 'user'}>
      <Splash show={splash} onDone={doneSplash} />
      <div ref={scroller} className="mx-auto min-h-dvh w-full max-w-[560px] px-4 pb-[calc(88px+var(--safe-b))]">
        <Suspense fallback={<PlaneLoader label="Loading…" />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.main key={tab + (tab === 'more' ? sub ?? '' : '')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.16 }}>{page}</motion.main>
          </AnimatePresence>
        </Suspense>
      </div>
      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 border-t border-navy/10 bg-white/95 pb-[var(--safe-b)] backdrop-blur">
        <ul className="mx-auto flex max-w-[560px] justify-around px-2 pt-1.5">
          {TABS.map((t) => {
            const on = t.id === tab; const Icon = t.icon;
            return (
              <li key={t.id} className="flex-1">
                <a href={'#/' + t.id} aria-current={on ? 'page' : undefined} className={cx('relative flex min-h-[56px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[12px] font-bold', on ? 'text-navy' : 'text-muted')}>
                  {on && <motion.span layoutId="navpill" className="absolute inset-x-3 top-0.5 h-8 rounded-full bg-sky-soft" transition={{ type: 'spring', damping: 30, stiffness: 420 }} />}
                  <Icon size={22} className="relative" strokeWidth={on ? 2.6 : 2} /><span className="relative">{t.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </MotionConfig>
  );
}
const ConfettiBoundary = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default function App() {
  const [key, setKey] = useState<CryptoKey | null>(null);
  const hiddenAt = useRef<number | null>(null);
  const lock = useCallback(() => { setKey(null); try { sessionStorage.removeItem('hk26.splash'); } catch { /* */ } }, []);
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt.current = Date.now();
      else if (hiddenAt.current) {
        const mins = Number(localStorage.getItem('hk26.autolock') ?? '5');
        if ((Date.now() - hiddenAt.current) / 60000 >= mins) setKey(null);
        hiddenAt.current = null;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  if (!key) return <Lock onUnlock={setKey} />;
  return <StateProvider dataKey={key}><VaultProvider dataKey={key}><Shell onLock={lock} /></VaultProvider></StateProvider>;
}
