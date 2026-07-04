import { useState, useCallback } from 'react';
import type { GameState, PlayerState, PlayerIndex, Question } from '../types';
import { selectQuestions } from '../utils/questionSelector';

function createPlayer(name: string): PlayerState {
  return {
    name,
    selectedAnswer: null,
    lockedIn: false,
    score: 0,
    usedFiftyFifty: false,
    usedCallFriend: false,
    fiftyFiftyEliminated: [],
    friendHintActive: false,
    correctCount: 0,
  };
}

function initialState(): GameState {
  return {
    phase: 'start',
    playerCount: 1,
    questionCount: 15,
    categories: [],
    timerSeconds: 60,
    currentQuestionIndex: 0,
    questions: [],
    players: [createPlayer('Player 1'), createPlayer('Player 2'), createPlayer('Player 3')],
  };
}

export function useGameState(allQuestions: Question[]) {
  const [state, setState] = useState<GameState>(initialState);

  const startGame = useCallback((
    playerCount: 1 | 2 | 3,
    questionCount: 5 | 10 | 15 | 20,
    names: string[],
    categories: string[],
    timerSeconds: number | null,
  ) => {
    const questions = selectQuestions(allQuestions, questionCount, categories);
    setState({
      phase: 'playing',
      playerCount,
      questionCount,
      categories,
      timerSeconds,
      currentQuestionIndex: 0,
      questions,
      players: [
        createPlayer(names[0] || 'Player 1'),
        createPlayer(names[1] || 'Player 2'),
        createPlayer(names[2] || 'Player 3'),
      ],
    });
  }, [allQuestions]);

  const selectAnswer = useCallback((playerIndex: PlayerIndex, answerIndex: number) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      if (prev.players[playerIndex].lockedIn) return prev;
      const players = [...prev.players] as [PlayerState, PlayerState, PlayerState];
      players[playerIndex] = { ...players[playerIndex], selectedAnswer: answerIndex };
      return { ...prev, players };
    });
  }, []);

  const lockInAll = useCallback(() => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      const players = [...prev.players] as [PlayerState, PlayerState, PlayerState];
      const question = prev.questions[prev.currentQuestionIndex];

      // Lock in all active players and score them
      for (let i = 0; i < prev.playerCount; i++) {
        const p = players[i];
        const isCorrect = p.selectedAnswer === question.correctAnswer;
        players[i] = {
          ...p,
          lockedIn: true,
          score: isCorrect ? p.score + 1 : p.score,
          correctCount: isCorrect ? p.correctCount + 1 : p.correctCount,
        };
      }

      return { ...prev, players, phase: 'reveal' };
    });
  }, []);

  const nextQuestion = useCallback(() => {
    setState(prev => {
      // Single-player only: a wrong answer (or timeout) ends the game.
      if (prev.playerCount === 1) {
        const question = prev.questions[prev.currentQuestionIndex];
        if (prev.players[0].selectedAnswer !== question.correctAnswer) {
          return { ...prev, phase: 'results' };
        }
      }

      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= prev.questions.length) {
        return { ...prev, phase: 'results' };
      }

      const resetForNext = (p: PlayerState): PlayerState => ({
        ...p,
        selectedAnswer: null,
        lockedIn: false,
        fiftyFiftyEliminated: [], // reset per-question eliminations
        friendHintActive: false, // hint only applies to the question it was used on
      });
      const players: [PlayerState, PlayerState, PlayerState] = [
        resetForNext(prev.players[0]),
        resetForNext(prev.players[1]),
        resetForNext(prev.players[2]),
      ];

      return {
        ...prev,
        phase: 'playing',
        currentQuestionIndex: nextIndex,
        players,
      };
    });
  }, []);

  const useFiftyFifty = useCallback((playerIndex: PlayerIndex) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      if (prev.players[playerIndex].usedFiftyFifty) return prev;

      const question = prev.questions[prev.currentQuestionIndex];
      const wrongIndices = [0, 1, 2, 3].filter(i => i !== question.correctAnswer);
      // Shuffle wrong answers and pick 2 to eliminate
      for (let i = wrongIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongIndices[i], wrongIndices[j]] = [wrongIndices[j], wrongIndices[i]];
      }
      const eliminated = wrongIndices.slice(0, 2);

      const players = [...prev.players] as [PlayerState, PlayerState, PlayerState];
      players[playerIndex] = {
        ...players[playerIndex],
        usedFiftyFifty: true,
        fiftyFiftyEliminated: eliminated,
      };

      // Clear this player's selected answer if it was eliminated
      if (players[playerIndex].selectedAnswer !== null &&
          eliminated.includes(players[playerIndex].selectedAnswer!)) {
        players[playerIndex] = { ...players[playerIndex], selectedAnswer: null };
      }

      return { ...prev, players };
    });
  }, []);

  const useCallFriend = useCallback((playerIndex: PlayerIndex) => {
    setState(prev => {
      if (prev.phase !== 'playing') return prev;
      if (prev.players[playerIndex].usedCallFriend) return prev;

      // Phone a friend: the friend shares the question's explainer as a hint.
      const players = [...prev.players] as [PlayerState, PlayerState, PlayerState];
      players[playerIndex] = {
        ...players[playerIndex],
        usedCallFriend: true,
        friendHintActive: true,
      };

      return { ...prev, players };
    });
  }, []);

  const resetGame = useCallback(() => {
    setState(initialState());
  }, []);

  return {
    state,
    startGame,
    selectAnswer,
    lockInAll,
    nextQuestion,
    useFiftyFifty,
    useCallFriend,
    resetGame,
  };
}
