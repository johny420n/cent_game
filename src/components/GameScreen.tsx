import { useState, useEffect, useRef } from 'react';
import type { GameState, PlayerIndex } from '../types';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerButton } from './AnswerButton';
import { PlayerPanel } from './PlayerPanel';
import { MoneyLadder } from './MoneyLadder';
import { getLadder, formatMoney } from '../data/moneyLadders';

interface GameScreenProps {
  state: GameState;
  onSelectAnswer: (playerIndex: PlayerIndex, answerIndex: number) => void;
  onLockInAll: () => void;
  onFiftyFifty: (playerIndex: PlayerIndex) => void;
  onCallFriend: (playerIndex: PlayerIndex) => void;
  onNextQuestion: () => void;
  onQuit: () => void;
}

export function GameScreen({
  state,
  onSelectAnswer,
  onLockInAll,
  onFiftyFifty,
  onCallFriend,
  onNextQuestion,
  onQuit,
}: GameScreenProps) {
  const question = state.questions[state.currentQuestionIndex];
  const isReveal = state.phase === 'reveal';
  const isLastQuestion = state.currentQuestionIndex >= state.questions.length - 1;

  // Single-player: a wrong answer (or timeout) ends the game at reveal.
  const singlePlayerOut = isReveal && state.playerCount === 1 &&
    state.players[0].selectedAnswer !== question.correctAnswer;
  const endsGame = isLastQuestion || singlePlayerOut;

  const timeLimit = state.timerSeconds;
  const isTimed = timeLimit !== null;

  // Timer - resets each question
  const [timeLeft, setTimeLeft] = useState(timeLimit ?? 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasAutoLockedRef = useRef(false);

  // Reset timer when question changes
  useEffect(() => {
    setTimeLeft(timeLimit ?? 0);
    hasAutoLockedRef.current = false;
  }, [state.currentQuestionIndex, timeLimit]);

  // Run countdown (skipped entirely when the timer is disabled)
  useEffect(() => {
    if (!isTimed || isReveal) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimed, isReveal, state.currentQuestionIndex]);

  // Auto lock-in when timer hits 0
  useEffect(() => {
    if (isTimed && timeLeft === 0 && !isReveal && !hasAutoLockedRef.current) {
      hasAutoLockedRef.current = true;
      onLockInAll();
    }
  }, [isTimed, timeLeft, isReveal, onLockInAll]);

  const timerPercent = isTimed ? (timeLeft / (timeLimit as number)) * 100 : 100;
  const timerUrgent = timeLeft <= 10;
  const timerWarning = timeLeft <= 30 && !timerUrgent;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="back-btn" onClick={onQuit}>Quit</button>
        <span className="game-header__question-num">
          Question {state.currentQuestionIndex + 1} of {state.questions.length}
        </span>
        <span className="game-header__question-num" style={{ textTransform: 'capitalize', color: 'var(--accent-gold)' }}>
          {question.difficulty}
        </span>
        <span className="game-header__money">
          {formatMoney(getLadder(state.questions.length)[state.currentQuestionIndex])}
        </span>
      </div>

      {/* Timer bar */}
      {isTimed && !isReveal && (
        <div className="timer-bar">
          <div
            className={`timer-bar__fill ${timerUrgent ? 'timer-bar__fill--urgent' : timerWarning ? 'timer-bar__fill--warning' : ''}`}
            style={{ width: `${timerPercent}%` }}
          />
          <span className={`timer-bar__text ${timerUrgent ? 'timer-bar__text--urgent' : ''}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      )}

      <div className="game-layout">
        <div className="game-main" style={{ flex: 1 }}>
          <QuestionDisplay question={question} />

          <div className="answers-grid">
            {question.answers.map((answer, i) => {
              const isCorrectAnswer = isReveal && i === question.correctAnswer;
              const isWrongPick = isReveal && i !== question.correctAnswer &&
                state.players.slice(0, state.playerCount).some(p => p.selectedAnswer === i);
              // In single-player the main grid is what the player clicks, so
              // reflect their 50:50 eliminations here too.
              const isEliminated = state.playerCount === 1 &&
                state.players[0].fiftyFiftyEliminated.includes(i);
              const isSelected = !isReveal && state.playerCount === 1 &&
                state.players[0].selectedAnswer === i;

              return (
                <AnswerButton
                  key={i}
                  index={i}
                  text={answer}
                  eliminated={isEliminated}
                  isCorrect={isCorrectAnswer}
                  isWrong={isWrongPick}
                  selected={isSelected}
                  disabled={isReveal}
                  onClick={() => {
                    if (state.playerCount === 1 && !isReveal) {
                      onSelectAnswer(0, i);
                    }
                  }}
                />
              );
            })}
          </div>

          {/* Shared Lock In / Next Question button */}
          <div className="shared-action">
            {isReveal ? (
              <>
                {singlePlayerOut && (
                  <p className="game-over-note">
                    {state.players[0].selectedAnswer === null
                      ? 'Time ran out — game over!'
                      : 'Wrong answer — game over!'}
                  </p>
                )}
                <button className="reveal-overlay__btn" onClick={onNextQuestion}>
                  {endsGame ? 'See Results' : 'Next Question'}
                </button>
              </>
            ) : (
              <button
                className="lock-in-btn lock-in-btn--shared"
                onClick={onLockInAll}
              >
                Lock In All Answers
              </button>
            )}
          </div>

          <div className="player-panels">
            {([0, 1, 2] as PlayerIndex[]).slice(0, state.playerCount).map(idx => (
              <PlayerPanel
                key={idx}
                playerIndex={idx}
                player={state.players[idx]}
                isReveal={isReveal}
                correctAnswer={question.correctAnswer}
                onSelect={(i) => onSelectAnswer(idx, i)}
                onFiftyFifty={() => onFiftyFifty(idx)}
                onCallFriend={() => onCallFriend(idx)}
              />
            ))}
          </div>
        </div>

        <div className="game-sidebar">
          <MoneyLadder
            length={state.questions.length}
            currentIndex={state.currentQuestionIndex}
            playerLabel="Prize Money"
          />
        </div>
      </div>
    </div>
  );
}
