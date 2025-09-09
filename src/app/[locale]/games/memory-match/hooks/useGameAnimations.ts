import { useEffect, useState, useRef } from 'react';

// Hook for managing game animations
export function useGameAnimations() {
  const [animationClasses, setAnimationClasses] = useState<Map<string, string>>(new Map());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear existing timer for a card
  const clearCardTimer = (cardId: string) => {
    const existingTimer = timersRef.current.get(cardId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      timersRef.current.delete(cardId);
    }
  };

  // Set animation class for a specific card
  const setCardAnimation = (cardId: string, className: string, duration: number) => {
    // Clear existing timer for this card
    clearCardTimer(cardId);

    // Set the animation class
    setAnimationClasses(prev => new Map(prev).set(cardId, className));

    // Set timer to clear the animation
    const timer = setTimeout(() => {
      setAnimationClasses(prev => {
        const newMap = new Map(prev);
        newMap.delete(cardId);
        return newMap;
      });
      timersRef.current.delete(cardId);
    }, duration);

    timersRef.current.set(cardId, timer);
  };

  // Trigger matched card animation
  const triggerMatchAnimation = (cardId: string) => {
    setCardAnimation(cardId, 'animate-bounce', 600);
  };

  // Trigger wrong match shake animation
  const triggerWrongMatchAnimation = (cardIds: string[]) => {
    cardIds.forEach(cardId => {
      setCardAnimation(cardId, 'animate-pulse', 500);
    });
  };

  // Get animation class for a specific card
  const getCardAnimation = (cardId: string): string => {
    return animationClasses.get(cardId) || '';
  };

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  return {
    animationClasses,
    getCardAnimation,
    triggerMatchAnimation,
    triggerWrongMatchAnimation,
  };
}

// 3D Flip animation styles
export const flipAnimationStyles = {
  preserveStyle: {
    transformStyle: 'preserve-3d' as const,
  },
  backfaceHidden: {
    backfaceVisibility: 'hidden' as const,
    WebkitBackfaceVisibility: 'hidden' as const,
  },
  perspective: {
    perspective: '1000px',
  },
};

// Game board fade in animation
export function useFadeInAnimation(delay = 0) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return {
    className: `transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
    }`,
  };
}

// Animation CSS styles for manual application
export const animationClasses = {
  cardFlip: 'transition-transform duration-500 ease-in-out',
  cardFlipped: 'rotate-y-180',
  cardMatched: 'animate-pulse',
  gameBoard: 'transition-all duration-300',
  loadingShimmer: 'animate-pulse bg-gray-200',
};
