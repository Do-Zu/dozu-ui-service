'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import useFetch from '@/hooks/useFetch';
import { IFlashcard, IMemoryCard, IGameStats, IGameSettings, ITopicInfo, GameStatus } from '../types/memory-game.types';

// Default settings
const DEFAULT_SETTINGS: IGameSettings = {
  gridSize: '4x3',
  difficulty: 'medium',
  timeLimit: 300, // 5 minutes
  showHints: false,
  flipBackDelay: 1000,
};

// Default stats
const DEFAULT_STATS: IGameStats = {
  score: 0,
  moves: 0,
  matches: 0,
  timeElapsed: 0,
  accuracy: 0,
  totalPairs: 0,
};

// Context state interface
interface IMemoryMatchState {
  // Game status
  gameStatus: GameStatus;
  
  // Game data
  flashcards: IFlashcard[];
  cards: IMemoryCard[];
  topicId: string | null;
  topicInfo: ITopicInfo | null;
  
  // Game state
  flippedCards: string[];
  selectedCards: IMemoryCard[];
  matchedPairs: string[];
  
  // Settings and stats
  stats: IGameStats;
  settings: IGameSettings;
  
  // Loading states
  isLoading: boolean;
  error: any;
}

// Context actions
interface IMemoryMatchActions {
  // Game control
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  endGame: () => void;
  
  // Card interactions
  flipCard: (cardId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<IGameSettings>) => void;
  
  // Utils
  getGameProgress: () => number;
  canFlipCard: (cardId: string) => boolean;
}

// Combined context type
type IMemoryMatchContext = IMemoryMatchState & IMemoryMatchActions;

// Action types for reducer
type MemoryMatchAction =
  | { type: 'SET_GAME_STATUS'; payload: GameStatus }
  | { type: 'SET_FLASHCARDS'; payload: IFlashcard[] }
  | { type: 'SET_CARDS'; payload: IMemoryCard[] }
  | { type: 'SET_TOPIC_INFO'; payload: ITopicInfo }
  | { type: 'FLIP_CARD'; payload: string }
  | { type: 'SET_SELECTED_CARDS'; payload: IMemoryCard[] }
  | { type: 'MATCH_CARDS'; payload: string[] }
  | { type: 'UNFLIP_CARDS'; payload: string[] }
  | { type: 'UPDATE_STATS'; payload: Partial<IGameStats> }
  | { type: 'TICK_TIMER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<IGameSettings> }
  | { type: 'RESET_GAME' };

// Reducer function
function memoryMatchReducer(state: IMemoryMatchState, action: MemoryMatchAction): IMemoryMatchState {
  switch (action.type) {
    case 'SET_GAME_STATUS':
      return { ...state, gameStatus: action.payload };
      
    case 'SET_FLASHCARDS':
      return { ...state, flashcards: action.payload };
      
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
      
    case 'SET_TOPIC_INFO':
      return { ...state, topicInfo: action.payload };
      
    case 'FLIP_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload
            ? { ...card, isFlipped: true }
            : card
        ),
        flippedCards: [...state.flippedCards, action.payload],
      };
      
    case 'SET_SELECTED_CARDS':
      return { ...state, selectedCards: action.payload };
      
    case 'MATCH_CARDS':
      return {
        ...state,
        cards: state.cards.map(card =>
          action.payload.includes(card.id)
            ? { ...card, isMatched: true }
            : card
        ),
        matchedPairs: [...state.matchedPairs, action.payload[0], action.payload[1]],
        flippedCards: [],
        selectedCards: [],
      };
      
    case 'UNFLIP_CARDS':
      return {
        ...state,
        cards: state.cards.map(card =>
          action.payload.includes(card.id)
            ? { ...card, isFlipped: false }
            : card
        ),
        flippedCards: [],
        selectedCards: [],
      };
      
    case 'UPDATE_STATS':
      return {
        ...state,
        stats: { ...state.stats, ...action.payload },
      };
      
    case 'TICK_TIMER':
      return {
        ...state,
        stats: { ...state.stats, timeElapsed: state.stats.timeElapsed + 1 },
      };
      
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      
    case 'RESET_GAME':
      return {
        ...state,
        gameStatus: 'ready',
        cards: state.cards.map(card => ({
          ...card,
          isFlipped: false,
          isMatched: false,
        })),
        flippedCards: [],
        selectedCards: [],
        matchedPairs: [],
        stats: { ...DEFAULT_STATS, totalPairs: state.stats.totalPairs },
      };
      
    default:
      return state;
  }
}

