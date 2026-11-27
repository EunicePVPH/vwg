import { useMemo } from 'react';
import { useAppState, useCollection } from './store';
import { ACTIVITIES, DAYS, TICKETS } from '../data/seed';
import { DEFAULT_REMIND, buildReminders, type RemindState, type Reminder } from '../lib/reminders';
import type { Activity, Ticket } from '../types';

export function useRemind() {
  const { state, setState } = useAppState();
  const acts = useCollection<Activity>('activities', ACTIVITIES).items;
  const tickets = useCollection<Ticket>('tickets', TICKETS).items;
  const st: RemindState = { ...DEFAULT_REMIND, ...state.remind, types: { ...DEFAULT_REMIND.types, ...state.remind?.types } };
  const all: Reminder[] = useMemo(() => buildReminders(acts, DAYS, tickets, st), [acts, tickets, st.offsets.join(','), JSON.stringify(st.types)]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = (p: Partial<RemindState>) => setState((s) => ({ ...s, remind: { ...DEFAULT_REMIND, ...s.remind, ...p, types: { ...DEFAULT_REMIND.types, ...s.remind?.types, ...(p.types ?? {}) } } }));
  const snooze = (id: string, mins = 15) => set({ snoozed: { ...st.snoozed, [id]: Date.now() + mins * 60000 } });
  const dismiss = (id: string) => set({ dismissed: { ...st.dismissed, [id]: true } });
  return { st, all, set, snooze, dismiss };
}

export async function showNotification(title: string, body: string, tag: string) {
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg) { await reg.showNotification(title, { body, tag, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' }); return true; }
  } catch { /* fall through */ }
  try { new Notification(title, { body, tag }); return true; } catch { return false; }
}
