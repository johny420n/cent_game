import { useState } from 'react';
import type { GameState, HighscoreEntry, PlayerIndex } from '../types';
import { winningsFor, formatMoney } from '../data/moneyLadders';

interface ResultsScreenProps {
  state: GameState;
  isHighscore: (score: number) => boolean;
  onSaveHighscore: (entry: HighscoreEntry) => void;
  onPlayAgain: () => void;
  onHighscores: () => void;
}

export function ResultsScreen({
  state,
  isHighscore,
  onSaveHighscore,
  onPlayAgain,
  onHighscores,
}: ResultsScreenProps) {
  const [saved, setSaved] = useState<boolean[]>([false, false, false]);

  const activePlayers = state.players.slice(0, state.playerCount);
  const maxScore = Math.max(...activePlayers.map(p => p.score));
  const isMultiplayer = state.playerCount > 1;
  const winnerCount = activePlayers.filter(p => p.score === maxScore).length;

  const handleSave = (playerIndex: PlayerIndex) => {
    const player = state.players[playerIndex];
    onSaveHighscore({
      name: player.name,
      score: player.score,
      date: new Date().toISOString().split('T')[0],
      questionsPlayed: state.questionCount,
    });
    setSaved(prev => {
      const next = [...prev];
      next[playerIndex] = true;
      return next;
    });
  };

  const renderCard = (playerIndex: PlayerIndex) => {
    const player = state.players[playerIndex];
    const isWinner = isMultiplayer && player.score === maxScore && winnerCount === 1;
    const isTie = isMultiplayer && player.score === maxScore && winnerCount > 1;
    const canSave = isHighscore(player.score) && !saved[playerIndex];

    return (
      <div key={playerIndex} className={`result-card ${isWinner ? 'result-card--winner' : ''}`}>
        <div className="result-card__name">{player.name}</div>
        <div className="result-card__score">{player.score} / {state.questions.length}</div>
        <div className="result-card__correct">
          correct answers
        </div>
        <div className="result-card__winnings">
          {formatMoney(winningsFor(state.questions.length, player.correctCount))}
        </div>
        {isWinner && <div className="result-card__badge">Winner!</div>}
        {isTie && <div className="result-card__badge">Tie!</div>}

        {canSave && (
          <div style={{ marginTop: '1rem' }}>
            <button
              className="lock-in-btn"
              onClick={() => handleSave(playerIndex)}
            >
              Save to Highscores
            </button>
          </div>
        )}
        {saved[playerIndex] && (
          <div style={{ marginTop: '0.5rem', color: 'var(--correct-green)', fontSize: '0.85rem' }}>
            Saved!
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="results-screen">
      <h1 className="results-screen__title">Game Over!</h1>

      <div className="results-cards">
        {([0, 1, 2] as PlayerIndex[]).slice(0, state.playerCount).map(idx => renderCard(idx))}
      </div>

      <div className="results-actions">
        <button className="start-btn" onClick={onPlayAgain}>
          Play Again
        </button>
        <button className="highscores-btn" onClick={onHighscores}>
          View Highscores
        </button>
      </div>
    </div>
  );
}