// Create context
const MemoryMatchContext = createContext<IMemoryMatchContext | undefined>(undefined);

// Provider component
export function MemoryMatchProvider({ 
  children, 
  topicId 
}: { 
  children: React.ReactNode; 
  topicId: string | null;
}) {
  // Initialize state
  const [state, dispatch] = useReducer(memoryMatchReducer, {
    gameStatus: 'loading',
    flashcards: [],
    cards: [],
    topicId,
    topicInfo: null,
    flippedCards: [],
    selectedCards: [],
    matchedPairs: [],
    stats: DEFAULT_STATS,
    settings: DEFAULT_SETTINGS,
    isLoading: true,
    error: null,
  });

  // Game timer
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const gameStatusRef = useRef<GameStatus>('loading');

  // Fetch flashcards and topic info
  const {
    data: flashcards,
    loading: flashcardsLoading,
    error: flashcardsError,
  } = useFetch<IFlashcard[]>(
    topicId ? `/flashcards?topicId=${topicId}` : '',
    { 
      selector: (data: { flashcards: IFlashcard[] }) => data.flashcards
    }
  );

  const {
    data: topicInfo,
    loading: topicLoading,
    error: topicError,
  } = useFetch<ITopicInfo>(
    topicId ? `/topics/${topicId}` : '',
    { 
      selector: (data: any) => data.data || data
    }
  );

  // Create memory cards from flashcards
  const createMemoryCards = useCallback((flashcards: IFlashcard[]): IMemoryCard[] => {
    const pairs: IMemoryCard[] = [];
    
    flashcards.slice(0, 6).forEach((flashcard, index) => {
      // Create front card
      pairs.push({
        id: `front-${flashcard.flashcardId}`,
        content: flashcard.front,
        type: 'front',
        pairId: `pair-${flashcard.flashcardId}`,
        isFlipped: false,
        isMatched: false,
        flashcardId: flashcard.flashcardId,
        position: index * 2,
      });
      
      // Create back card
      pairs.push({
        id: `back-${flashcard.flashcardId}`,
        content: flashcard.back,
        type: 'back',
        pairId: `pair-${flashcard.flashcardId}`,
        isFlipped: false,
        isMatched: false,
        flashcardId: flashcard.flashcardId,
        position: index * 2 + 1,
      });
    });
    
    // Shuffle the cards
    return pairs.sort(() => Math.random() - 0.5).map((card, index) => ({
      ...card,
      position: index,
    }));
  }, []);

  // Initialize game when flashcards are loaded
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      dispatch({ type: 'SET_FLASHCARDS', payload: flashcards });
      
      const memoryCards = createMemoryCards(flashcards);
      dispatch({ type: 'SET_CARDS', payload: memoryCards });
      dispatch({ type: 'UPDATE_STATS', payload: { totalPairs: memoryCards.length / 2 } });
      dispatch({ type: 'SET_GAME_STATUS', payload: 'ready' });
    }
  }, [flashcards, createMemoryCards]);

  // Set topic info
  useEffect(() => {
    if (topicInfo) {
      dispatch({ type: 'SET_TOPIC_INFO', payload: topicInfo });
    }
  }, [topicInfo]);

  // Update gameStatusRef when state changes
  useEffect(() => {
    gameStatusRef.current = state.gameStatus;
  }, [state.gameStatus]);

  // Update loading state
  useEffect(() => {
    const isLoading = flashcardsLoading || topicLoading;
    const error = flashcardsError || topicError;
    
    if (!isLoading && !error && flashcards && flashcards.length === 0) {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'failed' });
    }
  }, [flashcardsLoading, topicLoading, flashcardsError, topicError, flashcards]);

  // Game actions
  const startGame = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' });
    
    // Clear any existing timer first
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Start timer - use TICK_TIMER action to avoid stale closure
    gameTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATUS', payload: 'paused' });
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
      gameTimerRef.current = null;
    }
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' });
    
    // Clear any existing timer first
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Restart timer without resetting game state
    gameTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);
  }, []);

  const resetGame = useCallback(() => {
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    if (flipTimeoutRef.current) {
      clearTimeout(flipTimeoutRef.current);
    }
    
    dispatch({ type: 'RESET_GAME' });
    
    // Recreate and shuffle cards
    if (state.flashcards.length > 0) {
      const newCards = createMemoryCards(state.flashcards);
      dispatch({ type: 'SET_CARDS', payload: newCards });
    }
  }, [state.flashcards, createMemoryCards]);

  const endGame = useCallback(() => {
    dispatch({ type: 'SET_GAME_STATUS', payload: 'completed' });
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Calculate final stats
    const accuracy = state.stats.moves > 0 ? (state.stats.matches / state.stats.moves) * 100 : 0;
    dispatch({ type: 'UPDATE_STATS', payload: { accuracy } });
  }, [state.stats.moves, state.stats.matches]);

  // Can flip card validation
  const canFlipCard = useCallback((cardId: string): boolean => {
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return false;
    
    return (
      state.gameStatus === 'playing' &&
      !card.isFlipped &&
      !card.isMatched &&
      state.selectedCards.length < 2 &&
      !state.flippedCards.includes(cardId)
    );
  }, [state.gameStatus, state.cards, state.selectedCards.length, state.flippedCards]);

  // Flip card action
  const flipCard = useCallback((cardId: string) => {
    if (!canFlipCard(cardId)) return;
    
    const card = state.cards.find(c => c.id === cardId);
    if (!card) return;
    
    dispatch({ type: 'FLIP_CARD', payload: cardId });
    
    const newSelectedCards = [...state.selectedCards, card];
    dispatch({ type: 'SET_SELECTED_CARDS', payload: newSelectedCards });
    
    // Update moves
    dispatch({ type: 'UPDATE_STATS', payload: { 
      moves: state.stats.moves + 1 
    } });
    
    // Check for match when 2 cards are selected
    if (newSelectedCards.length === 2) {
      const [card1, card2] = newSelectedCards;
      const isMatch = card1.pairId === card2.pairId && card1.id !== card2.id;
      
      if (isMatch) {
        // Match found
        dispatch({ type: 'MATCH_CARDS', payload: [card1.id, card2.id] });
        dispatch({ type: 'UPDATE_STATS', payload: { 
          matches: state.stats.matches + 1,
          score: state.stats.score + 100 
        } });
        
        // Check for game completion
        const newMatchedCount = state.stats.matches + 1;
        if (newMatchedCount === state.stats.totalPairs) {
          setTimeout(() => endGame(), 500);
        }
      } else {
        // No match - flip back after delay
        flipTimeoutRef.current = setTimeout(() => {
          dispatch({ type: 'UNFLIP_CARDS', payload: [card1.id, card2.id] });
        }, state.settings.flipBackDelay);
      }
    }
  }, [canFlipCard, state.cards, state.selectedCards, state.stats, state.settings.flipBackDelay, endGame]);

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<IGameSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  }, []);

  // Get game progress
  const getGameProgress = useCallback((): number => {
    if (state.stats.totalPairs === 0) return 0;
    return (state.stats.matches / state.stats.totalPairs) * 100;
  }, [state.stats.matches, state.stats.totalPairs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameTimerRef.current) {
        clearInterval(gameTimerRef.current);
      }
      if (flipTimeoutRef.current) {
        clearTimeout(flipTimeoutRef.current);
      }
    };
  }, []);

  // Context value
  const contextValue: IMemoryMatchContext = {
    ...state,
    isLoading: flashcardsLoading || topicLoading,
    error: flashcardsError || topicError,
    
    // Actions
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    endGame,
    flipCard,
    updateSettings,
    getGameProgress,
    canFlipCard,
  };

  return (
    <MemoryMatchContext.Provider value={contextValue}>
      {children}
    </MemoryMatchContext.Provider>
  );
}

// Custom hook to use context
export function useMemoryMatch(): IMemoryMatchContext {
  const context = useContext(MemoryMatchContext);
  if (context === undefined) {
    throw new Error('useMemoryMatch must be used within a MemoryMatchProvider');
  }
  return context;
}
