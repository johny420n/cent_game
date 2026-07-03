// Prize ladders are expressed entirely in CENTS.
// Every ladder starts at 0.1¢ and ends at 1000¢.

const MIN_CENTS = 0.1;
const MAX_CENTS = 1000;

// Hand-tuned "nice" ladders for the standard game lengths.
const fixedLadders: Record<number, number[]> = {
  5: [0.1, 1, 10, 100, 1000],
  10: [0.1, 0.5, 1, 5, 10, 50, 100, 250, 500, 1000],
  15: [0.1, 0.2, 0.5, 1, 2, 5, 10, 25, 50, 100, 200, 350, 500, 750, 1000],
  20: [
    0.1, 0.2, 0.3, 0.5, 1,
    2, 3, 5, 10, 20,
    30, 50, 100, 200, 300,
    500, 700, 850, 900, 1000,
  ],
};

// Round to a readable 1 / 2 / 5 * 10^k value (used only for non-standard lengths).
function niceRound(v: number): number {
  const exp = Math.floor(Math.log10(v));
  const base = Math.pow(10, exp);
  const f = v / base; // 1..10
  const nice = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10;
  return Math.round(nice * base * 10) / 10;
}

// Returns a prize ladder of exactly `n` amounts in cents, from 0.1¢ up to 1000¢.
export function getLadder(n: number): number[] {
  if (n <= 1) return [MAX_CENTS];
  if (fixedLadders[n]) return fixedLadders[n];

  // Fallback: geometric progression rounded to nice values.
  const ratio = Math.pow(MAX_CENTS / MIN_CENTS, 1 / (n - 1));
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    if (i === 0) arr.push(MIN_CENTS);
    else if (i === n - 1) arr.push(MAX_CENTS);
    else arr.push(niceRound(MIN_CENTS * Math.pow(ratio, i)));
  }
  return arr;
}

// Safe-haven milestones: every 5th question (except the final one).
export function getMilestones(n: number): number[] {
  const ms: number[] = [];
  for (let i = 4; i < n - 1; i += 5) ms.push(i);
  return ms;
}

// The guaranteed amount a player keeps: the highest milestone already passed.
export function getGuaranteedAmount(n: number, currentIndex: number): number {
  const ladder = getLadder(n);
  const ms = getMilestones(n);
  let guaranteed = 0;
  for (const mi of ms) {
    if (currentIndex > mi) guaranteed = ladder[mi];
  }
  return guaranteed;
}

// The prize for reaching a given number of correct answers (0 -> nothing).
export function winningsFor(n: number, correctCount: number): number {
  if (correctCount <= 0) return 0;
  const ladder = getLadder(n);
  return ladder[Math.min(correctCount, ladder.length) - 1];
}

export function formatMoney(cents: number): string {
  return cents.toLocaleString(undefined, { maximumFractionDigits: 2 }) + '¢';
}
