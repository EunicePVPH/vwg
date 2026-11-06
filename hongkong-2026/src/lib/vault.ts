// Private document vault. Original bytes are stored untouched (never re-encoded),
// encrypted with the data key. A SHA-256 of the original is recorded at import and
// re-checked every time a file is opened, so you can see the copy is still identical.
import type { DocMeta, DocRecord } from '../types';
import { dbAll, dbDelete, dbPut, dbGet } from './db';
import { decryptBytes, decryptJson, encryptBytes, encryptJson, randomBytes, sha256Hex, b64 } from './crypto';

interface StoredDoc { iv: Uint8Array; data: ArrayBuffer; metaIv: Uint8Array; meta: ArrayBuffer }

export const FOLDERS = [
  '01 - Flights',
  '02 - Attraction Tickets',
  '03 - Hotel',
  '04 - Transportation',
  '05 - Insurance',
  '06 - Itinerary & Maps',
  '07 - Dashboard Backup',
] as const;

export const ACCEPTED = 'application/pdf,image/jpeg,image/png,image/webp,.pdf,.jpg,.jpeg,.png,.webp';

function guessMime(f: File): string {
  if (f.type) return f.type;
  const n = f.name.toLowerCase();
  if (n.endsWith('.pdf')) return 'application/pdf';
  if (n.endsWith('.png')) return 'image/png';
  if (n.endsWith('.webp')) return 'image/webp';
  return 'image/jpeg';
}

export async function listDocs(key: CryptoKey): Promise<DocRecord[]> {
  const rows = await dbAll<StoredDoc>('docs');
  const out: DocRecord[] = [];
  for (const r of rows) {
    try {
      const meta = await decryptJson<DocMeta>(key, r.value.metaIv, r.value.meta);
      out.push({ ...meta, id: r.key });
    } catch { /* skip unreadable */ }
  }
  return out.sort((a, b) => a.addedAt - b.addedAt);
}

export async function importFile(key: CryptoKey, file: File, extra: Partial<DocMeta> & { folder: string }): Promise<DocRecord> {
  const buf = await file.arrayBuffer(); // exact original bytes
  const sha256 = await sha256Hex(buf);
  const meta: DocMeta = {
    name: file.name, mime: guessMime(file), size: buf.byteLength, sha256, addedAt: Date.now(),
    ...extra,
  };
  const id = b64.to(randomBytes(9)).replace(/[+/=]/g, 'x');
  const body = await encryptBytes(key, buf);
  const m = await encryptJson(key, meta);
  const rec: StoredDoc = { iv: body.iv, data: body.data, metaIv: m.iv, meta: m.data };
  await dbPut('docs', id, rec);
  return { ...meta, id };
}

export async function updateMeta(key: CryptoKey, id: string, patch: Partial<DocMeta>): Promise<DocMeta> {
  const r = await dbGet<StoredDoc>('docs', id);
  if (!r) throw new Error('missing');
  const meta = { ...(await decryptJson<DocMeta>(key, r.metaIv, r.meta)), ...patch };
  const m = await encryptJson(key, meta);
  await dbPut('docs', id, { ...r, metaIv: m.iv, meta: m.data });
  return meta;
}

export async function readOriginal(key: CryptoKey, id: string): Promise<{ bytes: Uint8Array<ArrayBuffer>; meta: DocMeta; intact: boolean }> {
  const r = await dbGet<StoredDoc>('docs', id);
  if (!r) throw new Error('missing');
  const meta = await decryptJson<DocMeta>(key, r.metaIv, r.meta);
  const bytes = new Uint8Array(await decryptBytes(key, r.iv, r.data));
  const intact = (await sha256Hex(bytes)) === meta.sha256;
  return { bytes, meta, intact };
}

export async function removeDoc(id: string) { await dbDelete('docs', id); }

/** Raw encrypted rows, used by backup (decrypted there, re-encrypted on restore). */
export async function exportAll(key: CryptoKey) {
  const rows = await dbAll<StoredDoc>('docs');
  const out: { id: string; meta: DocMeta; bytes: Uint8Array<ArrayBuffer> }[] = [];
  for (const r of rows) {
    const meta = await decryptJson<DocMeta>(key, r.value.metaIv, r.value.meta);
    out.push({ id: r.key, meta, bytes: new Uint8Array(await decryptBytes(key, r.value.iv, r.value.data)) });
  }
  return out;
}

export async function restoreDoc(key: CryptoKey, id: string, meta: DocMeta, bytes: Uint8Array<ArrayBuffer>) {
  const body = await encryptBytes(key, bytes);
  const m = await encryptJson(key, meta);
  await dbPut('docs', id, { iv: body.iv, data: body.data, metaIv: m.iv, meta: m.data } satisfies StoredDoc);
}
