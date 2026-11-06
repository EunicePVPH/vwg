import type { Currency } from '../types';

export interface Rates { hkdToPhp: number; usdToHkd: number; fetchedAt?: number; manual?: boolean }
export const DEFAULT_RATES: Rates = { hkdToPhp: 7.4, usdToHkd: 7.8 };

const usdRate = (r: Rates) => (r.usdToHkd > 7 && r.usdToHkd < 8.5 ? r.usdToHkd : 7.8);
export function toHKD(amount: number, c: Currency, r: Rates): number {
  return c === 'HKD' ? amount : c === 'USD' ? amount * usdRate(r) : amount / r.hkdToPhp;
}
/** Old US$ amounts are shown in pesos so you only ever watch two currencies. */
export const usdToPhp = (usd: number, r: Rates) => usd * usdRate(r) * r.hkdToPhp;
export const hkdToPhp = (hkd: number, r: Rates) => hkd * r.hkdToPhp;
export const fmtHKD = (n: number) => 'HK$' + Math.round(n).toLocaleString('en-US');
export const fmtPHP = (n: number) => '₱' + Math.round(n).toLocaleString('en-US');
export const fmtPHP2 = (n: number) => '₱' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtUSD = (n: number) => 'US$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function fmtBoth(hkd: number, r: Rates) { return `${fmtHKD(hkd)} · ${fmtPHP(hkdToPhp(hkd, r))}`; }
export function fmtNative(a: number, c: Currency, r: Rates = DEFAULT_RATES) { return c === 'HKD' ? (Number.isInteger(a) ? fmtHKD(a) : 'HK$' + a.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : c === 'PHP' ? fmtPHP2(a) : fmtPHP2(usdToPhp(a, r)); }

export async function fetchRates(): Promise<Rates | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 6000);
    const res = await fetch('https://open.er-api.com/v6/latest/HKD', { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = await res.json();
    const php = j?.rates?.PHP, usd = j?.rates?.USD;
    if (!php || !usd) return null;
    return { hkdToPhp: php, usdToHkd: 1 / usd, fetchedAt: Date.now() };
  } catch { return null; }
}
