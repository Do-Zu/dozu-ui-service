'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { readLocalQuiz, clearLocalQuiz, LocalQuizQuestion } from '../utils/localQuiz.storage';
import QuizQuestion from '@/app/[locale]/quiz/components/QuizQuestion'; 
import { Button } from '@/components/ui/button';
import { useQuizStreakTracking } from '@/hooks/useStreakProgress';

type LocalQuestion = LocalQuizQuestion & { selectedAnswer?: number | null };

export default function LocalQuizPage() {
  const router = useRouter();
  const search = useSearchParams();
  const topicId = search.get('topicId');
  const chunk = search.get('chunk'); // NEW
  const { trackQuizCompletion } = useQuizStreakTracking();

  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!topicId) return;
    const data = readLocalQuiz(topicId);
    if (!data || data.length === 0) {
      // No data -> back to study
      router.replace(`/flashcards/learning/${topicId}`);
      return;
    }
    setQuestions(data.map(q => ({ ...q, selectedAnswer: null })));
  }, [topicId, router]); // add router

  const total = questions.length;

  const answeredCount = useMemo(
    () => questions.filter(q => typeof q.selectedAnswer === 'number').length,
    [questions]
  );

  const handleSubmit = async () => {
    const correct = questions.reduce((acc, q) => acc + (q.selectedAnswer === q.correctIndex ? 1 : 0), 0);
    setScore(correct);
    setSubmitted(true);
    
    // Track quiz completion for streak progress
    if (topicId) {
      try {
        const userString = localStorage.getItem('user');
        if (!userString) {
          console.warn('No user data found in localStorage');
          return;
        }
        
        let user;
        try {
          user = JSON.parse(userString);
        } catch (parseError) {
          console.error('Invalid user data in localStorage:', parseError);
          return;
        }
        
        const userId = user?.userId;
        if (!userId) {
          console.warn('No userId found in user data');
          return;
        }
        
        const accuracy = questions.length > 0 ? (correct / questions.length) * 100 : 0;
        const actualDuration = Math.round((Date.now() - startTime) / 1000); // seconds
        
        await trackQuizCompletion(
          userId.toString(),
          topicId,
          accuracy,
          actualDuration
        );
        console.log('Local quiz completion tracked for streak progress');
      } catch (error) {
        console.error('Error tracking local quiz completion:', error);
      }
    }
  };

  const handleExit = () => {
    if (topicId) clearLocalQuiz(topicId);
    router.replace(`/flashcards/learning/${topicId}`);
  };

  if (!topicId) return <div>Missing topicId</div>;
  if (!questions || questions.length === 0) return <div>Loading…</div>;

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">
        Quick Quiz {chunk ? `(chunk ${chunk})` : ''}
      </h2>

      {!submitted ? (
        <>
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <QuizQuestion
                key={idx}
                questionNumber={idx + 1}
                questionText={q.questionText}
                choices={q.choices}
                onAnswerSelect={(sel) => {
                  const next = [...questions];
                  next[idx].selectedAnswer = sel;
                  setQuestions(next);
                }}
              />
            ))}
          </div>
          <Button className="mt-6" onClick={handleSubmit} disabled={answeredCount === 0}>
            Submit
          </Button>
        </>
      ) : (
        <>
          <div className="mb-6">
            <div className="text-xl font-medium">
              Result: {score}/{total} correct
            </div>
            <div className="text-sm text-muted-foreground">
              Review below (green = correct, red = your wrong answer).
            </div>
          </div>

          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={idx} className="bg-background p-6 rounded-lg border">
                <div className="font-semibold mb-3">Question {idx + 1}: {q.questionText}</div>
                <div className="space-y-2">
                  {q.choices.map((choice, cIdx) => {
                    if (choice == null || choice.trim() === '') return null;
                    const isCorrect = cIdx === q.correctIndex;
                    const isSelected = cIdx === q.selectedAnswer;
                    const style =
                      isCorrect ? 'border-green-500 bg-green-50'
                      : (isSelected ? 'border-red-500 bg-red-50' : 'border-transparent');

                    return (
                      <div key={cIdx} className={`px-3 py-2 rounded border ${style}`}>
                        {choice}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={handleExit}>Done</Button>
          </div>
        </>
      )}
    </div>
  );
}
