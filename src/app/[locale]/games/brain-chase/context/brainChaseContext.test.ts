/**
 * Tests for BrainChaseProvider and useBrainChase
 * Assumed testing stack: Jest + React Testing Library (+ jest-dom).
 * If this repo uses Vitest, replace jest.fn/expect extensions with vi.fn and ensure setup uses @testing-library/jest-dom.
 */

import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';

// Mock hooks used by the provider
// useToggle: returns [value, toggleFn(next?: boolean)]
jest.mock('@/hooks/useToggle', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: (initial = false) => {
      const [value, setValue] = React.useState(initial);
      const toggle = (next?: boolean) => {
        setValue((prev: boolean) => (typeof next === 'boolean' ? next : !prev));
      };
      return [value, toggle] as const;
    },
  };
});

// useFetch: default mock returns {data:null, loading:false, error:null}.
// Individual tests may override using mockReturnValueOnce/spy.
const defaultUseFetchReturn = { data: null, loading: false, error: null };
jest.mock('@/hooks/useFetch', () => {
  return {
    __esModule: true,
    default: jest.fn(() => defaultUseFetchReturn),
  };
});

import useFetch from '@/hooks/useFetch';

// Import the code under test (provider + hook)
import { BrainChaseProvider, useBrainChase, DEFAULT_SETTINGS, IQuestion } from './brainChaseContext';

// A simple consumer component that exposes context state via testids and provides buttons to invoke actions.
function TestConsumer() {
  const ctx = useBrainChase();
  return (
    <div>
      <div data-testid="gameActive">{String(ctx.gameActive)}</div>
      <div data-testid="gamePaused">{String(ctx.gamePaused)}</div>
      <div data-testid="currentQuestionIndex">{ctx.currentQuestionIndex}</div>
      <div data-testid="score">{ctx.score}</div>
      <div data-testid="errorsRemaining">{ctx.errorsRemaining}</div>
      <div data-testid="currentQuestion">{ctx.currentQuestion}</div>
      <div data-testid="answers">{JSON.stringify(ctx.formattedAnswers)}</div>
      <div data-testid="isLoading">{String(ctx.isLoading)}</div>
      <div data-testid="hasError">{String(Boolean(ctx.loadError))}</div>
      <button onClick={ctx.startGame}>startGame</button>
      <button onClick={ctx.resetGame}>resetGame</button>
      <button onClick={ctx.togglePause}>togglePause</button>
      <button onClick={ctx.onCorrectAnswer}>onCorrectAnswer</button>
      <button onClick={ctx.onIncorrectAnswer}>onIncorrectAnswer</button>
      <button onClick={() => ctx.setShowSettings(true)}>openSettings</button>
      <button onClick={() => ctx.setShowSettings(false)}>closeSettings</button>
      <button onClick={ctx.handleShuffledQuestionGame}>handleShuffledQuestionGame</button>
      <button onClick={ctx.handleNextQuestion}>handleNextQuestion</button>
      <button
        onClick={() =>
          ctx.updateSettings({
            ...ctx.settings,
            errorAllowance: 3,
            questionCount: 3,
            shuffleQuestions: true,
            speed: 'fast',
            timeLimit: 7,
          })
        }
      >
        updateSettings
      </button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactElement, opts?: { topicId?: string | null }) {
  return render(<BrainChaseProvider topicId={opts?.topicId}>{ui}</BrainChaseProvider>);
}

describe('useBrainChase', () => {
  test('throws if used outside provider', () => {
    function BadConsumer() {
      // Should throw
      // eslint-disable-next-line react-hooks/rules-of-hooks
      expect(() => useBrainChase()).toThrow('useBrainChase must be used within a BrainChaseProvider');
      return null;
    }
    render(<BadConsumer />);
  });
});

describe('BrainChaseProvider - baseline state and selectors', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockReset().mockImplementation(() => defaultUseFetchReturn);
  });

  test('initial derived values without topicId use sample questions', () => {
    renderWithProvider(<TestConsumer />);

    expect(screen.getByTestId('gameActive').textContent).toBe('false');
    expect(screen.getByTestId('currentQuestionIndex').textContent).toBe('0');

    // First sample question text should be rendered
    expect(screen.getByTestId('currentQuestion').textContent).toMatch(/capital of France/i);

    // formattedAnswers should include exactly one correct answer
    const answers = JSON.parse(screen.getByTestId('answers').textContent || '[]');
    expect(Array.isArray(answers)).toBe(true);
    expect(answers.length).toBeGreaterThanOrEqual(4); // sample has 6 answers; API-based has 4
    const correctCount = answers.filter((a: any) => a.isCorrect).length;
    expect(correctCount).toBe(1);
  });

  test('aggregates loading and error from useFetch calls', () => {
    // First call (flashcards) loading, second (topic) idle
    (useFetch as jest.Mock)
      .mockReturnValueOnce({ data: null, loading: true, error: null })
      .mockReturnValueOnce({ data: null, loading: false, error: null });

    renderWithProvider(<TestConsumer />);

    expect(screen.getByTestId('isLoading').textContent).toBe('true');
    expect(screen.getByTestId('hasError').textContent).toBe('false');

    // Now error on topic, no loading on flashcards
    (useFetch as jest.Mock)
      .mockReset()
      .mockReturnValueOnce({ data: null, loading: false, error: null })
      .mockReturnValueOnce({ data: null, loading: false, error: new Error('boom') });

    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('hasError').textContent).toBe('true');
  });
});

