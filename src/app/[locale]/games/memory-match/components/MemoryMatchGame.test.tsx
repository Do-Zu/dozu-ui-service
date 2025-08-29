/**
 * Tests for MemoryMatchGame component
 *
 * Test stack: Jest + @testing-library/react (project-standard).
 * If the repo uses Vitest, replace jest.fn with vi.fn and adjust mock syntax accordingly.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

// Mocks for Next.js router and i18n
jest.mock('next/navigation', () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => ((key: string) => {
    const map: Record<string, string> = {
      loading: 'Loading',
      loadingMessage: 'Please wait while we prepare your game.',
      errorTitle: 'Something went wrong',
      errorMessage: 'Unable to load the game.',
      tryAgain: 'Try Again',
      backToTopic: 'Back to Topic',
    };
    return map[key] ?? key;
  }),
}));

// Mock UI components to minimal click-through shells
jest.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
jest.mock('@/components/ui/card', () => ({
  Card: (p: any) => <div data-testid="card" {...p} />,
  CardContent: (p: any) => <div data-testid="card-content" {...p} />,
}));
jest.mock('@/components/ui/badge', () => ({
  Badge: (p: any) => <span data-testid="badge" {...p} />,
}));
// Render a progressbar with aria-valuenow for assertions
jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...rest }: any) => <div role="progressbar" aria-valuenow={value} data-testid="progress" {...rest} />,
}));

// Mock lucide-react icons as simple spans
jest.mock('lucide-react', () => new Proxy({}, { get: () => (props: any) => <span {...props} /> }));

// Mock child components
jest.mock('./MemoryGameBoard', () => () => <div data-testid="memory-board" />);
jest.mock('./GameStats', () => () => <div data-testid="game-stats" />);

// Dynamic mock for context to tailor per-test returns
const startGame = jest.fn();
const pauseGame = jest.fn();
const resumeGame = jest.fn();
const resetGame = jest.fn();
const getGameProgress = jest.fn();

const baseStats = {
  totalPairs: 10,
  matches: 3,
  moves: 7,
  score: 120,
  timeElapsed: 95, // 1:35
  accuracy: 42.5,
};

let mockContext: any = {
  gameStatus: 'idle',
  topicInfo: { name: 'Biology' },
  stats: baseStats,
  settings: {},
  isLoading: false,
  error: null,
  startGame,
  pauseGame,
  resumeGame,
  resetGame,
  getGameProgress,
};

jest.mock('../context/MemoryMatchContext', () => ({
  useMemoryMatch: () => mockContext,
}));

// Import after mocks
import MemoryMatchGame from './MemoryMatchGame';

const setContext = (overrides: Partial<typeof mockContext>) => {
  mockContext = { ...mockContext, ...overrides };
};

beforeEach(() => {
  jest.clearAllMocks();
  // Reset context defaults for each test
  setContext({
    gameStatus: 'idle',
    topicInfo: { name: 'Biology' },
    stats: { ...baseStats },
    settings: {},
    isLoading: false,
    error: null,
  });
  getGameProgress.mockReturnValue(30);
});

describe('MemoryMatchGame', () => {
  describe('loading state', () => {
    it('renders spinner and loading messages when isLoading is true', () => {
      setContext({ isLoading: true });
      render(<MemoryMatchGame />);
      expect(screen.getByText('Loading')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we prepare your game.')).toBeInTheDocument();
      // progress, board, or stats should not be present
      expect(screen.queryByTestId('memory-board')).not.toBeInTheDocument();
      expect(screen.queryByTestId('game-stats')).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows error UI and allows retry (reload) and back navigation', () => {
      const back = jest.fn();
      (require('next/navigation') as any).useRouter = () => ({ back });

      const reloadSpy = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { reload: reloadSpy },
        writable: true,
      });

      setContext({ error: new Error('Network'), isLoading: false });
      render(<MemoryMatchGame />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Unable to load the game.')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Try Again'));
      expect(reloadSpy).toHaveBeenCalled();

      fireEvent.click(screen.getByText('Back to Topic'));
      expect(back).toHaveBeenCalled();
    });
  });

  describe('failed state', () => {
    it('renders failure UI and back button when gameStatus is failed', () => {
      const back = jest.fn();
      (require('next/navigation') as any).useRouter = () => ({ back });

      setContext({ gameStatus: 'failed', error: null });
      render(<MemoryMatchGame />);

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Unable to load the game.')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Back to Topic'));
      expect(back).toHaveBeenCalled();
    });
  });

  describe('header and progress', () => {
    it('shows header with topic info and progress bar value', () => {
      setContext({ gameStatus: 'idle', topicInfo: { name: 'Physics' } });
      getGameProgress.mockReturnValue(55);

      render(<MemoryMatchGame />);
      expect(screen.getByText('Memory Match')).toBeInTheDocument();
      expect(screen.getByText(/Topic:\s*Physics/)).toBeInTheDocument();

      const pb = screen.getByRole('progressbar');
      expect(pb).toHaveAttribute('aria-valuenow', '55');
      expect(screen.getByText(/3\/10 pairs matched/)).toBeInTheDocument();
    });

    it('falls back to title then Unknown for topicInfo', () => {
      setContext({ gameStatus: 'idle', topicInfo: { title: 'Chemistry 101', name: '' as unknown as string } });
      render(<MemoryMatchGame />);
      expect(screen.getByText(/Topic:\s*Chemistry 101/)).toBeInTheDocument();

      setContext({ gameStatus: 'idle', topicInfo: undefined as any });
      render(<MemoryMatchGame />);
      // Paragraph absent when topicInfo is undefined
      expect(screen.queryByText(/Topic:/)).not.toBeInTheDocument();
    });
  });

  describe('start screen (idle/ready)', () => {
    it('renders Start Game and calls startGame on click', () => {
      setContext({ gameStatus: 'idle' });
      render(<MemoryMatchGame />);

      const btn = screen.getByRole('button', { name: /Start Game/i });
      fireEvent.click(btn);
      expect(startGame).toHaveBeenCalled();
    });

    it('also renders Start Game when ready', () => {
      setContext({ gameStatus: 'ready' });
      render(<MemoryMatchGame />);
      expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
    });
  });

  describe('game area - playing', () => {
    it('shows Playing badge, timer, Pause and Reset buttons; actions call handlers', () => {
      setContext({
        gameStatus: 'playing',
        stats: { ...baseStats, timeElapsed: 95 }, // 1:35
      });
      render(<MemoryMatchGame />);

      expect(screen.getAllByTestId('badge').some(el => el.textContent?.match(/Playing/))).toBe(true);
      // Timer badge should show 1:35
      expect(screen.getByText(/1:35/)).toBeInTheDocument();

      // Board and stats panel
      expect(screen.getByTestId('memory-board')).toBeInTheDocument();
      expect(screen.getByTestId('game-stats')).toBeInTheDocument();

      // Pause
      const pauseButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg,h4,span') || true);
      // More robust: find the first button with title-less but present - click the one before reset
      const pauseBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('Pause') || b.querySelector('[data-lucide="pause"]') || b.getAttribute('aria-label') === 'Pause') || screen.getAllByRole('button')[0];
      fireEvent.click(pauseBtn);
      expect(pauseGame).toHaveBeenCalled();

      // Reset
      const resetBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('Rotate') || b.querySelector('[data-lucide="rotate-ccw"]') || b.getAttribute('aria-label') === 'Reset') || screen.getAllByRole('button').slice(-1)[0];
      fireEvent.click(resetBtn);
      expect(resetGame).toHaveBeenCalled();
    });
  });

  describe('game area - paused', () => {
    it('shows Paused badge and Resume button; clicking resume resumes the game', () => {
      setContext({ gameStatus: 'paused' });
      render(<MemoryMatchGame />);

      expect(screen.getAllByTestId('badge').some(el => el.textContent?.match(/Paused/))).toBe(true);

      const resumeBtn = screen.getAllByRole('button').find(b => b.innerHTML.includes('Play') || b.querySelector('[data-lucide="play"]') || b.getAttribute('aria-label') === 'Resume') || screen.getAllByRole('button')[0];
      fireEvent.click(resumeBtn);
      expect(resumeGame).toHaveBeenCalled();
    });
  });

  describe('completed modal', () => {
    it('shows completion stats and allows Play Again and Back to Flashcards actions', () => {
      const back = jest.fn();
      (require('next/navigation') as any).useRouter = () => ({ back });

      setContext({
        gameStatus: 'completed',
        stats: {
          totalPairs: 10,
          matches: 10,
          moves: 20,
          score: 500,
          timeElapsed: 142, // 2:22
          accuracy: 88.9,
        },
      });

      render(<MemoryMatchGame />);

      expect(screen.getByText('Congratulations!')).toBeInTheDocument();
      expect(screen.getByText(/You completed all 10 pairs!/)).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument(); // Final Score
      expect(screen.getByText('20')).toBeInTheDocument(); // Total Moves
      expect(screen.getByText('2:22')).toBeInTheDocument(); // Time
      expect(screen.getByText(/88\.9%/)).toBeInTheDocument(); // Accuracy

      fireEvent.click(screen.getByRole('button', { name: /Play Again/i }));
      expect(resetGame).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /Back to Flashcards/i }));
      expect(back).toHaveBeenCalled();
    });
  });
});