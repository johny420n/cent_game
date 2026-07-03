import { useState, useCallback } from 'react';
import type { HighscoreEntry } from '../types';

const STORAGE_KEY = 'millionaire-highscores';
const MAX_ENTRIES = 10;

function loadHighscores(): HighscoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HighscoreEntry[];
  } catch {
    return [];
  }
}

function saveHighscores(entries: HighscoreEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHighscores() {
  const [highscores, setHighscores] = useState<HighscoreEntry[]>(loadHighscores);

  const addHighscore = useCallback((entry: HighscoreEntry) => {
    setHighscores(prev => {
      const updated = [...prev, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      saveHighscores(updated);
      return updated;
    });
  }, []);

  const isHighscore = useCallback((score: number) => {
    if (highscores.length < MAX_ENTRIES) return true;
    return score > highscores[highscores.length - 1].score;
  }, [highscores]);

  return { highscores, addHighscore, isHighscore };
}
