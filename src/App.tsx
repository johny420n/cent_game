import { useState, useEffect, useMemo } from 'react';
import type { Level } from './types';
import { useQuestions } from './hooks/useQuestions';
import { useGameState } from './hooks/useGameState';
import { useHighscores } from './hooks/useHighscores';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HighscoresScreen } from './components/HighscoresScreen';

type Screen = 'game' | 'highscores';

export default function App() {
  const { allQuestions, loading, error } = useQuestions();
  const { state, startGame, selectAnswer, lockInAll, nextQuestion, useFiftyFifty, useCallFriend, resetGame } =
    useGameState(allQuestions);
  const { highscores, addHighscore, isHighscore } = useHighscores();

  const [screen, setScreen] = useState<Screen>('game');
  const [playerCount, setPlayerCount] = useState<1 | 2 | 3>(1);
  const [questionCount, setQuestionCount] = useState<5 | 10 | 15 | 20>(15);
  const [playerNames, setPlayerNames] = useState<string[]>(['', '', '']);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(60);
  const [level, setLevel] = useState<Level>(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Unique category list, sorted, derived from the loaded questions.
  const allCategories = useMemo(
    () => Array.from(new Set(allQuestions.map(q => q.category))).sort(),
    [allQuestions],
  );

  // Default to all categories selected once questions have loaded.
  useEffect(() => {
    if (allCategories.length > 0) {
      setSelectedCategories(allCategories);
    }
  }, [allCategories]);

  const availableCount = useMemo(
    () => allQuestions.filter(q =>
      (q.level ?? 1) === level && selectedCategories.includes(q.category),
    ).length,
    [allQuestions, selectedCategories, level],
  );

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayerNames(prev => {
      const next = [...prev];
      next[index] = name;
      return next;
    });
  };

  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category],
    );
  };

  // Returning to the start screen always re-enables every category, so a new
  // game offers all question types regardless of earlier deselections.
  const returnToStart = () => {
    setSelectedCategories(allCategories);
    resetGame();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen__spinner" />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="loading-screen">
        <p>Error: {error}</p>
        <p>Make sure questions.json is in the public folder.</p>
      </div>
    );
  }

  if (screen === 'highscores') {
    return (
      <HighscoresScreen
        highscores={highscores}
        onBack={() => setScreen('game')}
      />
    );
  }

  if (state.phase === 'start') {
    return (
      <StartScreen
        playerCount={playerCount}
        questionCount={questionCount}
        playerNames={playerNames}
        level={level}
        allCategories={allCategories}
        selectedCategories={selectedCategories}
        timerSeconds={timerSeconds}
        availableCount={availableCount}
        onPlayerCountChange={setPlayerCount}
        onQuestionCountChange={setQuestionCount}
        onPlayerNameChange={handlePlayerNameChange}
        onLevelChange={setLevel}
        onToggleCategory={handleToggleCategory}
        onTimerChange={setTimerSeconds}
        onStart={(pc, qc, names) => {
          startGame(pc, qc, names, selectedCategories, timerSeconds, level);
        }}
        onHighscores={() => setScreen('highscores')}
      />
    );
  }

  if (state.phase === 'results') {
    return (
      <ResultsScreen
        state={state}
        isHighscore={isHighscore}
        onSaveHighscore={addHighscore}
        onPlayAgain={returnToStart}
        onHighscores={() => {
          returnToStart();
          setScreen('highscores');
        }}
      />
    );
  }

  // playing or reveal
  return (
    <GameScreen
      state={state}
      onSelectAnswer={selectAnswer}
      onLockInAll={lockInAll}
      onFiftyFifty={useFiftyFifty}
      onCallFriend={useCallFriend}
      onNextQuestion={nextQuestion}
      onQuit={returnToStart}
    />
  );
}
