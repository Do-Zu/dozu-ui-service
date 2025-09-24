'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import useFetch from '@/hooks/useFetch';
import { 
  IFlashcard, 
  IMemoryCard, 
  IGameStats, 
  IGameSettings, 
  ITopicInfo, 
  GameStatus,
  IGameBatch,
  IBatchProgress,
  IBatchSelectionStrategy
} from '../types/memory-game.types';
import { BatchManager } from '../utils/BatchManager';

// Default settings
const DEFAULT_SETTINGS: IGameSettings = {
  gridSize: '4x3',
  difficulty: 'medium',
  timeLimit: 300, // 5 minutes
  showHints: false,
  flipBackDelay: 1000,
  maxPairsPerBatch: 6, // Maximum 6 pairs = 12 cards for 4x3 grid
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

// Default batch selection strategy
const DEFAULT_BATCH_STRATEGY: IBatchSelectionStrategy = {
  newCardsRatio: 0.7, // 70% new cards, 30% review
  reviewPriority: 'weakest',
  difficultyBalance: true,
};

// Context state interface
interface IMemoryMatchState {
  // Game status
  gameStatus: GameStatus;
  
  // Game data
  allFlashcards: IFlashcard[]; // All flashcards from topic
  currentBatchFlashcards: IFlashcard[]; // Current batch flashcards
  cards: IMemoryCard[];
  topicId: string | null;
  topicInfo: ITopicInfo | null;
  
  // Batch Management
  currentBatch: IGameBatch | null;
  batchProgress: IBatchProgress | null;
  batchStrategy: IBatchSelectionStrategy;
  
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
  
  // Batch management
  startNextBatch: () => void;
  completeBatch: () => void;
  
  // Card interactions
  flipCard: (cardId: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<IGameSettings>) => void;
  updateBatchStrategy: (strategy: Partial<IBatchSelectionStrategy>) => void;
  
  // Utils
  getGameProgress: () => number;
  getBatchProgress: () => number;
  getOverallProgress: () => number;
  canFlipCard: (cardId: string) => boolean;
}

// Combined context type
type IMemoryMatchContext = IMemoryMatchState & IMemoryMatchActions;

// Action types for reducer
type MemoryMatchAction =
  | { type: 'SET_GAME_STATUS'; payload: GameStatus }
  | { type: 'SET_ALL_FLASHCARDS'; payload: IFlashcard[] }
  | { type: 'SET_CURRENT_BATCH_FLASHCARDS'; payload: IFlashcard[] }
  | { type: 'SET_CARDS'; payload: IMemoryCard[] }
  | { type: 'SET_TOPIC_INFO'; payload: ITopicInfo }
  | { type: 'SET_CURRENT_BATCH'; payload: IGameBatch | null }
  | { type: 'SET_BATCH_PROGRESS'; payload: IBatchProgress | null }
  | { type: 'SET_BATCH_STRATEGY'; payload: IBatchSelectionStrategy }
  | { type: 'FLIP_CARD'; payload: string }
  | { type: 'SET_SELECTED_CARDS'; payload: IMemoryCard[] }
  | { type: 'MATCH_CARDS'; payload: string[] }
  | { type: 'UNFLIP_CARDS'; payload: string[] }
  | { type: 'UPDATE_STATS'; payload: Partial<IGameStats> }
  | { type: 'TICK_TIMER' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<IGameSettings> }
  | { type: 'RESET_GAME' }
  | { type: 'COMPLETE_BATCH' };

// Reducer function
function memoryMatchReducer(state: IMemoryMatchState, action: MemoryMatchAction): IMemoryMatchState {
  switch (action.type) {
    case 'SET_GAME_STATUS':
      return { ...state, gameStatus: action.payload };
      
    case 'SET_ALL_FLASHCARDS':
      return { ...state, allFlashcards: action.payload };

    case 'SET_CURRENT_BATCH_FLASHCARDS':
      return { ...state, currentBatchFlashcards: action.payload };
      
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
      
    case 'SET_TOPIC_INFO':
      return { ...state, topicInfo: action.payload };

    case 'SET_CURRENT_BATCH':
      return { ...state, currentBatch: action.payload };

    case 'SET_BATCH_PROGRESS':
      return { ...state, batchProgress: action.payload };

    case 'SET_BATCH_STRATEGY':
      return { ...state, batchStrategy: action.payload };
      
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
    allFlashcards: [],
    currentBatchFlashcards: [],
    cards: [],
    topicId,
    topicInfo: null,
    currentBatch: null,
    batchProgress: null,
    batchStrategy: DEFAULT_BATCH_STRATEGY,
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
    topicId ? `/topics/${topicId}/flashcards` : '',
    { 
      selector: (data: any) => {
        // API returns array directly when includeTopic=false
        // or object with flashcards property when includeTopic=true
        if (Array.isArray(data)) {
          return data;
        }
        return data.flashcards || data.data || [];
      }
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

  // Initialize game when flashcards are loaded
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      dispatch({ type: 'SET_ALL_FLASHCARDS', payload: flashcards });
      dispatch({ type: 'SET_GAME_STATUS', payload: 'ready' });
    }
  }, [flashcards]);

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
    
    // Reset batch progress if we have a topic
    if (topicId) {
      const topicIdNum = parseInt(topicId, 10);
      BatchManager.clearBatchProgress(topicIdNum);
      dispatch({ type: 'SET_BATCH_PROGRESS', payload: null });
      dispatch({ type: 'SET_CURRENT_BATCH', payload: null });
      dispatch({ type: 'SET_CURRENT_BATCH_FLASHCARDS', payload: [] });
    }
  }, [topicId]);

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

  // Batch Management functions
  const startNextBatch = useCallback(() => {
    if (!topicId || !state.allFlashcards.length) return;
    
    const topicIdNum = parseInt(topicId, 10);
    let progress = state.batchProgress || BatchManager.getBatchProgress(topicIdNum);
    
    // Select next batch of flashcards
    const nextBatchFlashcards = BatchManager.selectNextBatch(
      state.allFlashcards,
      progress,
      state.settings.maxPairsPerBatch,
      state.batchStrategy
    );
    
    if (nextBatchFlashcards.length === 0) {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'completed' });
      return;
    }
    
    // Create new batch
    const newBatch: IGameBatch = {
      id: `batch-${progress.currentBatchNumber}-${Date.now()}`,
      batchNumber: progress.currentBatchNumber,
      cards: [],
      flashcardIds: nextBatchFlashcards.map(f => f.flashcardId),
      isCompleted: false,
      stats: DEFAULT_STATS
    };
    
    // Create memory cards for this batch
    const memoryCards = BatchManager.createMemoryCards(nextBatchFlashcards);
    newBatch.cards = memoryCards;
    
    // Update state
    dispatch({ type: 'SET_CURRENT_BATCH_FLASHCARDS', payload: nextBatchFlashcards });
    dispatch({ type: 'SET_CURRENT_BATCH', payload: newBatch });
    dispatch({ type: 'SET_BATCH_PROGRESS', payload: progress });
    dispatch({ type: 'SET_CARDS', payload: memoryCards });
    dispatch({ type: 'UPDATE_STATS', payload: { totalPairs: memoryCards.length / 2 } });
    dispatch({ type: 'SET_GAME_STATUS', payload: 'ready' });
  }, [topicId, state.allFlashcards, state.batchProgress, state.settings.maxPairsPerBatch, state.batchStrategy]);

  const completeBatch = useCallback(() => {
    if (!state.currentBatch || !state.batchProgress || !topicId) return;
    
    const topicIdNum = parseInt(topicId, 10);
    
    // Mark batch as completed
    const completedBatch: IGameBatch = {
      ...state.currentBatch,
      isCompleted: true,
      completedAt: new Date(),
      stats: state.stats
    };
    
    // Update progress
    const updatedProgress = BatchManager.updateCardProgress(
      state.batchProgress,
      completedBatch,
      state.stats
    );
    
    // Save progress
    BatchManager.saveBatchProgress(updatedProgress);
    
    // Update state
    dispatch({ type: 'SET_CURRENT_BATCH', payload: completedBatch });
    dispatch({ type: 'SET_BATCH_PROGRESS', payload: updatedProgress });
    
    // Check if topic is completed
    if (BatchManager.isTopicMastered(updatedProgress)) {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'completed' });
    } else {
      dispatch({ type: 'SET_GAME_STATUS', payload: 'batch-completed' });
    }
  }, [state.currentBatch, state.batchProgress, state.stats, topicId]);

  const updateBatchStrategy = useCallback((strategy: Partial<IBatchSelectionStrategy>) => {
    const newStrategy = { ...state.batchStrategy, ...strategy };
    dispatch({ type: 'SET_BATCH_STRATEGY', payload: newStrategy });
  }, [state.batchStrategy]);

  const getBatchProgress = useCallback((): number => {
    if (!state.batchProgress || !state.currentBatch) return 0;
    return (state.stats.matches / state.stats.totalPairs) * 100;
  }, [state.batchProgress, state.currentBatch, state.stats.matches, state.stats.totalPairs]);

  const getOverallProgress = useCallback((): number => {
    if (!state.batchProgress) return 0;
    const { completedBatches, totalBatches } = state.batchProgress;
    return (completedBatches.length / Math.max(totalBatches, 1)) * 100;
  }, [state.batchProgress]);

  // Game actions
  const startGame = useCallback(() => {
    // Start first batch if we have flashcards
    if (state.allFlashcards.length > 0) {
      startNextBatch();
    }
    
    dispatch({ type: 'SET_GAME_STATUS', payload: 'playing' });
    
    // Clear any existing timer first
    if (gameTimerRef.current) {
      clearInterval(gameTimerRef.current);
    }
    
    // Start timer - use TICK_TIMER action to avoid stale closure
    gameTimerRef.current = setInterval(() => {
      dispatch({ type: 'TICK_TIMER' });
    }, 1000);
  }, [state.allFlashcards, startNextBatch]);

  // Initialize batch system when flashcards are loaded
  useEffect(() => {
    if (state.allFlashcards.length > 0 && topicId && !state.batchProgress) {
      const topicIdNum = parseInt(topicId, 10);
      const progress = BatchManager.getBatchProgress(topicIdNum);
      dispatch({ type: 'SET_BATCH_PROGRESS', payload: progress });
    }
  }, [state.allFlashcards, topicId, state.batchProgress]);

  // Load cards from current batch instead of all flashcards
  useEffect(() => {
    if (state.currentBatchFlashcards.length > 0) {
      const newCards = BatchManager.createMemoryCards(state.currentBatchFlashcards);
      dispatch({ type: 'SET_CARDS', payload: newCards });
      dispatch({ type: 'UPDATE_STATS', payload: { totalPairs: newCards.length / 2 } });
    }
  }, [state.currentBatchFlashcards]);

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
    
    // Batch Management
    startNextBatch,
    completeBatch,
    updateBatchStrategy,
    getBatchProgress,
    getOverallProgress,
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
