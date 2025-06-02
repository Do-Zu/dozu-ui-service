'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { RedirectChainService, RedirectChain } from '@/utils/auth/redirectChainService';
import { useAuth } from '@/contexts/auth/AuthContext';

/**
 * Hook for managing redirect chains in React components
 */
export function useRedirectChain() {
  const [chain, setChain] = useState<RedirectChain | null>(null);
  const [isInChain, setIsInChain] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Update chain state when component mounts or pathname changes
  useEffect(() => {
    const currentChain = RedirectChainService.getCurrentChain();
    setChain(currentChain);
    setIsInChain(RedirectChainService.isInRedirectChain());
  }, [pathname]);

  /**
   * Gets the current progress through the redirect chain
   */
  const getProgress = useCallback(() => {
    return RedirectChainService.getProgress();
  }, []);

  /**
   * Gets information about the current chain
   */
  const getChainInfo = useCallback(() => {
    return RedirectChainService.getChainInfo();
  }, []);

  /**
   * Checks if the current page is part of the active chain
   */
  const isCurrentPageInChain = useCallback(() => {
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, '') || pathname || '';
    return RedirectChainService.isCurrentPageInChain(normalizedPath);
  }, [pathname]);

  /**
   * Validates that the user should be on the current page
   */
  const validateCurrentStep = useCallback(() => {
    if (!user) return false;
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, '') || pathname || '';
    return RedirectChainService.validateCurrentStep(normalizedPath, user);
  }, [pathname, user]);

  /**
   * Advances to the next step in the chain
   */
  const advanceToNextStep = useCallback(() => {
    const nextDestination = RedirectChainService.advanceToNextStep();

    // Update local state
    const updatedChain = RedirectChainService.getCurrentChain();
    setChain(updatedChain);
    setIsInChain(RedirectChainService.isInRedirectChain());

    return nextDestination;
  }, []);

  /**
   * Skips the current step
   */
  const skipCurrentStep = useCallback(() => {
    const nextDestination = RedirectChainService.skipCurrentStep();

    // Update local state
    const updatedChain = RedirectChainService.getCurrentChain();
    setChain(updatedChain);
    setIsInChain(RedirectChainService.isInRedirectChain());

    return nextDestination;
  }, []);

  /**
   * Handles completion of the current page
   */
  const handlePageCompletion = useCallback(() => {
    const normalizedPath = pathname?.replace(/^\/[a-z]{2}/, '') || pathname || '';
    const nextDestination = RedirectChainService.handlePageCompletion(normalizedPath);

    // Update local state
    const updatedChain = RedirectChainService.getCurrentChain();
    setChain(updatedChain);
    setIsInChain(RedirectChainService.isInRedirectChain());

    return nextDestination;
  }, [pathname]);

  /**
   * Clears the current chain
   */
  const clearChain = useCallback(() => {
    RedirectChainService.clearChain();
    setChain(null);
    setIsInChain(false);
  }, []);

  /**
   * Forces completion of the chain
   */
  const forceComplete = useCallback(() => {
    const destination = RedirectChainService.forceComplete();
    setChain(null);
    setIsInChain(false);
    return destination;
  }, []);

  return {
    // State
    chain,
    isInChain,

    // Information
    getProgress,
    getChainInfo,
    isCurrentPageInChain,
    validateCurrentStep,

    // Actions
    advanceToNextStep,
    skipCurrentStep,
    handlePageCompletion,
    clearChain,
    forceComplete,
  };
}
