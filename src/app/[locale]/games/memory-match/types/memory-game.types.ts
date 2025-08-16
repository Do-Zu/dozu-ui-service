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
}

export interface ITopicInfo {
  topicId: number;
  name: string;
  title?: string;
  description?: string;
  flashcardCount?: number;
}

export type GameStatus = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'completed' | 'failed';
