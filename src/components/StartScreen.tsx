import type { Level } from '../types';

interface StartScreenProps {
  onStart: (playerCount: 1 | 2 | 3, questionCount: 5 | 10 | 15 | 20, names: string[]) => void;
  onHighscores: () => void;
  playerCount: 1 | 2 | 3;
  questionCount: 5 | 10 | 15 | 20;
  playerNames: string[];
  level: Level;
  allCategories: string[];
  selectedCategories: string[];
  timerSeconds: number | null;
  availableCount: number;
  onPlayerCountChange: (count: 1 | 2 | 3) => void;
  onQuestionCountChange: (count: 5 | 10 | 15 | 20) => void;
  onPlayerNameChange: (index: number, name: string) => void;
  onLevelChange: (level: Level) => void;
  onToggleCategory: (category: string) => void;
  onTimerChange: (seconds: number | null) => void;
}

const TIMER_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Off', value: null },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
  { label: '120s', value: 120 },
];

const LEVEL_OPTIONS: { label: string; value: Level }[] = [
  { label: 'Ages 6–8', value: 1 },
  { label: 'Ages 9–11', value: 2 },
  { label: 'Ages 12+', value: 3 },
];

export function StartScreen({
  onStart,
  onHighscores,
  playerCount,
  questionCount,
  playerNames,
  level,
  allCategories,
  selectedCategories,
  timerSeconds,
  availableCount,
  onPlayerCountChange,
  onQuestionCountChange,
  onPlayerNameChange,
  onLevelChange,
  onToggleCategory,
  onTimerChange,
}: StartScreenProps) {
  const noCategories = selectedCategories.length === 0;
  const notEnough = availableCount < questionCount;
  const canStart = !noCategories && !notEnough;

  return (
    <div className="start-screen">
      <h1 className="start-screen__title">Who Wants to Be a Millionaire?</h1>
      <p className="start-screen__subtitle">Test Your Knowledge</p>

      <div className="start-screen__options">
        <div className="option-group">
          <span className="option-group__label">Difficulty</span>
          <div className="option-group__buttons">
            {LEVEL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                className={`option-btn ${level === opt.value ? 'option-btn--selected' : ''}`}
                onClick={() => onLevelChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-group__label">Players</span>
          <div className="option-group__buttons">
            {([1, 2, 3] as const).map(n => (
              <button
                key={n}
                className={`option-btn ${playerCount === n ? 'option-btn--selected' : ''}`}
                onClick={() => onPlayerCountChange(n)}
              >
                {n} Player{n > 1 ? 's' : ''}
              </button>
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-group__label">Player Names</span>
          <div className="player-names">
            {Array.from({ length: playerCount }).map((_, i) => (
              <input
                key={i}
                type="text"
                className="player-name-input"
                placeholder={`Player ${i + 1}`}
                value={playerNames[i]}
                onChange={(e) => onPlayerNameChange(i, e.target.value)}
              />
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-group__label">Questions</span>
          <div className="option-group__buttons">
            {([5, 10, 15, 20] as const).map(n => (
              <button
                key={n}
                className={`option-btn ${questionCount === n ? 'option-btn--selected' : ''}`}
                onClick={() => onQuestionCountChange(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-group__label">Timer per Question</span>
          <div className="option-group__buttons">
            {TIMER_OPTIONS.map(opt => (
              <button
                key={opt.label}
                className={`option-btn ${timerSeconds === opt.value ? 'option-btn--selected' : ''}`}
                onClick={() => onTimerChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="option-group">
          <span className="option-group__label">Categories</span>
          <div className="option-group__buttons option-group__buttons--wrap">
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`option-btn option-btn--chip ${selectedCategories.includes(cat) ? 'option-btn--selected' : ''}`}
                onClick={() => onToggleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          {noCategories && (
            <span className="option-group__note option-group__note--warn">
              Pick at least one category to play.
            </span>
          )}
          {!noCategories && notEnough && (
            <span className="option-group__note option-group__note--warn">
              Only {availableCount} question{availableCount === 1 ? '' : 's'} in your selection —
              choose more categories or fewer questions.
            </span>
          )}
        </div>

        <button
          className="start-btn"
          disabled={!canStart}
          onClick={() => canStart && onStart(playerCount, questionCount, playerNames)}
        >
          Start Game
        </button>

        <button className="highscores-btn" onClick={onHighscores}>
          View Highscores
        </button>
      </div>
    </div>
  );
}
