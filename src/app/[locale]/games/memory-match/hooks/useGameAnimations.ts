import { useEffect, useState } from 'react';

// Hook for managing game animations
export function useGameAnimations() {
  const [animationClass, setAnimationClass] = useState('');

  // Trigger matched card animation
  const triggerMatchAnimation = (cardId: string) => {
    setAnimationClass('animate-bounce');
    setTimeout(() => setAnimationClass(''), 600);
  };

  // Trigger wrong match shake animation
  const triggerWrongMatchAnimation = (cardIds: string[]) => {
    setAnimationClass('animate-pulse');
    setTimeout(() => setAnimationClass(''), 500);
  };

  return {
    animationClass,
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
