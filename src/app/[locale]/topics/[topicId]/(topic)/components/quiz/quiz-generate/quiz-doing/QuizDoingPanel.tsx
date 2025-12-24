'use client';

import { useState } from 'react';
import { useQuizWorkspace } from '../../context/QuizWorkspaceContext';
import QuizHeaderProgress from './QuizHeaderProgress';
import QuizQuestionIndividual from './QuizQuestionIndividual';
import QuizFooterNavigator from './QuizFooterNavigator';
import ConfirmSubmitDialog from './ConfirmSubmitDialog';
import { quizService } from '@/app/[locale]/quiz/services/quiz.service';
import { toast } from '@/hooks/use-toast';

export default function QuizDoingPanel() {
    const [showExitDialog, setShowExitDialog] = useState(false);

    const [animDirection, setAnimDirection] = useState<'left' | 'right' | null>(null);

    const {
        doingQuestions,
        setDoingQuestions,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        setDoingMode,
        setQuizResultData,
        showSubmitDialog,
        setShowSubmitDialog,
        setQuizMode,
        setViewMode,
        setSelectedQuizResultId,
    } = useQuizWorkspace();

    const question = doingQuestions[currentQuestionIndex];
    const isLast = currentQuestionIndex === doingQuestions.length - 1;

    // submit quiz
    const handleSubmitQuiz = async () => {
        try {
            const results = doingQuestions.map((q) => ({
                questionId: q.questionId,
                correct: typeof q.isCorrect === 'boolean' ? q.isCorrect : q.selectedAnswer === q.correctIndex,
                userAnswerIndex: typeof q.selectedAnswer === 'number' ? q.selectedAnswer : null,
                confidence: q.isCorrect ? q.confidence : undefined,
            }));

            const response = await quizService.submitQuiz({
                quizId: doingQuestions[0].quizId,
                results,
            });

            // save results
            const data = response.data as { quizResultId: string; [key: string]: any };
            setQuizResultData(data);
            setDoingMode(false);

            // jump to history tab
            setQuizMode('history');
            setViewMode('detail');
            const parsedQuizResultId = parseInt(data.quizResultId, 10);
            setSelectedQuizResultId(Number.isNaN(parsedQuizResultId) ? null : parsedQuizResultId);

            toast({
                title: 'Quiz Completed',
                description: 'Your quiz has been submitted.',
            });
        } catch (err) {
            toast({
                title: 'Submission Failed',
                description: 'Please try again.',
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="w-full h-full flex flex-col px-6">
            {/* exit */}
            <div className="w-full flex justify-end pt-4">
                <button
                    onClick={() => setShowExitDialog(true)}
                    className="text-sm text-muted-foreground hover:text-red-500 transition"
                >
                    Exit quiz ✕
                </button>
            </div>

            {/* progress bar */}
            <QuizHeaderProgress current={currentQuestionIndex + 1} total={doingQuestions.length} />

            {/* question */}
            <div className="flex-1 flex flex-col justify-center pt-6 overflow-y-auto">
                <div
                    key={currentQuestionIndex}
                    className={`
                        transition-all duration-300
                        ${animDirection === 'left' ? 'animate-slide-left' : ''}
                        ${animDirection === 'right' ? 'animate-slide-right' : ''}
                    `}
                >
                    <QuizQuestionIndividual question={question} index={currentQuestionIndex} />
                </div>
            </div>

            {/* footer */}
            <QuizFooterNavigator
                hasPrev={currentQuestionIndex > 0}
                hasNext={currentQuestionIndex < doingQuestions.length - 1}
                isLastQuestion={isLast}
                onPrev={() => {
                    setAnimDirection('right');
                    setCurrentQuestionIndex((i) => Math.max(0, i - 1));
                }}
                onNext={() => {
                    setAnimDirection('left');
                    if (!isLast) setCurrentQuestionIndex((i) => i + 1);
                    else setShowSubmitDialog(true);
                }}
                onSubmit={() => setShowSubmitDialog(true)}
            />

            {/* submit confirm */}
            <ConfirmSubmitDialog
                open={showSubmitDialog}
                answeredCount={doingQuestions.filter((q) => q.selectedAnswer !== null).length}
                totalQuestions={doingQuestions.length}
                onCancel={() => setShowSubmitDialog(false)}
                onConfirm={async () => {
                    setShowSubmitDialog(false);
                    await handleSubmitQuiz();
                }}
            />

            {/* exit confirm */}
            <ConfirmSubmitDialog
                open={showExitDialog}
                answeredCount={0}
                totalQuestions={doingQuestions.length}
                onCancel={() => setShowExitDialog(false)}
                onConfirm={async () => {
                    setShowExitDialog(false);
                    setDoingMode(false);
                    setDoingQuestions([]);
                    setCurrentQuestionIndex(0);
                }}
            />
        </div>
    );
}
