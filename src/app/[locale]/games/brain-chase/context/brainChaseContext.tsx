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
import useFetch from '@/hooks/useFetch';

// Interface for flashcard from API
interface IFlashcard {
  flashcardId: number;
  front: string;
  back: string;
  difficulty?: string;
}

// Interface for topic info
interface ITopicInfo {
  topicId: number;
  name: string;
  title?: string;
  description?: string;
}

// Interface for questions
export interface IQuestion {
  id: number;
  question: string;
  answers: string[];
  correctAnswerIdx: number;
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

export const DEFAULT_SETTINGS: GameSettings = {
  speed: 'medium', // slow, medium, fast
  questionCount: 10, // Default to 10 questions
  timeLimit: 10, // 5-60 seconds
  errorAllowance: 2, // 1, 2, or 3,
  shuffleQuestions: true,
};

// Interface for game settings
export interface GameSettings {
  speed: 'slow' | 'medium' | 'fast';
  questionCount: number;
  timeLimit: number;
  errorAllowance: number;
  shuffleQuestions: boolean;
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
  isLoading: boolean;
  loadError: any;
  topicId?: string | null;
  topicInfo?: ITopicInfo | null;
  flashcards?: IFlashcard[] | null;

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

export function BrainChaseProvider({ children, topicId }: { children: ReactNode; topicId?: string | null }) {
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, togglePause] = useToggle(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorsRemaining, setErrorsRemaining] = useState(2);
  const [showSettings, setShowSettings] = useToggle<boolean>(false);
  const [questions, setQuestions] = useState<IQuestion[]>(sampleQuestions);

  // Game settings with defaults
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);

  // Fetch flashcards if topicId is provided
  const {
    data: flashcards,
    loading: flashcardsLoading,
    error: flashcardsError,
  } = useFetch<IFlashcard[]>(
    topicId ? `/topics/${topicId}/flashcards` : '',
    { 
      selector: (data: any) => {
        // API returns array directly when includeTopic=false
        // or object with flashcards property when includeTopic=true
        if (Array.isArray(data)) {
          return data;
        }
        return data.flashcards || data.data || [];
      }
    }
  );

  // Fetch topic info if topicId is provided
  const {
    data: topicInfo,
    loading: topicLoading,
    error: topicError,
  } = useFetch<ITopicInfo>(
    topicId ? `/topics/${topicId}` : '',
    { 
      selector: (data: any) => data.data || data
    }
  );

  // Convert flashcards to game questions format
  useEffect(() => {
    if (flashcards && Array.isArray(flashcards) && flashcards.length > 0) {
      const gameQuestions: IQuestion[] = flashcards.map((card: IFlashcard, index: number) => {
        // Generate wrong answers from other flashcards
        const wrongAnswers = flashcards
          .filter((c: IFlashcard) => c.flashcardId !== card.flashcardId)
          .map((c: IFlashcard) => c.back)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        // Add some generic wrong answers if not enough
        const genericAnswers = ['True', 'False', 'None of the above', 'All of the above'];
        while (wrongAnswers.length < 3) {
          const available = genericAnswers.filter(ga => !wrongAnswers.includes(ga) && ga !== card.back);
          if (available.length > 0) {
            wrongAnswers.push(available[0]);
          } else {
            wrongAnswers.push(`Option ${wrongAnswers.length + 1}`);
          }
        }

        // Combine correct and wrong answers, then shuffle
        const allAnswers = [card.back, ...wrongAnswers].sort(() => Math.random() - 0.5);
        const correctAnswerIdx = allAnswers.indexOf(card.back);

        return {
          id: card.flashcardId,
          question: card.front,
          answers: allAnswers,
          correctAnswerIdx,
        };
      });

      setQuestions(gameQuestions);
    } else if (!topicId) {
      // Use sample questions if no topicId provided
      setQuestions(sampleQuestions);
    }
  }, [flashcards, topicId]);

  //TODO : shuffled after get from db or setting is setting on
  useEffect(() => {
    if (gameActive && settings.shuffleQuestions) generateShuffledQuestions();
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
    if (settings.shuffleQuestions) {
      generateShuffledQuestions();
    } else {
      setQuestions([...sampleQuestions]);
    }
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
    isLoading: flashcardsLoading || topicLoading,
    loadError: flashcardsError || topicError,
    topicId,
    topicInfo,
    flashcards,
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
