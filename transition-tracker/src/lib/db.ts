/**
 * Tiny key-value store on IndexedDB with graceful fallbacks
 * (localStorage, then memory). No remote dependency. A future cloud-sync layer
 * can wrap kvGet/kvSet without touching the UI.
 */
export type StorageMode = 'indexeddb' | 'localstorage' | 'memory';

const DB_NAME = 'transition-tracker';
const STORE = 'kv';
let mode: StorageMode = 'indexeddb';
let dbp: Promise<IDBDatabase> | null = null;
const mem = new Map<string, string>();

export function storageMode(): StorageMode {
  return mode;
}

function openDb(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    try {
      if (typeof indexedDB === 'undefined') throw new Error('no indexedDB');
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
      req.onblocked = () => reject(new Error('blocked'));
    } catch (e) {
      reject(e);
    }
  });
  return dbp;
}

function lsOk(): boolean {
  try {
    const k = '__tt_probe__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

function degrade(): void {
  mode = lsOk() ? 'localstorage' : 'memory';
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  if (mode === 'indexeddb') {
    try {
      const db = await openDb();
      return await new Promise<T | undefined>((resolve, reject) => {
        const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        r.onsuccess = () => resolve(r.result as T | undefined);
        r.onerror = () => reject(r.error);
      });
    } catch {
      degrade();
    }
  }
  if (mode === 'localstorage') {
    try {
      const raw = localStorage.getItem('tt:' + key);
      return raw == null ? undefined : (JSON.parse(raw) as T);
    } catch {
      mode = 'memory';
    }
  }
  const raw = mem.get(key);
  return raw == null ? undefined : (JSON.parse(raw) as T);
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (mode === 'indexeddb') {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(value, key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      });
      return;
    } catch {
      degrade();
    }
  }
  if (mode === 'localstorage') {
    try {
      localStorage.setItem('tt:' + key, JSON.stringify(value));
      return;
    } catch {
      mode = 'memory';
    }
  }
  mem.set(key, JSON.stringify(value));
}

export async function kvDel(key: string): Promise<void> {
  if (mode === 'indexeddb') {
    try {
      const db = await openDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      return;
    } catch {
      degrade();
    }
  }
  try { localStorage.removeItem('tt:' + key); } catch { /* ignore */ }
  mem.delete(key);
}

/** Writes a probe value and reads it back. Proves this session can save, not long-term durability. */
export async function storageSelfCheck(): Promise<{ ok: boolean; mode: StorageMode }> {
  const probe = { t: Date.now() };
  try {
    await kvSet('__probe__', probe);
    const back = await kvGet<{ t: number }>('__probe__');
    await kvDel('__probe__');
    return { ok: back?.t === probe.t, mode };
  } catch {
    return { ok: false, mode };
  }
}

export async function requestPersistence(): Promise<boolean | null> {
  try {
    if (navigator.storage?.persist) return await navigator.storage.persist();
  } catch { /* ignore */ }
  return null;
}
