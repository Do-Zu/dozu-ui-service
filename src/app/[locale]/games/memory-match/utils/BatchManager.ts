import { 
  IFlashcard, 
  IGameBatch, 
  IBatchProgress, 
  ICardProgress, 
  IBatchSelectionStrategy,
  IMemoryCard 
} from '../types/memory-game.types';

/**
 * Utility class for managing game batches and card selection
 */
export class BatchManager {
  private static readonly STORAGE_KEY_PREFIX = 'memory_match_progress_';
  private static readonly DEFAULT_MAX_PAIRS = 6; // 6 pairs = 12 cards for 4x3 grid
  private static readonly DEFAULT_STRATEGY: IBatchSelectionStrategy = {
    newCardsRatio: 0.7, // 70% new cards, 30% review
    reviewPriority: 'weakest',
    difficultyBalance: true
  };

  /**
   * Get or create batch progress for a topic
   */
  static getBatchProgress(topicId: number): IBatchProgress {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${topicId}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const progress: IBatchProgress = JSON.parse(stored);
      // Convert Map from stored object - ensure keys are numbers
      const cardProgressEntries = Object.entries(progress.cardProgress || {}).map(([key, value]) => [
        parseInt(key, 10),
        value
      ]) as [number, ICardProgress][];
      progress.cardProgress = new Map(cardProgressEntries);
      return progress;
    }
    
