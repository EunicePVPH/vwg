import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DocMeta, DocRecord } from '../types';
import { importFile, listDocs, removeDoc, updateMeta } from '../lib/vault';

interface VaultCtx {
  docs: DocRecord[];
  ready: boolean;
  key: CryptoKey;
  add: (files: File[], extra: Partial<DocMeta> & { folder: string }) => Promise<DocRecord[]>;
  patch: (id: string, p: Partial<DocMeta>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}
const C = createContext<VaultCtx | null>(null);
export const useVault = () => { const c = useContext(C); if (!c) throw new Error('vault'); return c; };

export function VaultProvider({ dataKey, children }: { dataKey: CryptoKey; children: ReactNode }) {
  const [docs, setDocs] = useState<DocRecord[]>([]);
  const [ready, setReady] = useState(false);
  const refresh = useCallback(async () => { setDocs(await listDocs(dataKey)); setReady(true); }, [dataKey]);
  useEffect(() => { void refresh(); }, [refresh]);
  const value = useMemo<VaultCtx>(() => ({
    docs, ready, key: dataKey, refresh,
    add: async (files, extra) => {
      const out: DocRecord[] = [];
      for (const f of files) out.push(await importFile(dataKey, f, extra));
      await refresh();
      try { await navigator.storage?.persist?.(); } catch { /* ignore */ }
      return out;
    },
    patch: async (id, p) => { await updateMeta(dataKey, id, p); await refresh(); },
    remove: async (id) => { await removeDoc(id); await refresh(); },
  }), [docs, ready, dataKey, refresh]);
  return <C.Provider value={value}>{children}</C.Provider>;
}
