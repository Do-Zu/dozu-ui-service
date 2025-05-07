'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Play, Pause, RefreshCw } from 'lucide-react';
import GameArea from './components/GameArea';
import QuestionArea from './components/QuestionArea';
import Setting from './components/Setting';

interface IQuestion {
  id: number;
  question: string;
  answers: string[];
  correctAnswerIdx: number;
}
// Sample questions and answers for demonstration
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

export default function Page() {
  // Game state
  const [gameActive, setGameActive] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorsRemaining, setErrorsRemaining] = useState(2);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showSettings, setShowSettings] = useState(false);

  // Game settings with defaults
  const [settings, setSettings] = useState({
    speed: 'medium', // slow, medium, fast
    questionCount: 5, // 5, 10, 20, unlimited
    timeLimit: 30, // 10-60 seconds
    errorAllowance: 2, // 1, 2, or 3
  });

  const startGame = () => {
    setGameActive(true);
  };

  // Timer effect
  //   useEffect(() => {
  //     let timer: NodeJS.Timeout;

  //     if (gameActive && !gamePaused && timeRemaining > 0) {
  //       timer = setTimeout(() => {
  //         setTimeRemaining(timeRemaining - 1);
  //       }, 1000);
  //     } else if (timeRemaining === 0 && gameActive) {
  //       // Time's up for current question
  //       moveToNextQuestion();
  //     }

  //     return () => {
  //       if (timer) clearTimeout(timer);
  //     };
  //   }, [gameActive, gamePaused, timeRemaining]);

  // Current question and answers

  const handleAnswerSelect = () => {};

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const answers = currentQuestion.answers.map((answer, index) => ({
    id: `${currentQuestion.id}-${index}`,
    text: answer,
    isCorrect: index === currentQuestion.correctAnswerIdx,
  }));

  return (
    <main className="flex flex-col h-screen bg-background">
      {/* Game area (90% height) */}
      <div className="flex-grow relative" style={{ height: '90%' }}>
        {gameActive ? (
          <GameArea
            answers={answers}
            onCorrectAnswer={() => {}}
            onIncorrectAnswer={handleAnswerSelect}
            speed={settings.speed as 'slow' | 'medium' | 'fast'}
            isGameActive={gameActive}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-muted/20">
            <h1 className="text-4xl font-bold mb-8">Knowledge Game</h1>
            <p className="text-xl mb-8">
              Select the correct answers as they float across the screen!
            </p>
            <Button size="lg" onClick={startGame} className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Start Game
            </Button>
          </div>
        )}

        {/* Game controls */}
        {/* {gameActive && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="icon" onClick={togglePause}>
              {gamePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetGame}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )} */}

        {/* Settings button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => setShowSettings(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Question area (10% height) */}
      <div style={{ height: '10%' }}>
        <QuestionArea
          question={gameActive ? currentQuestion.question : ''}
          timeRemaining={timeRemaining}
          timeLimit={settings.timeLimit}
          errorsRemaining={errorsRemaining}
          score={score}
          totalQuestions={Math.min(settings.questionCount, sampleQuestions.length)}
          currentQuestionNumber={currentQuestionIndex + 1}
          gameActive={gameActive}
        />
      </div>

      {/* Settings modal */}
      {/* <Setting
       isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          setShowSettings(false);
          if (gameActive) {
            resetGame();
          }
        }}
      /> */}

      {/* Game over modal */}
      {/* {!gameActive && score > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-4">
              Your score: {score} out of {Math.min(settings.questionCount, sampleQuestions.length)}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setScore(0)}>
                Close
              </Button>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          </div>
        </div>
      )} */}
    </main>
  );
}
