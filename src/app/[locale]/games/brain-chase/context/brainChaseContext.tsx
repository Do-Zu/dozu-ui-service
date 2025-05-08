'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useEffect,
  useCallback,
} from 'react';
import useToggle from '@/hooks/useToggle';

// Interface for questions
export interface IQuestion {
  id: number;
  question: string;
  answers: string[];
  correctAnswerIdx: number;
}

export interface SettingValues {
  speed: 'slow' | 'medium' | 'fast';
  questionCount: number;
  timeLimit: number;
  errorAllowance: number;
}

// Sample questions - moved from page.tsx
const sampleQuestions: IQuestion[] = [
  {
    id: 1,
    question: 'What is the capital of France?',
    answers: [
      'Paris Paris Paris Paris Paris Paris Paris Paris',
      'London',
      'Berlin',
      'Madrid',
      'Rome',
      'Lisbon',
    ],
    correctAnswerIdx: 0,
  },
  {
    id: 2,
    question: 'Which planet is known as the Red Planet?',
    answers: ['Earth', 'Mars', 'Jupiter', 'Venus', 'Saturn', 'Mercury'],
    correctAnswerIdx: 1,
  },
  {
    id: 3,
    question: 'What is the chemical symbol for gold?',
    answers: ['Au', 'Ag', 'Fe', 'Cu', 'Pb', 'Hg'],
    correctAnswerIdx: 0,
  },
  {
    id: 4,
    question: 'Which famous scientist developed the theory of relativity?',
    answers: ['Newton', 'Einstein', 'Galileo', 'Darwin', 'Tesla', 'Hawking'],
    correctAnswerIdx: 1,
  },
  {
    id: 5,
    question: 'What is the largest ocean on Earth?',
    answers: ['Atlantic', 'Indian', 'Arctic', 'Pacific', 'Southern', 'Mediterranean'],
    correctAnswerIdx: 3,
  },
];

export const DEFAULT_SETTINGS: SettingValues = {
  speed: 'medium', // slow, medium, fast
  questionCount: 5, // 5, 10, 20, unlimited
  timeLimit: 10, // 5-60 seconds
  errorAllowance: 2, // 1, 2, or 3
};

// Interface for game settings
interface GameSettings {
  speed: 'slow' | 'medium' | 'fast';
  questionCount: number;
  timeLimit: number;
  errorAllowance: number;
}

// Interface for the context value
interface BrainChaseContextType {
  // Game state
  gameActive: boolean;
  gamePaused: boolean;
  currentQuestionIndex: number;
  score: number;
  errorsRemaining: number;
  showSettings: boolean;

  // Current question data
  currentQuestion: string;
  formattedAnswers: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;

  // Settings
  settings: GameSettings;

  // Actions
  startGame: () => void;
  resetGame: () => void;
  handleShuffledQuestionGame: () => void;
  togglePause: () => void;
  onCorrectAnswer: () => void;
  onIncorrectAnswer: () => void;
  setShowSettings: (newValue?: boolean | undefined) => void;
  updateSettings: (newSettings: GameSettings) => void;
  handleNextQuestion: () => void;
}

const BrainChaseContext = createContext<BrainChaseContextType | undefined>(undefined);

export function BrainChaseProvider({ children }: { children: ReactNode }) {
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, togglePause] = useToggle(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorsRemaining, setErrorsRemaining] = useState(2);
  const [showSettings, setShowSettings] = useToggle<boolean>(false);
  const [questions, setQuestions] = useState<IQuestion[]>(sampleQuestions);

  // Game settings with defaults
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  //TODO : shuffled after get from db or setting is setting on
  useEffect(() => {
    if (gameActive) generateShuffledQuestions();
  }, [gameActive, sampleQuestions]);

  /**
   * @description Shuffle questions
   *
   */
  const generateShuffledQuestions = () => {
    const length = questions.length;
    const shuffledQuestions = [...questions];

    const tempFirstCurrentQuestion = questions[0];

    for (let index = length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledQuestions[index], shuffledQuestions[randomIndex]] = [
        shuffledQuestions[randomIndex],
        shuffledQuestions[index],
      ];
    }

    if (tempFirstCurrentQuestion.question === shuffledQuestions[0].question) {
      [shuffledQuestions[0], shuffledQuestions[length - 1]] = [
        shuffledQuestions[length - 1],
        shuffledQuestions[0],
      ];
    }

    setQuestions(shuffledQuestions);
  };

  // Format answers for the current question
  const formattedAnswers = useMemo(() => {
    if (currentQuestionIndex >= questions.length) {
      return [];
    }

    const currentQ = questions[currentQuestionIndex];
    const correctIndex = currentQ.correctAnswerIdx;

    return currentQ.answers.map((answerText, index) => ({
      id: `${currentQ.id}-${index}`,
      text: answerText,
      isCorrect: index === correctIndex,
    }));
  }, [currentQuestionIndex, questions]);

  // Get current question
  const currentQuestion = useMemo(() => {
    if (currentQuestionIndex >= questions.length) {
      return '';
    }
    return questions[currentQuestionIndex].question;
  }, [questions, currentQuestionIndex]);

  const resetStateGame = useCallback(() => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setErrorsRemaining(settings.errorAllowance);
  }, [settings.errorAllowance]);

  // Start game
  const startGame = () => {
    resetStateGame();
    setGameActive(true);
  };

  //
  const handleShuffledQuestionGame = () => {
    generateShuffledQuestions();
    resetStateGame();
  };

  // Reset game
  const resetGame = () => {
    setGameActive(false);
    resetStateGame();
  };

  // Handle correct answer
  const onCorrectAnswer = () => {
    setScore(score + 1);

    // Move to the next question or end game if completed all questions
    if (currentQuestionIndex + 1 >= Math.min(settings.questionCount, sampleQuestions.length)) {
      setGameActive(false); // End game
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Handle incorrect answer
  const onIncorrectAnswer = () => {
    const newErrorsRemaining = errorsRemaining - 1;
    setErrorsRemaining(newErrorsRemaining);

    if (newErrorsRemaining <= 0) {
      setGameActive(false); // End game if no more errors allowed
    }
  };

  // Update settings
  const updateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    setErrorsRemaining(newSettings.errorAllowance);
  };

  //
  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= Math.min(settings.questionCount, sampleQuestions.length)) {
      // End game
      setGameActive(false);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  // Create context value
  const contextValue: BrainChaseContextType = {
    gameActive,
    gamePaused,
    currentQuestionIndex,
    score,
    errorsRemaining,
    showSettings,
    currentQuestion,
    formattedAnswers,
    settings,
    startGame,
    resetGame,
    handleShuffledQuestionGame,
    togglePause,
    onCorrectAnswer,
    onIncorrectAnswer,
    setShowSettings,
    updateSettings,
    handleNextQuestion,
  };

  return <BrainChaseContext.Provider value={contextValue}>{children}</BrainChaseContext.Provider>;
}

export function useBrainChase() {
  const context = useContext(BrainChaseContext);
  if (context === undefined) {
    throw new Error('useBrainChase must be used within a BrainChaseProvider');
  }
  return context;
}
