// PIN lock + encryption.
//
// Design (honest summary):
//  * A random 256-bit data key (DEK) encrypts every imported document (AES-GCM).
//  * The DEK is "wrapped" (encrypted) with a key derived from your 6-digit PIN
//    using PBKDF2-SHA256 (600,000 rounds) and a random salt.
//  * The PIN itself is never stored. A wrong PIN simply fails to unwrap the DEK.
//  * LIMIT: a 6-digit PIN has only 1,000,000 combinations. Someone who copies the
//    encrypted data off this phone could try them all offline. PBKDF2 makes that
//    slow, not impossible. Use a longer backup password for exported backups.
import { dbGet, dbPut } from './db';

const enc = new TextEncoder();
export const PBKDF2_ITERATIONS = 600_000;

export const b64 = {
  to(buf: ArrayBuffer | Uint8Array): string {
    const u = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = '';
    for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
    return btoa(s);
  },
  from(s: string): Uint8Array<ArrayBuffer> {
    const bin = atob(s);
    const u = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  },
};

export const randomBytes = (n: number): Uint8Array<ArrayBuffer> => crypto.getRandomValues(new Uint8Array(n));

export async function sha256Hex(data: ArrayBuffer | Uint8Array): Promise<string> {
  const h = await crypto.subtle.digest('SHA-256', data as BufferSource);
  return [...new Uint8Array(h)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function deriveKek(secret: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  );
}

interface LockRecord { v: 1; salt: string; iter: number; iv: string; wrapped: string }

export async function hasPin(): Promise<boolean> {
  return !!(await dbGet<LockRecord>('kv', 'lock'));
}

export async function createPin(pin: string): Promise<CryptoKey> {
  const dek = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']);
  await storeWrapped(pin, dek);
  return unlockWithPin(pin);
}

async function storeWrapped(pin: string, dek: CryptoKey) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const kek = await deriveKek(pin, salt, PBKDF2_ITERATIONS);
  const wrapped = await crypto.subtle.wrapKey('raw', dek, kek, { name: 'AES-GCM', iv });
  const rec: LockRecord = { v: 1, salt: b64.to(salt), iter: PBKDF2_ITERATIONS, iv: b64.to(iv), wrapped: b64.to(wrapped) };
  await dbPut('kv', 'lock', rec);
}

/** Throws if the PIN is wrong. Returns a non-extractable data key. */
export async function unlockWithPin(pin: string): Promise<CryptoKey> {
  const rec = await dbGet<LockRecord>('kv', 'lock');
  if (!rec) throw new Error('no-pin');
  const kek = await deriveKek(pin, b64.from(rec.salt), rec.iter);
  return crypto.subtle.unwrapKey(
    'raw', b64.from(rec.wrapped), kek, { name: 'AES-GCM', iv: b64.from(rec.iv) },
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
  );
}

/** Re-wrap the same data key under a new PIN (documents don't need re-encrypting). */
export async function changePin(oldPin: string, newPin: string): Promise<void> {
  const rec = await dbGet<LockRecord>('kv', 'lock');
  if (!rec) throw new Error('no-pin');
  const kek = await deriveKek(oldPin, b64.from(rec.salt), rec.iter);
  const dek = await crypto.subtle.unwrapKey(
    'raw', b64.from(rec.wrapped), kek, { name: 'AES-GCM', iv: b64.from(rec.iv) },
    { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'],
  );
  await storeWrapped(newPin, dek);
}

export async function encryptBytes(key: CryptoKey, data: ArrayBuffer | Uint8Array): Promise<{ iv: Uint8Array; data: ArrayBuffer }> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data as BufferSource);
  return { iv, data: ct };
}
export async function decryptBytes(key: CryptoKey, iv: Uint8Array, data: ArrayBuffer): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv as Uint8Array<ArrayBuffer> }, key, data);
}
export async function encryptJson(key: CryptoKey, obj: unknown) {
  return encryptBytes(key, enc.encode(JSON.stringify(obj)));
}
export async function decryptJson<T>(key: CryptoKey, iv: Uint8Array, data: ArrayBuffer): Promise<T> {
  return JSON.parse(new TextDecoder().decode(await decryptBytes(key, iv, data))) as T;
}

// ---- Backup encryption (password based, independent of the app PIN) ----
export async function encryptWithPassword(secret: string, plain: Uint8Array<ArrayBuffer>) {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveKek(secret, salt, PBKDF2_ITERATIONS);
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain);
  return { salt, iv, ct: new Uint8Array(ct), iter: PBKDF2_ITERATIONS };
}
export async function decryptWithPassword(secret: string, salt: Uint8Array<ArrayBuffer>, iv: Uint8Array<ArrayBuffer>, iter: number, ct: Uint8Array<ArrayBuffer>) {
  const key = await deriveKek(secret, salt, iter);
  return new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct));
}

// ---- Failed-attempt throttling (device-local; slows casual guessing only) ----
const FAIL_KEY = 'hk26.fail';
export function lockoutRemainingMs(): number {
  try {
    const r = JSON.parse(localStorage.getItem(FAIL_KEY) || '{}');
    return Math.max(0, (r.until || 0) - Date.now());
  } catch { return 0; }
}
export function recordFail() {
  try {
    const r = JSON.parse(localStorage.getItem(FAIL_KEY) || '{}');
    const count = (r.count || 0) + 1;
    const until = count >= 5 ? Date.now() + Math.min(15 * 60_000, 15_000 * 2 ** (count - 5)) : 0;
    localStorage.setItem(FAIL_KEY, JSON.stringify({ count, until }));
  } catch { /* ignore */ }
}
export function clearFails() { try { localStorage.removeItem(FAIL_KEY); } catch { /* ignore */ } }
