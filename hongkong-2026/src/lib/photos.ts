import { dbDelete, dbGet, dbPut } from './db';
export const PHOTO_KEYS: { key: string; label: string }[] = [
  { key: 'airport', label: 'Journey / airport' }, { key: 'peak', label: 'The Peak' }, { key: 'oceanpark', label: 'Ocean Park' },
  { key: 'wheel', label: 'Observation Wheel' }, { key: 'science', label: 'Science Museum' }, { key: 'disney', label: 'Disneyland' },
  { key: 'harbour', label: 'Victoria Harbour' }, { key: 'hotel', label: 'Rambler Oasis Hotel' },
];
export interface Credit { author?: string; license?: string; source?: string; title?: string }
let creditsP: Promise<Record<string, Credit>> | null = null;
export function loadCredits(): Promise<Record<string, Credit>> {
  creditsP ??= fetch('/photos/credits.json').then((r) => (r.ok ? r.json() : {})).catch(() => ({}));
  return creditsP;
}
export const getCustomPhoto = (k: string) => dbGet<Blob>('photos', 'photo:' + k);
export const setCustomPhoto = (k: string, b: Blob) => dbPut('photos', 'photo:' + k, b);
export const clearCustomPhoto = (k: string) => dbDelete('photos', 'photo:' + k);
