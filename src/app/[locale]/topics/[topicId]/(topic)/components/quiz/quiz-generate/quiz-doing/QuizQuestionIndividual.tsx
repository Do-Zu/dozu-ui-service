'use client';

import { useState } from 'react';
import usePost from '@/hooks/usePost';
import { useTopicWorkspace } from '../../../../context/TopicWorkspaceContext';
import { useQuizWorkspace } from '../../context/QuizWorkspaceContext';
import { Button } from '@/components/ui/button';
import QuizResultFeedback from './components/QuizResultFeedback';
import QuizConfidenceSelector from './components/QuizConfidenceSelector';
import { CornerDownRight, Loader2 } from 'lucide-react';
import { isNilOrEmpty, safeDestructure } from '@/utils';
import {
    IQuestionIndividual,
    ICompareAnswerRequest,
    ICompareAnswerResponse,
} from '../../types/questionIndividual.type';
import { METHOD_LEARNING } from '@/utils/constants/method';
import { toast } from '@/hooks/use-toast';
import { quizService } from '../../service/quiz.service';

interface QuizQuestionIndividualProps {
    question: IQuestionIndividual;
    index: number;
}

export default function QuizQuestionIndividual({ question, index }: QuizQuestionIndividualProps) {
    const { learningMaterial } = useTopicWorkspace();
    const { doingQuestions, setDoingQuestions } = useQuizWorkspace();
    const { execute: executeCheckAnswer, loading: isChecking } = usePost<ICompareAnswerRequest, ICompareAnswerResponse>(
        (payload) => quizService.compareAnswerSimilarity(payload),
    );

    const rawType = question?.questionType?.toString().toLowerCase().trim();

    const isFreeResponse =
        rawType === 'free response' || rawType === 'free' || rawType === 'open-ended' || rawType === 'open_ended';

    const isFillInBlank =
        rawType === 'fill in the blank' ||
        rawType === 'Fill in the blank' ||
        rawType === 'fill-in-the-blank' ||
        rawType === 'fill_blank' ||
        rawType === 'blank';

    const isChoice = !isFreeResponse && !isFillInBlank;

    const questionText: string = question.questionText ?? '';

    // multiple choice data
    const choices: string[] = question.choices ?? [];
    const correctIndex: number = question.correctIndex;

    // free response data
    const correctText: string = choices[correctIndex];

    // local state
    const [localChoiceAnswer, setLocalChoiceAnswer] = useState<number | null>(
        !isFreeResponse && typeof question.selectedAnswer === 'number' ? question.selectedAnswer : null,
    );
    const [freeText, setFreeText] = useState<string>(
        isFreeResponse && typeof question.selectedAnswer === 'string' ? question.selectedAnswer : '',
    );
    const [showExplanation, setShowExplanation] = useState<boolean>(Boolean(question.isShowExplain));
    const [showHint, setShowHint] = useState<boolean>(false);
    const isTextAnswer = isFreeResponse || isFillInBlank;

    const isAnswered =
        question.selectedAnswer !== undefined &&
        question.selectedAnswer !== null &&
        (isTextAnswer ? String(question.selectedAnswer).trim() !== '' : true);

    // multichoice
    const handleSelectChoice = (choiceIndex: number) => {
        if (isAnswered) return;

        setLocalChoiceAnswer(choiceIndex);

        const updated = [...doingQuestions];
        updated[index] = {
            ...updated[index],
            selectedAnswer: choiceIndex,
            isCorrect: choiceIndex === correctIndex,
            showExplanation: true,
        };

        setDoingQuestions(updated);
        setShowExplanation(true);
    };

    // typing format question
    const handleSubmitFreeText = async () => {
        const trimmed = freeText.trim();
        if (!trimmed) return;

        const updated = [...doingQuestions];
        const payload = {
            query: trimmed,
            pattern: correctText,
            question: question.questionText,
            topicId: question?.topicId,
            method: METHOD_LEARNING.QUIZ,
            questionType: question?.questionType,
            type: learningMaterial?.type,
        };

        const data = await executeCheckAnswer(payload);

        if (!data) {
            toast({
                description: 'Mark report fail',
            });
        }

        const { score, maxScore, isCorrect } = safeDestructure(data);

        updated[index] = {
            ...updated[index],
            selectedAnswer: trimmed,
            score,
            maxScore,
            isCorrect: Boolean(isCorrect),
            evaluationStatus: 'pending',
            showExplanation: true,
        };

        setDoingQuestions(updated);
        setShowExplanation(true);
    };

    return (
        <div className="mx-auto w-full max-w-3xl">
            {/* Question text */}
            <h2 className="mb-6 whitespace-pre-wrap text-xl font-semibold">{questionText}</h2>

            {question.hint && (
                <div className="mb-6">
                    {!showHint ? (
                        <Button variant="outline" onClick={() => setShowHint(true)} className="gap-2">
                            <CornerDownRight className="size-4" />
                            Give me a hint
                        </Button>
                    ) : (
                        <div className="rounded-3xl border border-border/50 bg-muted/50 p-4 animate-in fade-in slide-in-from-top-2">
                            <p className="font-medium">{question.hint}</p>
                        </div>
                    )}
                </div>
            )}

            {/* multi choice*/}
            {isChoice && Array.isArray(choices) && choices.length > 0 && (
                <div className="space-y-3">
                    {(choices ?? [])
                        .filter((c) => typeof c === 'string' && c.trim() !== '')
                        .map((choice: string, i: number) => {
                            const isSelected =
                                (typeof question.selectedAnswer === 'number'
                                    ? question.selectedAnswer
                                    : localChoiceAnswer) === i;

                            const isCorrectChoice = correctIndex === i;

                            let borderColor = 'border-border';
                            let bgColor = 'bg-background';

                            if (isAnswered) {
                                if (isCorrectChoice) {
                                    borderColor = 'border-green-500';
                                    bgColor = 'bg-green-50 dark:bg-green-900/20';
                                } else if (isSelected && !isCorrectChoice) {
                                    borderColor = 'border-red-500';
                                    bgColor = 'bg-red-50 dark:bg-red-900/20';
                                }
                            }

                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSelectChoice(i)}
                                    disabled={isAnswered}
                                    className={`w-full rounded-lg border p-4 text-left transition 
                            ${borderColor} ${bgColor}
                            ${isAnswered ? 'cursor-default opacity-80' : 'hover:bg-muted'}
                        `}
                                >
                                    <span className="text-base">{choice}</span>
                                </button>
                            );
                        })}
                </div>
            )}

            {/* free response */}
            {isFreeResponse && (
                <div className="space-y-4">
                    <textarea
                        disabled={isAnswered || isChecking}
                        value={
                            isAnswered && typeof question.selectedAnswer === 'string'
                                ? question.selectedAnswer
                                : freeText
                        }
                        onChange={(e) => setFreeText(e.target.value)}
                        className="w-full rounded-lg border bg-background p-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        rows={4}
                        placeholder="Enter your answer..."
                    />

                    {!isAnswered && (
                        <Button
                            className="mt-1 rounded-3xl"
                            variant="default"
                            disabled={isNilOrEmpty(freeText.trim()) || isChecking}
                            onClick={handleSubmitFreeText}
                        >
                            {isChecking ? 'Evaluating...' : 'Submit'}
                            {isChecking && <Loader2 className="mr-2 size-4 animate-spin" />}
                        </Button>
                    )}
                </div>
            )}

            {/* fill in blank */}
            {isFillInBlank && (
                <div className="space-y-4">
                    <input
                        type="text"
                        disabled={isAnswered || isChecking}
                        value={
                            isAnswered && typeof question.selectedAnswer === 'string'
                                ? question.selectedAnswer
                                : freeText
                        }
                        onChange={(e) => setFreeText(e.target.value)}
                        className="w-full rounded-lg border bg-background p-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        placeholder="Type the missing word..."
                    />

                    {!isAnswered && (
                        <Button
                            className="mt-1 rounded-3xl"
                            variant="default"
                            disabled={isNilOrEmpty(freeText.trim()) || isChecking}
                            onClick={handleSubmitFreeText}
                        >
                            {isChecking ? 'Evaluating...' : 'Submit'}
                            {isChecking && <Loader2 className="mr-2 size-4 animate-spin" />}
                        </Button>
                    )}
                </div>
            )}

            {/* feedback */}
            {(question.isShowExplain || showExplanation) && (
                <QuizResultFeedback
                    isFreeResponse={isFreeResponse}
                    isFillInBlank={isFillInBlank}
                    isCorrect={Boolean(question.isCorrect)}
                    userAnswer={question.selectedAnswer ?? freeText}
                    correctAnswerText={correctText}
                    explanation={question.explain}
                    score={question.score}
                    maxScore={question.maxScore}
                    questionText={question.questionText}
                />
            )}

            {/* confidence */}
            {question.isCorrect === true && (
                <QuizConfidenceSelector
                    value={question.confidence}
                    onSelect={(v) => {
                        const updated = [...doingQuestions];
                        updated[index] = {
                            ...updated[index],
                            confidence: v,
                        };
                        setDoingQuestions(updated);
                    }}
                />
            )}
        </div>
    );
}
