'use client';

import { Button } from '@/components/ui/button';
import { Settings, Play, Pause, RefreshCw } from 'lucide-react';
import GameArea from './components/GameArea';
import QuestionArea from './components/QuestionArea';
import Setting from './components/Setting';
import { BrainChaseProvider, useBrainChase } from './context/brainChaseContext';

function BrainChaseGame() {
  const {
    gameActive,
    gamePaused,
    togglePause,
    currentQuestion,
    score,
    settings,
    currentQuestionIndex,
    setShowSettings,
    startGame,
    resetGame,
  } = useBrainChase();

  return (
    <div className="flex flex-col h-[80vh] bg-background">
      {/* Game area (90% height) */}
      <div className="flex-grow relative h-[90%]">
        {gameActive ? (
          <GameArea />
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
        {gameActive && (
          <div className="absolute top-4 right-4 flex gap-2">
            <Button variant="outline" size="icon" onClick={() => togglePause()}>
              {gamePaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={resetGame}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4"
          onClick={() => setShowSettings()}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Question area (10% height) */}
      <div className="h-[10%]">
        <QuestionArea
          question={gameActive ? currentQuestion : ''}
          currentQuestionNumber={currentQuestionIndex + 1}
        />
      </div>

      {/* Settings modal */}
      <Setting />

      {/* Game over modal */}
      {!gameActive && score > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-8 rounded-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="mb-4">
              Your score: {score} out of {Math.min(settings.questionCount, 5)}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => resetGame()}>
                Close
              </Button>
              <Button onClick={startGame}>Play Again</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <BrainChaseProvider>
      <BrainChaseGame />
    </BrainChaseProvider>
  );
}
