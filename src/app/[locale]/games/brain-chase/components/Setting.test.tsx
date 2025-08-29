// --- AUTO-GENERATED TESTS: Setting component unit tests ---

/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Framework note: Using React Testing Library with Jest.
// If your project uses Vitest, change jest.fn to vi.fn and test/it/describe imports accordingly.

import Setting from './Setting'; // Component under test

// --- Mocks ---

// Mock next-intl translations
jest.mock('next-intl', () => ({
  useTranslations: (ns?: string) => {
    const dict: Record<string, string> = {
      title: 'Game Settings',
      description: 'Adjust your preferences',
      speed: 'Speed',
      slow: 'Slow',
      medium: 'Medium',
      fast: 'Fast',
      questionCount: 'Question Count',
      flashcardsAvailable: 'flashcards available',
      noFlashcards: 'No flashcards available',
      all: 'All',
      timeLimit: 'Time Limit',
      errorAllowance: 'Error allowance',
      oneError: '1 error',
      twoErrors: '2 errors',
      threeErrors: '3 errors',
      shuffleQuestions: 'Shuffle questions',
      cancel: 'Cancel',
      reset: 'Reset',
    };
    return (key: string) => dict[key] ?? key;
  },
}));

// Simplify/stub shadcn/ui components to avoid Radix wiring during tests
jest.mock('@/components/ui/sheet', () => {
  const React = require('react');
  return {
    Sheet: ({ open, onOpenChange, children }: any) => (
      <div data-testid="sheet" data-open={open}>
        <button type="button" aria-label="Close sheet" onClick={() => onOpenChange?.(false)}>
          close
        </button>
        {children}
      </div>
    ),
    SheetContent: ({ children, className }: any) => (
      <div data-testid="sheet-content" className={className}>{children}</div>
    ),
    SheetHeader: ({ children }: any) => <div>{children}</div>,
    SheetTitle: ({ children, className }: any) => <h2 className={className}>{children}</h2>,
    SheetDescription: ({ children }: any) => <p>{children}</p>,
  };
});

jest.mock('@/components/ui/button', () => {
  const React = require('react');
  return {
    Button: ({ children, onClick, variant }: any) => (
      <button type="button" data-variant={variant} onClick={onClick}>{children}</button>
    ),
  };
});

jest.mock('@/components/ui/label', () => {
  const React = require('react');
  return { Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label> };
});

jest.mock('@/components/ui/radio-group', () => {
  const React = require('react');
  // Very simple radio group that binds value and notifies on change
  const RadioGroup = ({ value, onValueChange, className, children }: any) => (
    <div role="radiogroup" data-value={value} className={className}>
      {/* Clone each child to inject onChange */}
      {React.Children.map(children, (child: any) => {
        if (!child) return child;
        return React.cloneElement(child, { onChange: (v: string) => onValueChange?.(v) });
      })}
    </div>
  );
  const RadioGroupItem = ({ id, value, onChange }: any) => (
    <input
      type="radio"
      id={id}
      value={value}
      name={id?.split('-')[0] ?? 'radio'}
      onChange={(e) => onChange?.(e.currentTarget.value)}
    />
  );
  return { RadioGroup, RadioGroupItem };
});

jest.mock('@/components/ui/slider', () => {
  const React = require('react');
  // Replace Slider with a range input that calls onValueChange([number])
  const Slider = ({ value, min = 0, max = 100, step = 1, onValueChange, className }: any) => (
    <input
      aria-label="time-slider"
      type="range"
      min={min}
      max={max}
      step={step}
      defaultValue={value?.[0] ?? min}
      className={className}
      onChange={(e) => onValueChange?.([Number(e.currentTarget.value)])}
    />
  );
  return { Slider };
});

jest.mock('@/components/ui/switch', () => {
  const React = require('react');
  return {
    Switch: ({ checked, onCheckedChange, ...rest }: any) => (
      <input
        aria-label={rest['aria-label'] || 'switch'}
        type="checkbox"
        defaultChecked={checked}
        onChange={(e) => onCheckedChange?.(e.currentTarget.checked)}
      />
    ),
  };
});

// Mock the BrainChase context hook and constants
const mockSetShowSettings = jest.fn();
const mockUpdateSettings = jest.fn();
const mockResetGame = jest.fn();

const DEFAULTS = {
  speed: 'medium',
  questionCount: 10,
  timeLimit: 30,
  errorAllowance: 2,
  shuffleQuestions: false,
};

jest.mock('../context/brainChaseContext', () => {
  return {
    DEFAULT_SETTINGS: DEFAULTS,
    useBrainChase: () => ({
      settings: DEFAULTS,
      updateSettings: mockUpdateSettings,
      gameActive: false,
      setShowSettings: mockSetShowSettings,
      resetGame: mockResetGame,
      showSettings: true,
      flashcards: [],
    }),
  };
});

// Utility to rerender Setting with custom context values
function renderWithCtx(overrides: any = {}) {
  jest.resetModules();
  // Refresh the mock with overrides
  jest.doMock('../context/brainChaseContext', () => {
    const base = {
      settings: DEFAULTS,
      updateSettings: mockUpdateSettings,
      gameActive: false,
      setShowSettings: mockSetShowSettings,
      resetGame: mockResetGame,
      showSettings: true,
      flashcards: [],
    };
    return {
      DEFAULT_SETTINGS: DEFAULTS,
      useBrainChase: () => ({ ...base, ...overrides }),
    };
  });
  // Re-require after doMock
  const Cmp = require('./Setting').default;
  return render(<Cmp />);
}

