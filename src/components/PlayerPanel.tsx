import type { PlayerState, PlayerIndex } from '../types';

const LETTERS = ['A', 'B', 'C', 'D'];

interface PlayerPanelProps {
  playerIndex: PlayerIndex;
  player: PlayerState;
  isReveal: boolean;
  correctAnswer: number;
  onSelect: (answerIndex: number) => void;
  onFiftyFifty: () => void;
  onCallFriend: () => void;
}

export function PlayerPanel({
  playerIndex,
  player,
  isReveal,
  correctAnswer,
  onSelect,
  onFiftyFifty,
  onCallFriend,
}: PlayerPanelProps) {
  const isCorrect = isReveal && player.selectedAnswer === correctAnswer;
  const isWrong = isReveal && player.selectedAnswer !== correctAnswer;

  return (
    <div className={`player-panel player-panel--p${playerIndex + 1}`}>
      <div className="player-panel__header">
        <span className="player-panel__name">{player.name}</span>
        <span className="player-panel__score">{player.score} pts</span>
      </div>

      <div className="player-panel__selection">
        {[0, 1, 2, 3].map(i => {
          const isEliminated = player.fiftyFiftyEliminated.includes(i);
          const isSelected = player.selectedAnswer === i;
          const classes = [
            'selection-chip',
            isSelected && !isReveal && 'selection-chip--selected',
            isSelected && isReveal && isCorrect && 'selection-chip--correct',
            isSelected && isReveal && isWrong && 'selection-chip--wrong',
            isEliminated && 'selection-chip--eliminated',
            isReveal && 'selection-chip--disabled',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <button
              key={i}
              className={classes}
              onClick={() => onSelect(i)}
              disabled={isEliminated || isReveal}
            >
              {LETTERS[i]}
            </button>
          );
        })}
        {isReveal && (
          <span className={`player-panel__result ${isCorrect ? 'player-panel__result--correct' : 'player-panel__result--wrong'}`}>
            {player.selectedAnswer === null ? 'No answer' : isCorrect ? 'Correct!' : 'Wrong'}
          </span>
        )}
      </div>

      <div className="player-panel__actions">
        <button
          className="fifty-btn"
          onClick={onFiftyFifty}
          disabled={player.usedFiftyFifty || isReveal}
        >
          50:50
        </button>
        <button
          className="call-friend-btn"
          onClick={onCallFriend}
          disabled={player.usedCallFriend || isReveal}
          title="Call a Friend"
        >
          {player.usedCallFriend ? '📞' : '📱'}
        </button>
      </div>

      {player.callFriendSuggestion !== null && (
        <div className="call-friend-hint">
          📞 Your friend thinks it's <strong>{LETTERS[player.callFriendSuggestion]}</strong>
        </div>
      )}
    </div>
  );
}
