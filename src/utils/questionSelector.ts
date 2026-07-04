import type { Question } from '../types';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Difficulty distribution per game length
const distributions: Record<number, { easy: number; medium: number; hard: number }> = {
  5: { easy: 2, medium: 2, hard: 1 },
  10: { easy: 4, medium: 3, hard: 3 },
  15: { easy: 5, medium: 5, hard: 5 },
  20: { easy: 7, medium: 7, hard: 6 },
};

const DIFFICULTY_RANK = { easy: 0, medium: 1, hard: 2 } as const;

export function selectQuestions(
  allQuestions: Question[],
  count: 5 | 10 | 15 | 20,
  categories?: string[],
  level: 1 | 2 | 3 = 1,
): Question[] {
  const dist = distributions[count];

  // Filter by challenge level (missing level counts as 1) and chosen categories
  // (empty/undefined means "all").
  const pool = allQuestions.filter(q =>
    (q.level ?? 1) === level &&
    (!categories || categories.length === 0 || categories.includes(q.category)),
  );

  const easy = shuffle(pool.filter(q => q.difficulty === 'easy'));
  const medium = shuffle(pool.filter(q => q.difficulty === 'medium'));
  const hard = shuffle(pool.filter(q => q.difficulty === 'hard'));

  const selected: Question[] = [
    ...easy.slice(0, dist.easy),
    ...medium.slice(0, dist.medium),
    ...hard.slice(0, dist.hard),
  ];

  // If a difficulty tier ran short, top up from any remaining questions in the
  // pool so we still return `count` questions whenever the pool is large enough.
  if (selected.length < count) {
    const chosen = new Set(selected.map(q => q.id));
    const rest = shuffle(pool.filter(q => !chosen.has(q.id)));
    selected.push(...rest.slice(0, count - selected.length));
  }

  // Order easy -> medium -> hard (escalating difficulty); stable sort keeps the
  // random order within each tier.
  selected.sort((a, b) => DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty]);

  return selected.slice(0, count);
}
