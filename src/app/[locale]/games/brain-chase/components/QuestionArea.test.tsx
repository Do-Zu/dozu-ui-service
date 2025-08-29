/**
 * Test suite for QuestionArea component
 * Testing library/framework note:
 * - Uses React Testing Library with either Vitest (vi) or Jest, autodetected via globals.
 * - We import from @testing-library/react and rely on jest-dom matchers if available.
 */
import React from 'react'
import { render, screen, act } from '@testing-library/react'

/* Test runner detection shims: prefer vi (Vitest) if available, else fallback to jest */
const _vi: any = (globalThis as any).vi
const setupFakeTimers = (...args: any[]) => (_vi ? _vi.useFakeTimers(...args) : (jest as any).useFakeTimers(...args))
const setSystemTime = (t: number | Date) => (_vi ? _vi.setSystemTime(t) : (jest as any).setSystemTime(t))
const advanceTimersByTime = (ms: number) => (_vi ? _vi.advanceTimersByTime(ms) : (jest as any).advanceTimersByTime(ms))
const runOnlyPendingTimers = () => (_vi ? _vi.runOnlyPendingTimers() : (jest as any).runOnlyPendingTimers())
const runAllTimers = () => (_vi ? _vi.runAllTimers() : (jest as any).runAllTimers())
const spyOn = (obj: any, key: any) => (_vi ? _vi.spyOn(obj, key) : (jest as any).spyOn(obj, key))
const mockFn = () => (_vi ? _vi.fn() : (jest as any).fn())
const clearAllMocks = () => (_vi ? _vi.clearAllMocks() : (jest as any).clearAllMocks())
const restoreAllMocks = () => (_vi ? _vi.restoreAllMocks() : (jest as any).restoreAllMocks())

/* Mocks */
vi?.mock?.('@/components/ui/progress', () => ({
  Progress: (props: { value?: number; className?: string }) => (
    <div data-testid="progress" data-value={props.value ?? 0} className={props.className || ''} />
  ),
}))
;(jest as any)?.mock?.('@/components/ui/progress', () => ({
  Progress: (props: { value?: number; className?: string }) => (
    <div data-testid="progress" data-value={props.value ?? 0} className={props.className || ''} />
  ),
}))

// Mock next-intl useTranslations
vi?.mock?.('next-intl', () => ({
  useTranslations: () => (key: string) => `t(${key})`,
}))
;(jest as any)?.mock?.('next-intl', () => ({
  useTranslations: () => (key: string) => `t(${key})`,
}))

// Mock brain chase context hook
const defaultCtx = {
  gameActive: true,
  gamePaused: false,
  showSettings: false,
  score: 0,
  errorsRemaining: 3,
  settings: { timeLimit: 3, questionCount: 10 },
  currentQuestionIndex: 0,
  handleNextQuestion: () => {},
  flashcards: Array.from({ length: 7 }, (_, i) => ({ id: i })),
}

let mockCtx = { ...defaultCtx }
vi?.mock?.('../context/brainChaseContext', () => ({
  useBrainChase: () => mockCtx,
}))
;(jest as any)?.mock?.('../context/brainChaseContext', () => ({
  useBrainChase: () => mockCtx,
}))

// Import after mocks
import QuestionArea from './QuestionArea'

