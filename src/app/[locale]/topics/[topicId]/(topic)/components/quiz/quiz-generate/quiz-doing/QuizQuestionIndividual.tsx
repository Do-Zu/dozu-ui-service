'use client';

import { useState } from 'react';
import usePost from '@/hooks/usePost';
import { useTopicWorkspace } from '../../../../context/TopicWorkspaceContext';
import { useQuizWorkspace } from '../../context/QuizWorkspaceContext';
import { Button } from '@/components/ui/button';
import Reference from '../../../reference/Reference';
import { safeDestructure } from '@/utils';
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

    const questionText: string = question.questionText ?? '';

    // multiple choice data
    const choices: string[] = question.choices ?? [];
    const correctIndex: number = question.correctIndex;

    // free response data
    const correctText: string = choices[correctIndex]; //fix correctText cho đúng với data response feyment

    // local state
    const [localChoiceAnswer, setLocalChoiceAnswer] = useState<number | null>(
        !isFreeResponse && typeof question.selectedAnswer === 'number' ? question.selectedAnswer : null,
    );
    const [freeText, setFreeText] = useState<string>(
        isFreeResponse && typeof question.selectedAnswer === 'string' ? question.selectedAnswer : '',
    );
    const [showExplanation, setShowExplanation] = useState<boolean>(Boolean(question.isShowExplain));

    const isAnswered =
        question.selectedAnswer !== undefined &&
        question.selectedAnswer !== null &&
        (isFreeResponse ? String(question.selectedAnswer).trim() !== '' : true);

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

        // TODO Check valuable for correct answer

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
        <div className="w-full max-w-3xl mx-auto">
            {/* Question text */}
            <h2 className="text-xl font-semibold mb-6 whitespace-pre-wrap">{questionText}</h2>

            {/* multi choice*/}
            {!isFreeResponse && Array.isArray(choices) && choices.length > 0 && (
                <div className="space-y-3">
                    {choices.map((choice: string, i: number) => {
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
                                className={`w-full text-left p-4 border rounded-lg transition 
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
                        disabled={isAnswered}
                        value={
                            isAnswered && typeof question.selectedAnswer === 'string'
                                ? question.selectedAnswer
                                : freeText
                        }
                        onChange={(e) => setFreeText(e.target.value)}
                        className="w-full border rounded-lg p-4 text-base bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                        rows={4}
                        placeholder="Enter your answer..."
                    />

                    {!isAnswered && (
                        <Button className="mt-1" variant="default" onClick={handleSubmitFreeText}>
                            Submit
                        </Button>
                    )}
                </div>
            )}

            {/* feedback */}
            {(question.isShowExplain || showExplanation) && (
                <div className="mt-6 p-4 rounded-lg border bg-muted space-y-2">
                    <p className="font-medium">{question.explain}</p>
                    <p className="font-medium">{question.hint}</p>
                    {isFreeResponse ? (
                        <>
                            <p className="text-sm font-medium text-muted-foreground">Your answer</p>
                            <p className="text-sm whitespace-pre-wrap">
                                {String(question.selectedAnswer ?? freeText ?? '').trim() || '—'}
                            </p>
                            {question?.score && question?.maxScore && (
                                <p>
                                    Score : {question?.score} / {question.maxScore}{' '}
                                </p>
                            )}
                            <p className="mt-3 text-sm font-medium text-muted-foreground">Suggested answer</p>
                            <p className="text-sm whitespace-pre-wrap">{correctText || '—'}</p>
                            <Reference content={`${question.questionText}: ${correctText}`} />
                        </>
                    ) : question.isCorrect ? (
                        <div>
                            <p className="text-green-600 dark:text-green-400 font-medium">✔ Exactly! Good job.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <p className="text-red-600 dark:text-red-400 font-medium">✘ Incorrect.</p>
                            {typeof correctIndex === 'number' && Array.isArray(choices) && choices[correctIndex] && (
                                <p className="text-sm text-muted-foreground">
                                    Correct answer: <span className="font-medium">{choices[correctIndex]}</span>
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