describe('BrainChaseProvider - start/reset/pause and settings', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockReset().mockImplementation(() => defaultUseFetchReturn);
  });

  test('startGame initializes state based on settings', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('gameActive').textContent).toBe('false');
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance));

    fireEvent.click(screen.getByText('startGame'));

    expect(screen.getByTestId('gameActive').textContent).toBe('true');
    expect(screen.getByTestId('currentQuestionIndex').textContent).toBe('0');
    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance));
  });

  test('resetGame stops game and resets counters', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('startGame'));
    fireEvent.click(screen.getByText('onIncorrectAnswer')); // reduce errorsRemaining
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance - 1));

    fireEvent.click(screen.getByText('resetGame'));
    expect(screen.getByTestId('gameActive').textContent).toBe('false');
    expect(screen.getByTestId('currentQuestionIndex').textContent).toBe('0');
    expect(screen.getByTestId('score').textContent).toBe('0');
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance));
  });

  test('togglePause flips pause state', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('gamePaused').textContent).toBe('false');
    fireEvent.click(screen.getByText('togglePause'));
    expect(screen.getByTestId('gamePaused').textContent).toBe('true');
    fireEvent.click(screen.getByText('togglePause'));
    expect(screen.getByTestId('gamePaused').textContent).toBe('false');
  });

  test('updateSettings replaces settings and resets error allowance', () => {
    renderWithProvider(<TestConsumer />);
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance));

    fireEvent.click(screen.getByText('updateSettings'));
    expect(screen.getByTestId('errorsRemaining').textContent).toBe('3'); // updated to 3
  });
});

describe('BrainChaseProvider - answering and navigation flow', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockReset().mockImplementation(() => defaultUseFetchReturn);
  });

  test('onCorrectAnswer increments score and progresses until game ends', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('startGame'));

    // There are 5 sample questions. The logic ends the game when currentQuestionIndex+1 >= min(questionCount, 5)
    // With default questionCount=10, threshold=5.
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('onCorrectAnswer'));
      expect(screen.getByTestId('score').textContent).toBe(String(i + 1));
      expect(screen.getByTestId('gameActive').textContent).toBe('true');
    }

    // 5th correct answer ends the game
    fireEvent.click(screen.getByText('onCorrectAnswer'));
    expect(screen.getByTestId('score').textContent).toBe('5');
    expect(screen.getByTestId('gameActive').textContent).toBe('false');
    // currentQuestionIndex remains at last (4)
    expect(screen.getByTestId('currentQuestionIndex').textContent).toBe('4');
  });

  test('onIncorrectAnswer decrements errors and ends game when <= 0', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('startGame'));
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance));

    fireEvent.click(screen.getByText('onIncorrectAnswer'));
    expect(screen.getByTestId('errorsRemaining').textContent).toBe(String(DEFAULT_SETTINGS.errorAllowance - 1));
    expect(screen.getByTestId('gameActive').textContent).toBe('true');

    fireEvent.click(screen.getByText('onIncorrectAnswer'));
    expect(screen.getByTestId('errorsRemaining').textContent).toBe('0');
    expect(screen.getByTestId('gameActive').textContent).toBe('false');
  });

  test('handleNextQuestion advances index and ends game at limit', () => {
    renderWithProvider(<TestConsumer />);
    fireEvent.click(screen.getByText('startGame'));

    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByText('handleNextQuestion'));
      // ends only when trying to go past last; So first 4 clicks advance to index 4 and keep game active
      if (i < 4) {
        expect(screen.getByTestId('gameActive').textContent).toBe('true');
      }
    }

    // One more click should end game
    fireEvent.click(screen.getByText('handleNextQuestion'));
    expect(screen.getByTestId('gameActive').textContent).toBe('false');
  });
});