describe('QuestionArea', () => {
  beforeEach(() => {
    clearAllMocks()
    mockCtx = { ...defaultCtx, handleNextQuestion: mockFn() }
    // Use modern fake timers + mocked system time for stable countdown behavior
    setupFakeTimers({ now: new Date('2025-01-01T00:00:00Z') as any })
  })
  afterEach(() => {
    // ensure timers cleared between tests
    runOnlyPendingTimers()
    restoreAllMocks()
  })

  it('renders start message when game is not active', () => {
    mockCtx.gameActive = false
    render(<QuestionArea question="What is 2+2?" currentQuestionNumber={1} />)
    expect(screen.getByText('t(startGameMessage)')).toBeInTheDocument()
  })

  it('shows question number, total (min of flashcards and questionCount), score and errors', () => {
    // questionCount=10, flashcards length=7 => total should be 7
    mockCtx.score = 5
    mockCtx.errorsRemaining = 2
    render(<QuestionArea question="Q1" currentQuestionNumber={3} />)

    expect(screen.getByText(/t\(question\)\s+3\/7/)).toBeInTheDocument()
    expect(screen.getByText(/t\(score\):\s*5/)).toBeInTheDocument()
    expect(screen.getByText(/t\(gameSettings\.errorsLeft\)\s+2/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Q1' })).toBeInTheDocument()
  })

  it('uses questionCount when it does not exceed available flashcards', () => {
    mockCtx.settings.questionCount = 5
    mockCtx.flashcards = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    render(<QuestionArea question="Qx" currentQuestionNumber={2} />)
    expect(screen.getByText(/t\(question\)\s+2\/5/)).toBeInTheDocument()
  })

  it('initializes timeRemaining from settings.timeLimit and displays seconds', () => {
    mockCtx.settings.timeLimit = 4
    render(<QuestionArea question="Q" currentQuestionNumber={1} />)
    expect(screen.getByText('4s')).toBeInTheDocument()
    const progress = screen.getByTestId('progress')
    expect(progress).toHaveAttribute('data-value', '0')
  })

  it('counts down and calls handleNextQuestion on timeout', () => {
    mockCtx.settings.timeLimit = 2
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())

    render(<QuestionArea question="Timed" currentQuestionNumber={1} />)

    // Immediately after mount, label shows "2s"
    expect(screen.getByText('2s')).toBeInTheDocument()

    // Advance near to end, ensure still not called
    act(() => {
      advanceTimersByTime(1500) // 1.5s
    })
    expect(nextSpy).not.toHaveBeenCalled()

    // Finish the remaining time; interval runs every 100ms
    act(() => {
      advanceTimersByTime(1000) // total 2.5s -> timer should elapse
      runOnlyPendingTimers()
    })
    expect(nextSpy).toHaveBeenCalledTimes(1)

    // Progress should reach ~100
    const progress = screen.getByTestId('progress')
    // data-value won't be exactly 100 due to interval tick, but should be close; assert string numeric >= 90
    const val = Number(progress.getAttribute('data-value') || '0')
    expect(val).toBeGreaterThanOrEqual(90)
  })

  it('does not start timer when game is paused', () => {
    mockCtx.gamePaused = true
    mockCtx.settings.timeLimit = 3
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())

    render(<QuestionArea question="Paused" currentQuestionNumber={1} />)
    // Even after advancing timers, next should not be called because no interval was set
    act(() => {
      advanceTimersByTime(5000)
      runAllTimers()
    })
    expect(nextSpy).not.toHaveBeenCalled()
    // Time label remains at initial value "3s"
    expect(screen.getByText('3s')).toBeInTheDocument()
  })

  it('does not start timer when settings are open', () => {
    mockCtx.showSettings = true
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())

    render(<QuestionArea question="Settings" currentQuestionNumber={1} />)
    act(() => {
      advanceTimersByTime(5000)
      runAllTimers()
    })
    expect(nextSpy).not.toHaveBeenCalled()
  })

  it('restarts timer when settings.timeLimit changes', () => {
    mockCtx.settings.timeLimit = 5
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())

    const { rerender } = render(<QuestionArea question="Q" currentQuestionNumber={1} />)
    expect(screen.getByText('5s')).toBeInTheDocument()

    // Change timeLimit; re-render will trigger effect with new dep
    mockCtx.settings = { ...mockCtx.settings, timeLimit: 1 }
    rerender(<QuestionArea question="Q" currentQuestionNumber={1} />)

    // Label resets to "1s"
    expect(screen.getByText('1s')).toBeInTheDocument()

    // Advance enough to trigger timeout on the new shorter timer
    act(() => {
      advanceTimersByTime(1200)
      runOnlyPendingTimers()
    })
    expect(nextSpy).toHaveBeenCalledTimes(1)
  })

  it('cleans up interval on unmount (no stray timer calls)', () => {
    mockCtx.settings.timeLimit = 1
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())
    const { unmount } = render(<QuestionArea question="Bye" currentQuestionNumber={1} />)

    // Unmount before timer elapses
    unmount()

    // Advance far; if cleanup failed, this would call next
    act(() => {
      advanceTimersByTime(5000)
      runAllTimers()
    })
    expect(nextSpy).not.toHaveBeenCalled()
  })

  it('restarts timer when question index changes', () => {
    mockCtx.settings.timeLimit = 2
    const nextSpy = (mockCtx.handleNextQuestion = mockFn())
    const { rerender } = render(<QuestionArea question="Q1" currentQuestionNumber={1} />)

    // Advance some time, then simulate new question by updating index
    act(() => {
      advanceTimersByTime(1100)
    })
    mockCtx.currentQuestionIndex = 1
    rerender(<QuestionArea question="Q2" currentQuestionNumber={2} />)

    // After restart, label should be back to "2s"
    expect(screen.getByText('2s')).toBeInTheDocument()

    // Let it finish
    act(() => {
      advanceTimersByTime(2100)
      runOnlyPendingTimers()
    })
    expect(nextSpy).toHaveBeenCalledTimes(1)
  })
})