// Overall challenge tier, independent of the per-question easy/medium/hard used
// for in-game escalation. 1 = easiest (default for existing questions).
export type Level = 1 | 2 | 3;

export interface Question {
  id: number;
  question: string;
  answers: [string, string, string, string];
  correctAnswer: number; // 0-3 index
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  explanation?: string; // shown on reveal for both correct and wrong answers
  level?: Level; // challenge tier; missing = 1
}

export type PlayerIndex = 0 | 1 | 2;

export interface PlayerState {
  name: string;
  selectedAnswer: number | null;
  lockedIn: boolean;
  score: number;
  usedFiftyFifty: boolean;
  usedCallFriend: boolean;
  fiftyFiftyEliminated: number[]; // per-player eliminated answers
  friendHintActive: boolean; // whether "phone a friend" is revealing the explainer this question
  correctCount: number;
}

export type GamePhase = 'start' | 'playing' | 'reveal' | 'results';

export interface GameState {
  phase: GamePhase;
  playerCount: 1 | 2 | 3;
  questionCount: 5 | 10 | 15 | 20;
  level: Level; // challenge tier chosen for this game
  categories: string[]; // categories chosen for this game
  timerSeconds: number | null; // per-question limit, or null when disabled
  currentQuestionIndex: number;
  questions: Question[];
  players: [PlayerState, PlayerState, PlayerState];
}

export interface HighscoreEntry {
  name: string;
  score: number;
  date: string;
  questionsPlayed: number;
}
