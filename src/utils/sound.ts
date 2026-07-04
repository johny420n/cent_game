// Tiny Web Audio sound effects — synthesized at runtime so nothing needs to be
// downloaded and everything works fully offline.

const MUTE_KEY = 'cent-muted';

let ctx: AudioContext | null = null;
let muted = false;
try {
  muted = localStorage.getItem(MUTE_KEY) === '1';
} catch {
  /* localStorage unavailable — default to unmuted */
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  // Browsers start the context suspended until a user gesture; resume on use.
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note { freq: number; start: number; dur: number; type?: OscillatorType; gain?: number }

function play(notes: Note[]) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime;
  for (const n of notes) {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = n.freq;
    const peak = n.gain ?? 0.14;
    const s = t0 + n.start;
    // Short attack/decay envelope to avoid clicks.
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(peak, s + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, s + n.dur);
    osc.connect(g).connect(ac.destination);
    osc.start(s);
    osc.stop(s + n.dur + 0.02);
  }
}

export const playSelect = () => play([{ freq: 660, start: 0, dur: 0.08, type: 'triangle', gain: 0.1 }]);

export const playLockIn = () => play([
  { freq: 440, start: 0, dur: 0.1, type: 'square', gain: 0.09 },
  { freq: 620, start: 0.09, dur: 0.12, type: 'square', gain: 0.09 },
]);

export const playCorrect = () => play([
  { freq: 523.25, start: 0, dur: 0.14, type: 'triangle' },   // C5
  { freq: 659.25, start: 0.11, dur: 0.14, type: 'triangle' }, // E5
  { freq: 783.99, start: 0.22, dur: 0.24, type: 'triangle' }, // G5
]);

export const playWrong = () => play([
  { freq: 220, start: 0, dur: 0.18, type: 'sawtooth', gain: 0.12 },
  { freq: 150, start: 0.16, dur: 0.32, type: 'sawtooth', gain: 0.12 },
]);

export const isMuted = () => muted;

export function setMuted(value: boolean): boolean {
  muted = value;
  try {
    localStorage.setItem(MUTE_KEY, value ? '1' : '0');
  } catch {
    /* ignore persistence failure */
  }
  return muted;
}

export const toggleMuted = () => setMuted(!muted);