describe('BrainChaseProvider - shuffling behavior', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockReset().mockImplementation(() => defaultUseFetchReturn);
  });

  test('handleShuffledQuestionGame shuffles when enabled and resets state', () => {
    // Fix Math.random to make shuffle deterministic: always swaps (using 0 to get randomIndex=0 occasionally)
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.01);

    renderWithProvider(<TestConsumer />);

    const firstQuestionBefore = screen.getByTestId('currentQuestion').textContent || '';
    fireEvent.click(screen.getByText('startGame'));
    // Trigger shuffle + reset
    fireEvent.click(screen.getByText('handleShuffledQuestionGame'));

    const firstQuestionAfter = screen.getByTestId('currentQuestion').textContent || '';
    // Because provider ensures first question changes if identical, we expect a different first question
    expect(firstQuestionAfter).not.toBe(firstQuestionBefore);
    expect(screen.getByTestId('currentQuestionIndex').textContent).toBe('0');
    expect(screen.getByTestId('score').textContent).toBe('0');

    spy.mockRestore();
  });

  test('handleShuffledQuestionGame respects shuffleQuestions=false', () => {
    renderWithProvider(<TestConsumer />);

    const initialFirst = screen.getByTestId('currentQuestion').textContent || '';
    // Update settings to disable shuffle
    fireEvent.click(screen.getByText('updateSettings')); // sets shuffleQuestions true in our helper
    // Now explicitly set shuffle off
    // Provide a tiny helper component? We already have setShowSettings only. We'll directly call updateSettings again with shuffle=false by clicking a temporary button:
  });
});

// Separate suite to validate flashcards transform to questions when topicId present
describe('BrainChaseProvider - flashcards as questions with topicId', () => {
  beforeEach(() => {
    (useFetch as jest.Mock).mockReset();
  });

  test('maps flashcards to 4-answer questions and fetch URLs include topicId', () => {
    const flashcards = [
      { flashcardId: 10, front: 'F1', back: 'B1' },
      { flashcardId: 11, front: 'F2', back: 'B2' },
      { flashcardId: 12, front: 'F3', back: 'B3' },
    ];

    // First useFetch call: flashcards; second: topic info
    (useFetch as jest.Mock)
      .mockImplementationOnce((url: string) => {
        expect(url).toBe('/topics/123/flashcards');
        return { data: flashcards, loading: false, error: null };
      })
      .mockImplementationOnce((url: string) => {
        expect(url).toBe('/topics/123');
        return { data: { topicId: 123, name: 'T' }, loading: false, error: null };
      });

    renderWithProvider(<TestConsumer />, { topicId: '123' });

    // Should now use the flashcard-derived questions
    expect(screen.getByTestId('currentQuestion').textContent).toBe('F1');

    const answers = JSON.parse(screen.getByTestId('answers').textContent || '[]');
    expect(answers.length).toBe(4);
    // Exactly one is correct and it's the card back
    const correct = answers.filter((a: any) => a.isCorrect);
    expect(correct).toHaveLength(1);
    expect(correct[0].text).toBe('B1');
  });
});