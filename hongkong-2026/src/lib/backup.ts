// Encrypted backup file: everything (trip edits + original documents) in one file.
// File layout: "HK26BK1\n" + JSON header line (salt/iv/iter) + "\n" + AES-GCM ciphertext.
// Plaintext (before encryption): [4-byte JSON length][JSON manifest][doc bytes...]
import { decryptWithPassword, encryptWithPassword, b64 } from './crypto';
import { exportAll, restoreDoc } from './vault';
import type { DocMeta } from '../types';

const MAGIC = 'HK26BK1\n';

export async function buildBackup(key: CryptoKey, state: unknown, password: string): Promise<Blob> {
  const docs = await exportAll(key);
  const manifest = {
    app: 'hk2026', v: 1, createdAt: Date.now(), state,
    docs: docs.map((d) => ({ id: d.id, meta: d.meta, length: d.bytes.byteLength })),
  };
  const mj = new TextEncoder().encode(JSON.stringify(manifest));
  const total = 4 + mj.length + docs.reduce((n, d) => n + d.bytes.byteLength, 0);
  const plain = new Uint8Array(total);
  new DataView(plain.buffer).setUint32(0, mj.length);
  plain.set(mj, 4);
  let o = 4 + mj.length;
  for (const d of docs) { plain.set(d.bytes, o); o += d.bytes.byteLength; }
  const { salt, iv, ct, iter } = await encryptWithPassword(password, plain);
  const header = JSON.stringify({ salt: b64.to(salt), iv: b64.to(iv), iter });
  return new Blob([MAGIC, header, '\n', ct], { type: 'application/octet-stream' });
}

export interface RestoredBackup { state: unknown; docCount: number }

export async function restoreBackup(file: File, password: string, key: CryptoKey): Promise<RestoredBackup> {
  const all = new Uint8Array(await file.arrayBuffer());
  const magic = new TextDecoder().decode(all.subarray(0, MAGIC.length));
  if (magic !== MAGIC) throw new Error('This is not a Hong Kong 2026 backup file.');
  let nl = MAGIC.length;
  while (nl < all.length && all[nl] !== 10) nl++;
  const header = JSON.parse(new TextDecoder().decode(all.subarray(MAGIC.length, nl)));
  const ct = all.slice(nl + 1);
  let plain: Uint8Array<ArrayBuffer>;
  try {
    plain = await decryptWithPassword(password, b64.from(header.salt), b64.from(header.iv), header.iter, ct);
  } catch {
    throw new Error('Wrong backup password, or the file is damaged.');
  }
  const jl = new DataView(plain.buffer, plain.byteOffset).getUint32(0);
  const manifest = JSON.parse(new TextDecoder().decode(plain.subarray(4, 4 + jl)));
  let o = 4 + jl;
  for (const d of manifest.docs as { id: string; meta: DocMeta; length: number }[]) {
    await restoreDoc(key, d.id, d.meta, plain.slice(o, o + d.length));
    o += d.length;
  }
  return { state: manifest.state, docCount: manifest.docs.length };
}
