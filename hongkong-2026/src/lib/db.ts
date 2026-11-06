// Minimal promise wrapper around IndexedDB. Everything stays on this device.
const DB_NAME = 'hk2026';
const DB_VERSION = 1;
export type StoreName = 'kv' | 'docs' | 'photos';

let dbp: Promise<IDBDatabase> | null = null;
function open(): Promise<IDBDatabase> {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of ['kv', 'docs', 'photos'] as StoreName[]) if (!db.objectStoreNames.contains(s)) db.createObjectStore(s);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}
function tx<T>(store: StoreName, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode);
        const r = fn(t.objectStore(store));
        t.oncomplete = () => resolve(r.result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  );
}
export const dbGet = <T = unknown>(store: StoreName, key: string) => tx<T | undefined>(store, 'readonly', (s) => s.get(key) as IDBRequest<T | undefined>);
export const dbPut = (store: StoreName, key: string, value: unknown) => tx(store, 'readwrite', (s) => s.put(value, key));
export const dbDelete = (store: StoreName, key: string) => tx(store, 'readwrite', (s) => s.delete(key));
export const dbKeys = (store: StoreName) => tx<IDBValidKey[]>(store, 'readonly', (s) => s.getAllKeys());
export const dbClear = (store: StoreName) => tx(store, 'readwrite', (s) => s.clear());
export async function dbAll<T = unknown>(store: StoreName): Promise<{ key: string; value: T }[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const out: { key: string; value: T }[] = [];
    const t = db.transaction(store, 'readonly');
    const req = t.objectStore(store).openCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (c) { out.push({ key: String(c.key), value: c.value as T }); c.continue(); }
    };
    t.oncomplete = () => resolve(out);
    t.onerror = () => reject(t.error);
  });
}
