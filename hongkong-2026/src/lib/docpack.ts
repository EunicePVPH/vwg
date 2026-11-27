// Encrypted booking-document pack. A pack is ONE file, encrypted with a password that is not stored in the app. Importing it
// copies the original files into the private vault (encrypted again with your PIN key) and links each one to its booking.
// Files that are already in the vault (same SHA-256) are never duplicated: their links are merged instead.
import type { DocMeta, DocRecord } from '../types';
import { b64, decryptWithPassword, sha256Hex } from './crypto';
import { docFlightIds, docSlots, importFile, updateMeta } from './vault';

export interface PackItem { name: string; mime: string; folder: string; ticketId?: string; flightIds?: string[]; slots?: string[]; note?: string; data: string }
export interface PackFile { app: 'hk26-docpack'; v: 1; iter: number; salt: string; iv: string; ct: string }
export interface PackResult { added: number; merged: number; same: number; names: string[] }

export async function importDocPack(key: CryptoKey, file: File, password: string, existing: DocRecord[]): Promise<PackResult> {
  let head: PackFile;
  try { head = JSON.parse(await file.text()) as PackFile; } catch { throw new Error('This is not a booking pack file.'); }
  if (head.app !== 'hk26-docpack' || head.v !== 1) throw new Error('This is not a booking pack file.');
  let plain: Uint8Array;
  try { plain = await decryptWithPassword(password.trim(), b64.from(head.salt), b64.from(head.iv), head.iter, b64.from(head.ct)); }
  catch { throw new Error('Wrong pack password. Check it and try again.'); }
  const items = (JSON.parse(new TextDecoder().decode(plain)) as { items: PackItem[] }).items;
  const have = [...existing];
  const res: PackResult = { added: 0, merged: 0, same: 0, names: [] };
  for (const it of items) {
    const bytes = b64.from(it.data);
    const sha = await sha256Hex(bytes);
    const twin = have.find((d) => d.sha256 === sha);
    const links: Partial<DocMeta> = { ticketId: it.ticketId, flightIds: it.flightIds, slots: it.slots, note: it.note };
    if (twin) {
      // same original already stored: only add the missing links, never a second copy
      const fl = [...new Set([...docFlightIds(twin), ...(it.flightIds ?? [])])]; const sl = [...new Set([...docSlots(twin), ...(it.slots ?? [])])];
      const patch: Partial<DocMeta> = {};
      if (it.ticketId && twin.ticketId !== it.ticketId) patch.ticketId = it.ticketId;
      if (fl.length !== docFlightIds(twin).length) patch.flightIds = fl;
      if (sl.length !== docSlots(twin).length) patch.slots = sl;
      if (it.note && !twin.note) patch.note = it.note;
      if (Object.keys(patch).length) { await updateMeta(key, twin.id, patch); res.merged++; } else res.same++;
      continue;
    }
    const f = new File([bytes as BlobPart], it.name, { type: it.mime });
    const rec = await importFile(key, f, { folder: it.folder, ...Object.fromEntries(Object.entries(links).filter(([, v]) => v !== undefined)) });
    have.push(rec); res.added++; res.names.push(it.name);
  }
  return res;
}
