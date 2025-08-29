/**
 * BrainChase Page tests
 * Framework: Jest + React Testing Library
 * Focus: UI states and interactions defined in page.tsx (loading, error, game controls, modals, QuestionArea props).
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// --- Mocks & Test Harness ---

// Keep test-scoped search params to emulate next/navigation
const BC_searchParams: Record<string, string | null> = { topicId: null };

// Minimal translator: returns the key passed from the caller
jest.mock('next-intl', () => ({
  useTranslations: () => ((k: string) => k),
}));

// Mock next/navigation search params
jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (k: string) => BC_searchParams[k] ?? null,
  }),
}));

// Replace shadcn/ui Button with a simple button
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, size, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

// Replace Tooltip components with passthroughs (always render content for test visibility)
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <span>{children}</span>,
}));

// Icons -> text so buttons have accessible names
jest.mock('lucide-react', () => ({
  Settings: (props: any) => <span {...props}>Settings</span>,
  Play: (props: any) => <span {...props}>Play</span>,
  Pause: (props: any) => <span {...props}>Pause</span>,
  RefreshCw: (props: any) => <span {...props}>Shuffle</span>,
  ArrowLeft: (props: any) => <span {...props}>Back</span>,
}));

// Child components -> stubs
jest.mock('./components/GameArea', () => ({
  __esModule: true,
  default: () => <div data-testid="game-area">GameArea</div>,
}));
jest.mock('./components/Setting', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-modal" />,
}));
jest.mock('./components/QuestionArea', () => ({
  __esModule: true,
  default: ({ question, currentQuestionNumber }: any) => (
    <div data-testid="question-area">{String(question)}|{currentQuestionNumber}</div>
  ),
}));

// Context hook/provider -> mocked
jest.mock('./context/brainChaseContext', () => {
  const React = require('react');
  return {
    useBrainChase: jest.fn(),
    BrainChaseProvider: jest.fn(({ children }: any) => <>{children}</>),
  };
});
import * as BC_ctx from './context/brainChaseContext';

// Default context state
const BC_defaultCtx = {
  gameActive: false,
  gamePaused: false,
  togglePause: jest.fn(),
  currentQuestion: 'What is 2+2?',
  score: 0,
  settings: { questionCount: 10 },
  currentQuestionIndex: 0,
  setShowSettings: jest.fn(),
  startGame: jest.fn(),
  resetGame: jest.fn(),
  handleShuffledQuestionGame: jest.fn(),
  isLoading: false,
  loadError: false,
  topicId: null as string | null,
  topicInfo: null as any,
};

function BC_setUseBrainChase(overrides: Partial<typeof BC_defaultCtx> = {}) {
  (BC_ctx.useBrainChase as jest.Mock).mockReturnValue({ ...BC_defaultCtx, ...overrides });
}

function BC_setSearchParams(params: Record<string, string | null>) {
  Object.assign(BC_searchParams, params);
}

// Import page after setting mocks/params each time to ensure fresh render state
function BC_renderPage() {
  jest.resetModules();
  const Page = require('./page').default;
  return render(<Page />);
}

beforeEach(() => {
  jest.clearAllMocks();
  BC_setSearchParams({ topicId: null });
});

// --- Tests ---

describe('BrainChase Page', () => {
  test('shows loading state when isLoading is true', () => {
    BC_setUseBrainChase({ isLoading: true });
    BC_renderPage();

    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.getByText('loadingMessage')).toBeInTheDocument();
  });

  test('shows error state and reloads on "tryAgain" click', () => {
    BC_setUseBrainChase({ loadError: new Error('fail') });
    const reloadSpy = jest.fn();
    // Patch window.location.reload
    // @ts-ignore
    delete (window as any).location;
    // @ts-ignore
    (window as any).location = { reload: reloadSpy };

    BC_renderPage();

    expect(screen.getByText('errorTitle')).toBeInTheDocument();
    expect(screen.getByText('errorMessage')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'tryAgain' }));
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  test('landing screen renders title/description and Start button invokes startGame', () => {
    const startSpy = jest.fn();
    BC_setUseBrainChase({ startGame: startSpy, gameActive: false });

    BC_renderPage();

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'start' }));
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  test('landing screen shows topic details when topicId present', () => {
    BC_setUseBrainChase({
      gameActive: false,
      topicId: 'topic-123',
      topicInfo: { name: 'Algebra' },
    });

    BC_renderPage();

    expect(screen.getByText(/Topic:/)).toBeInTheDocument();
    expect(screen.getByText(/Algebra/)).toBeInTheDocument();
  });

  test('game area renders with controls; pause button calls togglePause', () => {
    const pauseSpy = jest.fn();
    BC_setUseBrainChase({ gameActive: true, gamePaused: false, togglePause: pauseSpy });

    BC_renderPage();

    expect(screen.getByTestId('game-area')).toBeInTheDocument();
    // Tooltip content shows current action
    expect(screen.getByText('pause')).toBeInTheDocument();

    // Button labeled by icon text
    fireEvent.click(screen.getByRole('button', { name: 'Pause' }));
    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('when paused, shows Play icon and "resume" tooltip', () => {
    const pauseSpy = jest.fn();
    BC_setUseBrainChase({ gameActive: true, gamePaused: true, togglePause: pauseSpy });

    BC_renderPage();

    expect(screen.getByText('resume')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Play' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(pauseSpy).toHaveBeenCalledTimes(1);
  });

  test('shuffle button triggers handleShuffledQuestionGame', () => {
    const shuffleSpy = jest.fn();
    BC_setUseBrainChase({ gameActive: true, handleShuffledQuestionGame: shuffleSpy });

    BC_renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Shuffle' }));
    expect(shuffleSpy).toHaveBeenCalledTimes(1);
  });

  test('reset (Back) and Settings buttons call respective handlers', () => {
    const resetSpy = jest.fn();
    const settingsSpy = jest.fn();
    BC_setUseBrainChase({ gameActive: true, resetGame: resetSpy, setShowSettings: settingsSpy });

    BC_renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(resetSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Settings' }));
    expect(settingsSpy).toHaveBeenCalledTimes(1);
  });

  test('QuestionArea shows empty question when inactive and actual question when active', () => {
    // Inactive: question prop should be empty string
    BC_setUseBrainChase({ gameActive: false, currentQuestion: 'What is 2+2?', currentQuestionIndex: 0 });
    BC_renderPage();
    expect(screen.getByTestId('question-area')).toHaveTextContent('^\\|1$'); // ""|1
    // Re-render active
    jest.clearAllMocks();
    BC_setUseBrainChase({ gameActive: true, currentQuestion: 'What is 2+2?', currentQuestionIndex: 0 });
    BC_renderPage();
    expect(screen.getByTestId('question-area')).toHaveTextContent('What is 2\\+2\\?\\|1');
  });

  test('Game Over modal appears when !gameActive and score > 0; uses min(questionCount, 5)', () => {
    const startSpy = jest.fn();
    const quitSpy = jest.fn();
    BC_setUseBrainChase({
      gameActive: false,
      score: 3,
      settings: { questionCount: 10 }, // min(10, 5) = 5
      startGame: startSpy,
      resetGame: quitSpy,
    });

    BC_renderPage();

    expect(screen.getByText('gameOver')).toBeInTheDocument();
    const summary = screen.getByText((content) => content.includes('finalScore') && content.includes('3') && content.includes('5'));
    expect(summary).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'quit' }));
    expect(quitSpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'playAgain' }));
    expect(startSpy).toHaveBeenCalledTimes(1);
  });

  test('Page passes topicId from URL to BrainChaseProvider', () => {
    BC_setSearchParams({ topicId: 'xyz-789' });
    BC_setUseBrainChase({});
    BC_renderPage();

    const providerMock = BC_ctx.BrainChaseProvider as jest.Mock;
    expect(providerMock).toHaveBeenCalled();
    const firstCallProps = providerMock.mock.calls[0][0];
    expect(firstCallProps.topicId).toBe('xyz-789');
  });
});