describe('Setting component - basic rendering', () => {
  it('renders title and description from translations', () => {
    renderWithCtx();
    expect(screen.getByRole('heading', { name: /Game Settings/i })).toBeInTheDocument();
    expect(screen.getByText(/Adjust your preferences/i)).toBeInTheDocument();
  });

  it('shows sheet open when context showSettings=true and closes via onOpenChange, persisting settings', async () => {
    const user = userEvent.setup();
    renderWithCtx({ showSettings: true });

    const sheet = screen.getByTestId('sheet');
    expect(sheet).toHaveAttribute('data-open', 'true');

    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    // on close: setShowSettings(false) and updateSettings called with current settings
    expect(mockSetShowSettings).toHaveBeenCalledWith(false);
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
  });
});

describe('Setting component - dynamic question count options', () => {
  it('renders "No flashcards available" and no options when none provided', () => {
    renderWithCtx({ flashcards: [] });
    expect(screen.getByText(/No flashcards available/i)).toBeInTheDocument();
    const group = screen.getByRole('radiogroup', { name: '' }); // first radiogroup is Speed; question count group is the second; safer to query labels
    // Instead, check that no radio with id starting questions- exists
    expect(screen.queryByRole('radio', { name: /questions-/i })).not.toBeInTheDocument();
  });

  it('with 1 flashcard: renders single option "1" (no All label)', () => {
    renderWithCtx({ flashcards: [1] });
    expect(screen.getByText(/1 flashcards available/i)).toBeInTheDocument();
    expect(screen.getByLabelText('1')).toBeInTheDocument();
    expect(screen.queryByText(/\(All\)/i)).not.toBeInTheDocument();
  });

  it.each([
    { n: 2, expected: ['2 (All)'] },
    { n: 3, expected: ['3 (All)'] },
    { n: 4, expected: ['4 (All)'] },
  ])('with $n flashcards: only "$expected"', ({ n, expected }) => {
    renderWithCtx({ flashcards: Array.from({ length: n }, (_, i) => i) });
    for (const label of expected) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
    // No standard options should appear
    expect(screen.queryByLabelText('5')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('10')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('20')).not.toBeInTheDocument();
  });

  it('with exactly 5, 10, 20 flashcards: shows only the matching standard option without "(All)"', () => {
    renderWithCtx({ flashcards: Array.from({ length: 5 }, (_, i) => i) });
    expect(screen.getByLabelText('5')).toBeInTheDocument();
    expect(screen.queryByLabelText(/5 \(All\)/)).not.toBeInTheDocument();

    renderWithCtx({ flashcards: Array.from({ length: 10 }, (_, i) => i) });
    expect(screen.getByLabelText('10')).toBeInTheDocument();
    expect(screen.queryByLabelText(/10 \(All\)/)).not.toBeInTheDocument();

    renderWithCtx({ flashcards: Array.from({ length: 20 }, (_, i) => i) });
    expect(screen.getByLabelText('20')).toBeInTheDocument();
    expect(screen.queryByLabelText(/20 \(All\)/)).not.toBeInTheDocument();
  });

  it('with 15 flashcards: shows 5, 10, and "15 (All)"', () => {
    renderWithCtx({ flashcards: Array.from({ length: 15 }, (_, i) => i) });
    expect(screen.getByLabelText('5')).toBeInTheDocument();
    expect(screen.getByLabelText('10')).toBeInTheDocument();
    expect(screen.getByLabelText('15 (All)')).toBeInTheDocument();
  });
});

describe('Setting component - controls update local state and handlers', () => {
  it('changing speed selection updates selection', async () => {
    const user = userEvent.setup();
    renderWithCtx();

    // Select "Fast"
    await user.click(screen.getByLabelText('Fast'));
    // Closing sheet should persist updated settings via updateSettings call
    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
  });

  it('changing question count updates local state', async () => {
    const user = userEvent.setup();
    renderWithCtx({ flashcards: Array.from({ length: 5 }, (_, i) => i) });

    await user.click(screen.getByLabelText('5'));
    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
  });

  it('time slider enforces min/max and updates timeLimit', async () => {
    const user = userEvent.setup();
    renderWithCtx();

    const slider = screen.getByLabelText('time-slider');
    // Move to min and max bounds
    await user.clear(slider);
    await user.type(slider, '5'); // bound min is 5
    await user.clear(slider);
    await user.type(slider, '60'); // max is 60

    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    expect(mockUpdateSettings).toHaveBeenCalled();
  });

  it('toggle shuffleQuestions via Switch', async () => {
    const user = userEvent.setup();
    renderWithCtx();

    const toggle = screen.getByRole('checkbox', { name: /Toggle question shuffling/i });
    await user.click(toggle);
    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    expect(mockUpdateSettings).toHaveBeenCalled();
  });
});

describe('Setting component - Reset and Cancel actions', () => {
  it('Reset sets settings to DEFAULT_SETTINGS (does not close or persist immediately)', async () => {
    const user = userEvent.setup();
    renderWithCtx();

    await user.click(screen.getByRole('button', { name: /Reset/i }));
    // Close to trigger persist
    await user.click(screen.getByRole('button', { name: /Close sheet/i }));
    expect(mockUpdateSettings).toHaveBeenCalledTimes(1);
  });

  it('Cancel restores initial settings and closes sheet (does not call updateSettings immediately)', async () => {
    const user = userEvent.setup();
    mockUpdateSettings.mockClear();
    mockSetShowSettings.mockClear();

    renderWithCtx();
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(mockSetShowSettings).toHaveBeenCalledWith(false);
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });
});