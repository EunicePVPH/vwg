// Free Open-Meteo forecast (no key). Only the coordinates of central Hong Kong are sent.
export interface Wx { date: string; hi: number; lo: number; rain: number; code: number }
const KEY = 'hk26.wx';
export const wxText = (c: number) =>
  c === 0 ? 'Clear' : c <= 2 ? 'Mostly sunny' : c === 3 ? 'Cloudy' : c < 50 ? 'Foggy' : c < 70 ? 'Rain' : c < 80 ? 'Showers' : c < 95 ? 'Showers' : 'Thunderstorms';
export const wxEmoji = (c: number) => (c === 0 ? '☀️' : c <= 2 ? '🌤️' : c === 3 ? '☁️' : c < 50 ? '🌫️' : c < 70 ? '🌧️' : c < 95 ? '🌦️' : '⛈️');

export function cachedWx(): { at: number; days: Wx[] } | null {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { return null; }
}
export async function fetchWx(): Promise<Wx[] | null> {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 7000);
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=22.32&longitude=114.17&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FHong_Kong&forecast_days=16';
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const j = await res.json();
    const d = j.daily;
    const days: Wx[] = d.time.map((date: string, i: number) => ({
      date, hi: Math.round(d.temperature_2m_max[i]), lo: Math.round(d.temperature_2m_min[i]),
      rain: d.precipitation_probability_max[i] ?? 0, code: d.weather_code[i],
    }));
    try { localStorage.setItem(KEY, JSON.stringify({ at: Date.now(), days })); } catch { /* ignore */ }
    return days;
  } catch { return null; }
}
