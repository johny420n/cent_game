// Web Audio sound effects — synthesized at runtime so nothing needs to be
// downloaded and everything works fully offline. Tones are routed through a
// gentle low-pass filter and softened envelopes so they sound warm, not harsh.

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
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

interface Note {
  freq: number;
  start: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  rich?: boolean; // layer a quiet octave above for a fuller tone
}

function play(notes: Note[], cutoff = 3600) {
  if (muted) return;
  const ac = getCtx();
  if (!ac) return;

  // Shared low-pass + master gain to keep everything smooth and balanced.
  const filter = ac.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = cutoff;
  const master = ac.createGain();
  master.gain.value = 0.9;
  filter.connect(master).connect(ac.destination);

  const t0 = ac.currentTime;
  const voice = (freq: number, n: Note, peak: number) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = n.type ?? 'sine';
    osc.frequency.value = freq;
    const s = t0 + n.start;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.exponentialRampToValueAtTime(peak, s + 0.012); // soft attack
    g.gain.exponentialRampToValueAtTime(0.0001, s + n.dur);
    osc.connect(g).connect(filter);
    osc.start(s);
    osc.stop(s + n.dur + 0.03);
  };

  for (const n of notes) {
    const peak = n.gain ?? 0.13;
    voice(n.freq, n, peak);
    if (n.rich) voice(n.freq * 2, n, peak * 0.35); // quiet octave sparkle
  }
}

// --- In-game effects ------------------------------------------------------

export const playSelect = () => play([
  { freq: 520, start: 0, dur: 0.06, type: 'sine', gain: 0.09 },
  { freq: 780, start: 0.02, dur: 0.07, type: 'sine', gain: 0.06 },
]);

export const playLockIn = () => play([
  { freq: 392, start: 0, dur: 0.12, type: 'triangle', gain: 0.11 },   // G4
  { freq: 523.25, start: 0.1, dur: 0.16, type: 'triangle', gain: 0.11, rich: true }, // C5
]);

export const playCorrect = () => play([
  { freq: 523.25, start: 0, dur: 0.16, type: 'triangle', rich: true },    // C5
  { freq: 659.25, start: 0.12, dur: 0.16, type: 'triangle', rich: true }, // E5
  { freq: 783.99, start: 0.24, dur: 0.34, type: 'triangle', rich: true }, // G5
]);

export const playWrong = () => play([
  { freq: 311.13, start: 0, dur: 0.22, type: 'sawtooth', gain: 0.1 },   // Eb4
  { freq: 233.08, start: 0.2, dur: 0.24, type: 'sawtooth', gain: 0.1 }, // Bb3
  { freq: 174.61, start: 0.4, dur: 0.4, type: 'sawtooth', gain: 0.1 },  // F3
], 1600);

// A short tick used in the final seconds of the timer.
export const playTick = () => play([
  { freq: 1040, start: 0, dur: 0.035, type: 'square', gain: 0.05 },
], 5000);

// Little sparkle when a lifeline is used.
export const playLifeline = () => play([
  { freq: 659.25, start: 0, dur: 0.08, type: 'triangle', gain: 0.08 },
  { freq: 987.77, start: 0.06, dur: 0.1, type: 'triangle', gain: 0.08, rich: true },
]);

// --- Results effects ------------------------------------------------------

// Triumphant fanfare for finishing strong / hitting the top prize.
export const playFanfare = () => play([
  { freq: 392, start: 0, dur: 0.16, type: 'triangle', gain: 0.12, rich: true },      // G4
  { freq: 523.25, start: 0.14, dur: 0.16, type: 'triangle', gain: 0.12, rich: true }, // C5
  { freq: 659.25, start: 0.28, dur: 0.16, type: 'triangle', gain: 0.12, rich: true }, // E5
  { freq: 783.99, start: 0.42, dur: 0.5, type: 'triangle', gain: 0.13, rich: true },  // G5 (held)
  { freq: 1046.5, start: 0.42, dur: 0.5, type: 'triangle', gain: 0.07, rich: true },  // C6 sparkle
]);

// A gentler positive jingle for a decent-but-not-top result.
export const playWin = () => play([
  { freq: 523.25, start: 0, dur: 0.14, type: 'triangle', gain: 0.11, rich: true },
  { freq: 783.99, start: 0.12, dur: 0.28, type: 'triangle', gain: 0.11, rich: true },
]);

// Soft descending "aww" for a low / early-loss result.
export const playGameOver = () => play([
  { freq: 392, start: 0, dur: 0.2, type: 'triangle', gain: 0.1 },      // G4
  { freq: 329.63, start: 0.18, dur: 0.22, type: 'triangle', gain: 0.1 }, // E4
  { freq: 261.63, start: 0.38, dur: 0.44, type: 'triangle', gain: 0.1 }, // C4
], 2200);

// --- Mute control ---------------------------------------------------------

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
