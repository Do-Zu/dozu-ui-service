import { User, UserType } from '@/types/auth';
import { ROUTES } from '@/utils/constants/routes';
import { getUserType } from './redirectService';

/**
 * Interface for redirect chain configuration
 */
export interface RedirectChain {
  steps: string[];
  currentStepIndex: number;
  finalDestination: string;
  originalDestination: string;
}

/**
 * Service for managing complex redirect chains with intermediate pages
 *
 */
export class RedirectChainService {
  private static readonly REDIRECT_CHAIN_KEY = 'auth_redirect_chain';

  /**
   * Gets the required intermediate pages for a user type
   */
  private static getRequiredSteps(userType: UserType): string[] {
    switch (userType) {
      case 'new_user':
        return [ROUTES.WELCOME, ROUTES.ONBOARDING];
      case 'returning_user':
        return [ROUTES.ONBOARDING];
      case 'onboarded_user':
        return [];
      default:
        return [ROUTES.WELCOME];
    }
  }

  /**
   * Creates a redirect chain for post-login navigation
   */
  static createPostLoginChain(user: User, originalDestination?: string): RedirectChain {
    const userType = getUserType(true, user);
    const requiredSteps = this.getRequiredSteps(userType);
    const finalDestination = originalDestination || ROUTES.HOME;

    const chain: RedirectChain = {
      steps: requiredSteps,
      currentStepIndex: 0,
      finalDestination,
      originalDestination: originalDestination || '',
    };

    // Store the chain in sessionStorage for persistence across page reloads
    this.storeChain(chain);

    return chain;
  }

  /**
   * Gets the current redirect chain from storage
   */
  static getCurrentChain(): RedirectChain | null {
    try {
      const stored = sessionStorage.getItem(this.REDIRECT_CHAIN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading redirect chain:', error);
      return null;
    }
  }

  /**
   * Stores the redirect chain in sessionStorage
   */
  static storeChain(chain: RedirectChain): void {
    try {
      sessionStorage.setItem(this.REDIRECT_CHAIN_KEY, JSON.stringify(chain));
    } catch (error) {
      console.error('Error storing redirect chain:', error);
    }
  }

  /**
   * Gets the next step in the redirect chain
   */
  static getNextStep(): string | null {
    const chain = this.getCurrentChain();

    if (!chain || chain.currentStepIndex >= chain.steps.length) {
      // No more steps, return final destination
      return chain?.finalDestination || null;
    }

    return chain.steps[chain.currentStepIndex];
  }

  /**
   * Advances to the next step in the chain
   */
  static advanceToNextStep(): string | null {
    const chain = this.getCurrentChain();

    if (!chain) {
      return null;
    }

    chain.currentStepIndex++;
    this.storeChain(chain);

    // Check if we've completed all steps
    if (chain.currentStepIndex >= chain.steps.length) {
      // Clear the chain and return final destination
      this.clearChain();
      return chain.finalDestination;
    }

    // Return next step
    return chain.steps[chain.currentStepIndex];
  }

  /**
   * Skips the current step and moves to the next
   */
  static skipCurrentStep(): string | null {
    return this.advanceToNextStep();
  }

  /**
   * Checks if user is currently in a redirect chain
   */
  static isInRedirectChain(): boolean {
    const chain = this.getCurrentChain();
    return chain !== null && chain.currentStepIndex < chain.steps.length;
  }

  /**
   * Checks if the current page is part of the redirect chain
   */
  static isCurrentPageInChain(currentPath: string): boolean {
    const chain = this.getCurrentChain();

    if (!chain) {
      return false;
    }

    return chain.steps.includes(currentPath);
  }

  /**
   * Gets the completion progress of the redirect chain
   */
  static getProgress(): { completed: number; total: number; percentage: number } {
    const chain = this.getCurrentChain();

    if (!chain) {
      return { completed: 0, total: 0, percentage: 100 };
    }

    const completed = chain.currentStepIndex;
    const total = chain.steps.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 100;

    return { completed, total, percentage };
  }

  /**
   * Clears the current redirect chain
   */
  static clearChain(): void {
    try {
      sessionStorage.removeItem(this.REDIRECT_CHAIN_KEY);
    } catch (error) {
      console.error('Error clearing redirect chain:', error);
    }
  }

  /**
   * Forces completion of the redirect chain (emergency exit)
   */
  static forceComplete(): string {
    const chain = this.getCurrentChain();
    const destination = chain?.finalDestination || ROUTES.HOME;
    this.clearChain();
    return destination;
  }

  /**
   * Gets information about the redirect chain for debugging
   */
  static getChainInfo(): {
    hasChain: boolean;
    currentStep: string | null;
    nextStep: string | null;
    finalDestination: string | null;
    progress: { completed: number; total: number; percentage: number };
  } {
    const chain = this.getCurrentChain();
    const progress = this.getProgress();

    return {
      hasChain: chain !== null,
      currentStep: chain?.steps[chain.currentStepIndex] || null,
      nextStep: this.getNextStep(),
      finalDestination: chain?.finalDestination || null,
      progress,
    };
  }

  /**
   * Validates that the user should be on the current step
   */
  static validateCurrentStep(currentPath: string, user: User): boolean {
    const chain = this.getCurrentChain();

    if (!chain) {
      return true; // No chain means no restrictions
    }

    const userType = getUserType(true, user);
    const expectedStep = this.getNextStep();

    // If we're at the final destination and no more steps, it's valid
    if (!expectedStep) {
      return currentPath === chain.finalDestination;
    }

    // Check if current path matches expected step
    return currentPath === expectedStep;
  }

  /**
   * Handles page completion and returns next destination
   */
  static handlePageCompletion(currentPath: string): string | null {
    const chain = this.getCurrentChain();

    if (!chain || !chain.steps.includes(currentPath)) {
      return null; // Not part of a chain
    }

    // Find current step index
    const currentStepIndex = chain.steps.indexOf(currentPath);

    if (currentStepIndex === chain.currentStepIndex) {
      // This is the expected step, advance to next
      return this.advanceToNextStep();
    }

    return null; // Not the expected step
  }
}
