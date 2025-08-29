/**
 * Tests for Page (flashcards browse)
 * Framework/Libraries: React Testing Library + Jest/Vitest (jsdom)
 * Focus: Diff-specified Page behaviors — param handling, loading/error/empty states, navigation via keyboard, flip behavior with cardRef,
 * shuffle logic determinism, and autoplay timers via StudyControls callbacks.
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Use jest or vitest globals depending on environment
const mockFn = (global as any).vi?.fn || (global as any).jest?.fn;
const useFakeTimers =
  (global as any).vi?.useFakeTimers?.bind((global as any).vi) ||
  (global as any).jest?.useFakeTimers?.bind((global as any).jest);
const useRealTimers =
  (global as any).vi?.useRealTimers?.bind((global as any).vi) ||
  (global as any).jest?.useRealTimers?.bind((global as any).jest);
const advanceTimersByTime =
  (global as any).vi?.advanceTimersByTime?.bind((global as any).vi) ||
  (global as any).jest?.advanceTimersByTime?.bind((global as any).jest);
const spyOn = (global as any).vi?.spyOn || (global as any).jest?.spyOn;

// --- Module mocks ---

// Mock next/navigation hooks
jest.mock('next/navigation', () => {
  return {
    useParams: mockFn(),
    useRouter: () => ({ push: mockFn() }),
  };
});

// Mock next-intl translation hook to return key
jest.mock('next-intl', () => {
  return {
    useTranslations: () => ((k: string) => k),
  };
});

// Mock routes utils; ensure functions exist
jest.mock('@/utils/constants/routes', () => ({
  ROUTES: {
    FLASHCARDS_EDIT: (topicId: string) => `/flashcards/${topicId}/edit`,
    FLASHCARDS_LEARNING: (topicId: string) => `/flashcards/${topicId}/learning`,
    FLASHCARDS_BRAIN_CHASE: (topicId: string) => `/flashcards/${topicId}/brain-chase`,
    FLASHCARDS_MEMORY_MATCH: (topicId: string) => `/flashcards/${topicId}/memory`,
  },
}));

// Mock toast helper for add image handler (defensive)
jest.mock('@/utils/toast.helper', () => ({
  __esModule: true,
  default: {
    showErrorMessage: mockFn(),
  },
}));

// Mock flashcard service and useFetch hook to control loading/data/error
const mockGetFlashcardsForTopic = mockFn();

jest.mock('@/services/flashcard/flashcard.service', () => ({
  __esModule: true,
  default: {
    getFlashcardsForTopic: (...args: any[]) => mockGetFlashcardsForTopic(...args),
  },
}));

type UseFetchResult<T> = {
  data: T | null | undefined;
  loading: boolean;
  error: string | null;
};
// Default impl: overwritten per test
const mockUseFetchImpl = mockFn<[], UseFetchResult<any>>();
jest.mock('@/hooks/useFetch', () => ({
  __esModule: true,
  default: () => mockUseFetchImpl(),
}));

// Mock nested components with minimal behavior that Page relies upon

// Flashcard needs to render an element tied to ref to allow Page to mutate style.transform,
// and must expose onClick to trigger handleManualFlip when needed.
jest.mock('../../components/Flashcard', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ cardRef, handleManualFlip, flashcard }: any) => (
      <div>
        <div data-testid="card" ref={cardRef as React.MutableRefObject<HTMLDivElement | null>} onClick={handleManualFlip}>
          {flashcard?.front || 'no-front'}
        </div>
      </div>
    ),
  };
});

// StudyControls must expose triggers that invoke the provided callbacks
jest.mock('../../components/StudyControls', () => {
  return {
    __esModule: true,
    default: (props: any) => (
      <div>
        <button data-testid="toggle-autoplay" onClick={props.handleOnChangeAutoPlayEnabled}>
          toggle-autoplay
        </button>
        <button data-testid="speed-1" onClick={() => props.handleOnChangeAutoPlaySpeed([1])}>
          speed-1
        </button>
        <button data-testid="toggle-shuffle" onClick={props.handleOnChangeShuffleEnabled}>
          toggle-shuffle
        </button>
        <button data-testid="reset-progress" onClick={props.handleResetProgress}>
          reset
        </button>
        <button data-testid="edit-flashcards" onClick={props.handleClickEditFlashcards}>
          edit
        </button>
        <div data-testid="index-indicator">
          {props.currentFlashcardIndex + 1} / {props.flashcardsLength}
        </div>
        {props.CustomElement}
      </div>
    ),
  };
});

// BackButton minimal mock
jest.mock('../../components/BackButton', () => ({
  __esModule: true,
  default: () => <button aria-label="back">Back</button>,
}));

// Import Page AFTER mocks
import Page from './page';

// Helpers
const buildFlashcards = (n: number) =>
  Array.from({ length: n }).map((_, i) => ({
    id: `f-${i + 1}`,
    front: `front-${i + 1}`,
    back: `back-${i + 1}`,
  }));

describe('Page (flashcards browse)', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    // Reset mocks
    mockGetFlashcardsForTopic.mockReset();
    mockUseFetchImpl.mockReset();

    // Default params
    const { useParams } = require('next/navigation') as { useParams: jest.Mock };
    useParams.mockReturnValue({ topicId: 't-1' });
  });

  it('renders message when topicId param is missing', () => {
    const { useParams } = require('next/navigation') as { useParams: jest.Mock };
    useParams.mockReturnValue({}); // missing
    mockUseFetchImpl.mockReturnValue({ data: null, loading: false, error: null });
    render(<Page />);
    expect(screen.getByText(/No topic id is provided/i)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseFetchImpl.mockReturnValue({ data: undefined, loading: true, error: null });
    render(<Page />);
    expect(screen.getByText(/Loading flashcards/i)).toBeInTheDocument();
  });

  it('shows error state with error message', () => {
    mockUseFetchImpl.mockReturnValue({ data: null, loading: false, error: 'boom' });
    render(<Page />);
    expect(screen.getByText(/Error:\s*boom/)).toBeInTheDocument();
  });

  it('shows empty state when no flashcards', () => {
    mockUseFetchImpl.mockReturnValue({ data: [], loading: false, error: null });
    render(<Page />);
    expect(screen.getByText(/No Flashcards to study/i)).toBeInTheDocument();
  });

  it('renders first flashcard and index indicator with loaded data', () => {
    const fc = buildFlashcards(3);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });
    render(<Page />);
    // Our Flashcard mock renders front text
    expect(screen.getByTestId('card')).toHaveTextContent('front-1');
    // Index indicator rendered by mocked StudyControls using props
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('1 / 3');
  });

  it('navigates next/back via keyboard and bounds correctly', async () => {
    const fc = buildFlashcards(2);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });
    render(<Page />);

    // Start at 1/2
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('1 / 2');

    // ArrowRight -> go to second
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('2 / 2');
    expect(screen.getByTestId('card')).toHaveTextContent('front-2');

    // ArrowRight again -> stays on second (no overflow)
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('2 / 2');

    // ArrowLeft -> back to first
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('1 / 2');
    expect(screen.getByTestId('card')).toHaveTextContent('front-1');

    // ArrowLeft again -> stays on first
    await user.keyboard('{ArrowLeft}');
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('1 / 2');
  });

  it('manual flip toggles card transform when autoplay disabled', async () => {
    const fc = buildFlashcards(1);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });
    render(<Page />);

    const card = screen.getByTestId('card') as HTMLDivElement;
    // Initial effect sets transform to rotateX(0deg)
    expect(card.style.transform).toBe('rotateX(0deg)');

    // Flip using Space key
    await user.keyboard(' ');
    expect(card.style.transform).toBe('rotateX(180deg)');

    // Flip back
    await user.keyboard(' ');
    expect(card.style.transform).toBe('rotateX(0deg)');
  });

  it('enables autoplay to flip and advance automatically, respecting timers and speed', async () => {
    useFakeTimers?.();
    const fc = buildFlashcards(3);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });
    render(<Page />);

    const toggleAutoplay = screen.getByTestId('toggle-autoplay');
    const speed1 = screen.getByTestId('speed-1');

    // Set speed to 1s to make timers faster
    await user.click(speed1);

    // Enable autoplay
    await user.click(toggleAutoplay);

    // On first cycle: initial wait equals speed (1s), then card flips and advances after another 1s
    await act(async () => {
      advanceTimersByTime?.(1000); // initial delay
    });
    // After initial delay, flip scheduled; simulate its timeout to advance next
    await act(async () => {
      advanceTimersByTime?.(1000); // initial flip -> advance to 2
    });
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('2 / 3');

    // Repeat: every 2*speed seconds, we flip then advance
    await act(async () => {
      advanceTimersByTime?.(2000); // flip+advance to 3
    });
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('3 / 3');

    // Final auto should disable at end; more time should not advance further
    await act(async () => {
      advanceTimersByTime?.(4000);
    });
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('3 / 3');

    useRealTimers?.();
  });

  it('reset progress sets index back to first item', async () => {
    const fc = buildFlashcards(2);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });
    render(<Page />);

    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('2 / 2');

    await user.click(screen.getByTestId('reset-progress'));
    expect(screen.getByTestId('index-indicator')).toHaveTextContent('1 / 2');
  });

  it('shuffle mode uses a deterministic random sequence (with mocked Math.random)', async () => {
    const fc = buildFlashcards(3);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });

    // Make Math.random deterministic to control shuffle order:
    // getRandomInt uses Math.random() * (max + 1) floored; here we return sequence that picks [2,0,1]
    const seq = [0.95, 0.05, 0.45]; // -> indexes 2,0,1 for max=2
    const origRandom = Math.random;
    let idx = 0;
    (Math as any).random = () => seq[idx++ % seq.length];

    render(<Page />);

    // Enable shuffle via mocked StudyControls
    await user.click(screen.getByTestId('toggle-shuffle'));

    // The first card under shuffle according to mocked order should be index 2 -> front-3
    expect(screen.getByTestId('card')).toHaveTextContent('front-3');

    // Advance to next shuffled card (index 0 -> front-1) via keyboard
    await user.keyboard('{ArrowRight}');
    expect(screen.getByTestId('card')).toHaveTextContent('front-1');

    // Cleanup
    (Math as any).random = origRandom;
  });

  it('clicking learning/game/memory buttons route to correct paths', async () => {
    const fc = buildFlashcards(1);
    mockUseFetchImpl.mockReturnValue({ data: fc, loading: false, error: null });

    // Spy on router push
    const { useRouter } = require('next/navigation');
    const pushSpy = mockFn();
    jest.spyOn({ useRouter } as any, 'useRouter').mockReturnValue({ push: pushSpy });

    render(<Page />);

    // Buttons rendered inside CustomElement in StudyControls mock:
    // It includes a "learning" button from renderLearningSection with translated text key 'learning'
    const learningBtn = await screen.findByRole('button', { name: /learning/i });
    await user.click(learningBtn);
    expect(pushSpy).toHaveBeenCalledWith('/flashcards/t-1/learning');

    // Brain Chase button (text literal in component)
    const brainBtn = await screen.findByRole('button', { name: /Brain Chase/i });
    await user.click(brainBtn);
    expect(pushSpy).toHaveBeenCalledWith('/flashcards/t-1/brain-chase');

    // Memory button
    const memoryBtn = await screen.findByRole('button', { name: /Memory/i });
    await user.click(memoryBtn);
    expect(pushSpy).toHaveBeenCalledWith('/flashcards/t-1/memory');
  });
});