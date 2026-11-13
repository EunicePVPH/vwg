/** Gentle optional cues made with the Web Audio API (no audio files to cache). User-initiated only. */
let ctx: AudioContext | null = null;

export function unlockAudio(): void {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!ctx) ctx = new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { /* audio is optional */ }
}

function tone(freq: number, start: number, dur: number, vol: number): void {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = 'sine';
  o.frequency.value = freq;
  const t0 = ctx.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * 0.25), t0 + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/** kind: 'warn' = one soft tone, 'end' = soft two-note chime, 'ready' = bright rising chime */
export function playCue(kind: 'warn' | 'end' | 'ready', volume: number): void {
  try {
    unlockAudio();
    if (!ctx || ctx.state !== 'running') return;
    if (kind === 'warn') tone(660, 0, 0.7, volume);
    if (kind === 'end') { tone(523.25, 0, 0.8, volume); tone(659.25, 0.25, 1.0, volume); }
    if (kind === 'ready') { tone(523.25, 0, 0.5, volume); tone(659.25, 0.15, 0.5, volume); tone(783.99, 0.3, 0.9, volume); }
  } catch { /* ignore */ }
}
