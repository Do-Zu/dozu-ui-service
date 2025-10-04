export interface IFlashcard {
  flashcardId: number;
  front: string;
  back: string;
  topicId: number;
  difficulty?: string;
}

export interface IMemoryCard {
  id: string;
  content: string;
  type: 'front' | 'back';
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
  flashcardId: number;
  position: number;
}

export interface IGameStats {
  score: number;
  moves: number;
  matches: number;
  timeElapsed: number;
  accuracy: number;
  bestTime?: number;
  totalPairs: number;
}

export interface IGameSettings {
  gridSize: '4x3' | '4x4' | '6x4';
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
  showHints: boolean;
  flipBackDelay: number;
  maxPairsPerBatch: number; // Maximum pairs per batch
}

export interface ITopicInfo {
  topicId: number;
  name: string;
  title?: string;
  description?: string;
  flashcardCount?: number;
}

// Batch Management Types
export interface IGameBatch {
  id: string;
  batchNumber: number;
  cards: IMemoryCard[];
  flashcardIds: number[];
  completedAt?: Date;
  stats: IGameStats;
  isCompleted: boolean;
}

export interface ICardProgress {
  flashcardId: number;
  timesPlayed: number;
  timesMatched: number;
  averageMatchTime: number;
  lastPlayed: Date;
  masteryLevel: number; // 0-100
  needsReview: boolean;
}

export interface IBatchProgress {
  topicId: number;
  totalFlashcards: number;
  totalBatches: number;
  currentBatchNumber: number;
  completedBatches: string[];
  cardProgress: Map<number, ICardProgress>;
  overallStats: {
    totalTimePlayed: number;
    totalGamesCompleted: number;
    averageAccuracy: number;
    masteredCards: number;
    cardsNeedingReview: number;
  };
  createdAt: Date;
  lastUpdated: Date;
}

export interface IBatchSelectionStrategy {
  newCardsRatio: number; // 0-1, percentage of new cards vs review cards
  reviewPriority: 'weakest' | 'oldest' | 'random';
  difficultyBalance: boolean; // Whether to balance easy/hard cards
}

export type GameStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'failed' | 'batch-completed';