    // Create new progress
    return {
      topicId,
      totalFlashcards: 0,
      totalBatches: 0,
      currentBatchNumber: 1,
      completedBatches: [],
      cardProgress: new Map(),
      overallStats: {
        totalTimePlayed: 0,
        totalGamesCompleted: 0,
        averageAccuracy: 0,
        masteredCards: 0,
        cardsNeedingReview: 0
      },
      createdAt: new Date(),
      lastUpdated: new Date()
    };
  }

  /**
   * Save batch progress to localStorage
   */
  static saveBatchProgress(progress: IBatchProgress): void {
    const storageKey = `${this.STORAGE_KEY_PREFIX}${progress.topicId}`;
    
    // Convert Map to object for storage
    const toStore = {
      ...progress,
      cardProgress: Object.fromEntries(progress.cardProgress),
      lastUpdated: new Date()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(toStore));
  }

  /**
   * Calculate total number of batches needed
   */
  static calculateTotalBatches(totalFlashcards: number, maxPairsPerBatch: number = this.DEFAULT_MAX_PAIRS): number {
    return Math.ceil(totalFlashcards / maxPairsPerBatch);
  }

  /**
   * Select optimal flashcards for next batch
   */
  static selectNextBatch(
    allFlashcards: IFlashcard[],
    progress: IBatchProgress,
    maxPairs: number = this.DEFAULT_MAX_PAIRS,
    strategy: IBatchSelectionStrategy = this.DEFAULT_STRATEGY
  ): IFlashcard[] {
    if (allFlashcards.length === 0) return [];
    
    // Update total flashcards count
    progress.totalFlashcards = allFlashcards.length;
    progress.totalBatches = this.calculateTotalBatches(allFlashcards.length, maxPairs);
    
    // Get cards that have been played before
    const playedCardIds = Array.from(progress.cardProgress.keys());
    const unplayedCards = allFlashcards.filter(card => !playedCardIds.includes(card.flashcardId));
    const playedCards = allFlashcards.filter(card => playedCardIds.includes(card.flashcardId));
    
    // Determine how many new vs review cards to include
    const targetNewCards = Math.min(
      Math.floor(maxPairs * strategy.newCardsRatio),
      unplayedCards.length
    );
    const targetReviewCards = Math.min(maxPairs - targetNewCards, playedCards.length);
    
    let selectedCards: IFlashcard[] = [];
    
    // Select new cards (prioritize by difficulty if enabled)
    if (targetNewCards > 0) {
      let newCardsToAdd = [...unplayedCards];
      
      if (strategy.difficultyBalance) {
        // Mix easy and hard cards
        newCardsToAdd = this.balanceCardDifficulty(newCardsToAdd);
      } else {
        // Random selection
        newCardsToAdd = this.shuffleArray(newCardsToAdd);
      }
      
      selectedCards.push(...newCardsToAdd.slice(0, targetNewCards));
    }
    
    // Select review cards based on strategy
    if (targetReviewCards > 0) {
      const reviewCards = this.selectReviewCards(playedCards, progress, targetReviewCards, strategy);
      selectedCards.push(...reviewCards);
    }
    
    // If we still need more cards, fill with any remaining
    if (selectedCards.length < maxPairs) {
      const remainingCards = allFlashcards.filter(
        card => !selectedCards.some(selected => selected.flashcardId === card.flashcardId)
      );
      const stillNeeded = maxPairs - selectedCards.length;
      selectedCards.push(...this.shuffleArray(remainingCards).slice(0, stillNeeded));
    }
    
    return selectedCards.slice(0, maxPairs);
  }

  /**
   * Select review cards based on strategy
   */
  private static selectReviewCards(
    playedCards: IFlashcard[],
    progress: IBatchProgress,
    count: number,
    strategy: IBatchSelectionStrategy
  ): IFlashcard[] {
    const cardsWithProgress = playedCards.map(card => ({
      card,
      progress: progress.cardProgress.get(card.flashcardId)!
    })).filter(item => item.progress);
    
    let sortedCards: IFlashcard[];
    
    switch (strategy.reviewPriority) {
      case 'weakest':
        // Prioritize cards with lowest mastery level
        sortedCards = cardsWithProgress
          .sort((a, b) => a.progress.masteryLevel - b.progress.masteryLevel)
          .map(item => item.card);
        break;
        
      case 'oldest':
        // Prioritize cards not played recently
        sortedCards = cardsWithProgress
          .sort((a, b) => a.progress.lastPlayed.getTime() - b.progress.lastPlayed.getTime())
          .map(item => item.card);
        break;
        
      case 'random':
      default:
        sortedCards = this.shuffleArray(cardsWithProgress.map(item => item.card));
        break;
    }
    
    return sortedCards.slice(0, count);
  }

  /**
   * Balance card difficulty in selection
   */
  private static balanceCardDifficulty(cards: IFlashcard[]): IFlashcard[] {
    // Simple heuristic: longer content = harder
    const easyCards = cards.filter(card => (card.front.length + card.back.length) < 100);
    const hardCards = cards.filter(card => (card.front.length + card.back.length) >= 100);
    
    const balanced: IFlashcard[] = [];
    const maxLength = Math.max(easyCards.length, hardCards.length);
    
    for (let i = 0; i < maxLength; i++) {
      if (i < easyCards.length) balanced.push(easyCards[i]);
      if (i < hardCards.length) balanced.push(hardCards[i]);
    }
    
    return this.shuffleArray(balanced);
  }

  /**
   * Create memory cards from flashcards
   */
  static createMemoryCards(flashcards: IFlashcard[]): IMemoryCard[] {
    const cards: IMemoryCard[] = [];
    
    flashcards.forEach((flashcard, index) => {
      const pairId = `pair-${flashcard.flashcardId}`;
      
      // Front card
      cards.push({
        id: `${pairId}-front`,
        content: flashcard.front,
        type: 'front',
        pairId,
        isFlipped: false,
        isMatched: false,
        flashcardId: flashcard.flashcardId,
        position: index * 2
      });
      
      // Back card
      cards.push({
        id: `${pairId}-back`,
        content: flashcard.back,
        type: 'back',
        pairId,
        isFlipped: false,
        isMatched: false,
        flashcardId: flashcard.flashcardId,
        position: index * 2 + 1
      });
    });
    
    return this.shuffleArray(cards).map((card, index) => ({
      ...card,
      position: index
    }));
  }

  /**
   * Update card progress after game completion
   */
  static updateCardProgress(
    progress: IBatchProgress,
    completedBatch: IGameBatch,
    gameStats: any
  ): IBatchProgress {
    const updatedProgress = { ...progress };
    
    // Update each card's progress
    completedBatch.flashcardIds.forEach(flashcardId => {
      const currentProgress = updatedProgress.cardProgress.get(flashcardId) || {
        flashcardId,
        timesPlayed: 0,
        timesMatched: 0,
        averageMatchTime: 0,
        lastPlayed: new Date(),
        masteryLevel: 0,
        needsReview: false
      };
      
      // Update progress
      currentProgress.timesPlayed += 1;
      currentProgress.timesMatched += 1; // Assuming all cards in completed batch were matched
      currentProgress.lastPlayed = new Date();
      
      // Update mastery level based on performance
      const timeBonus = gameStats.timeElapsed < 300 ? 10 : 5; // Quick completion bonus
      const accuracyBonus = gameStats.accuracy > 80 ? 15 : gameStats.accuracy > 60 ? 10 : 5;
      
      currentProgress.masteryLevel = Math.min(
        100,
        currentProgress.masteryLevel + timeBonus + accuracyBonus
      );
      
      // Determine if needs review
      currentProgress.needsReview = currentProgress.masteryLevel < 80;
      
      updatedProgress.cardProgress.set(flashcardId, currentProgress);
    });
    
    // Update overall stats
    updatedProgress.overallStats.totalGamesCompleted += 1;
    updatedProgress.overallStats.totalTimePlayed += gameStats.timeElapsed;
    updatedProgress.overallStats.averageAccuracy = 
      (updatedProgress.overallStats.averageAccuracy * (updatedProgress.overallStats.totalGamesCompleted - 1) + gameStats.accuracy) / 
      updatedProgress.overallStats.totalGamesCompleted;
    
    updatedProgress.overallStats.masteredCards = Array.from(updatedProgress.cardProgress.values())
      .filter(cp => cp.masteryLevel >= 80).length;
    
    updatedProgress.overallStats.cardsNeedingReview = Array.from(updatedProgress.cardProgress.values())
      .filter(cp => cp.needsReview).length;
    
    // Mark batch as completed
    updatedProgress.completedBatches.push(completedBatch.id);
    updatedProgress.currentBatchNumber = Math.min(
      updatedProgress.totalBatches,
      updatedProgress.currentBatchNumber + 1
    );
    
    return updatedProgress;
  }

  /**
   * Check if all cards in topic are mastered
   */
  static isTopicMastered(progress: IBatchProgress): boolean {
    if (progress.totalFlashcards === 0) return false;
    
    const masteredCount = Array.from(progress.cardProgress.values())
      .filter(cp => cp.masteryLevel >= 80).length;
    
    return masteredCount >= progress.totalFlashcards;
  }

  /**
   * Get learning recommendations
   */
  static getLearningRecommendations(progress: IBatchProgress): string[] {
    const recommendations: string[] = [];
    const stats = progress.overallStats;
    
    if (stats.averageAccuracy < 60) {
      recommendations.push("Take your time to improve accuracy - focus on reading cards carefully");
    }
    
    if (stats.cardsNeedingReview > 5) {
      recommendations.push(`You have ${stats.cardsNeedingReview} cards that need review`);
    }
    
    if (stats.masteredCards > stats.totalGamesCompleted * 5) {
      recommendations.push("Great progress! You're mastering cards quickly");
    }
    
    if (recommendations.length === 0) {
      recommendations.push("Keep up the great work! Continue learning at your own pace");
    }
    
    return recommendations;
  }

  /**
   * Clear all progress for a topic (reset)
   */
  static clearBatchProgress(topicId: number): void {
    const key = `batch_progress_${topicId}`;
    localStorage.removeItem(key);
  }

  /**
   * Utility: Shuffle array
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
