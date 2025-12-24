import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import Reference from '../../../../reference/Reference';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QuizResultFeedbackProps {
    isFreeResponse: boolean;
    isFillInBlank?: boolean;
    isCorrect: boolean;
    userAnswer?: string | number;
    correctAnswerText?: string;
    explanation?: string;
    score?: number;
    maxScore?: number;
    questionText?: string;
}

export default function QuizResultFeedback({
    isFreeResponse,
    isFillInBlank,
    isCorrect,
    userAnswer,
    correctAnswerText,
    explanation,
    score,
    maxScore,
    questionText,
}: QuizResultFeedbackProps) {
    const styles = {
        correct: {
            card: 'border-emerald-200 bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/30',
            badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-700/70',
            textMain: 'text-emerald-900 dark:text-emerald-100',
            textMuted: 'text-emerald-700 dark:text-emerald-300',
        },
        wrong: {
            card: 'border-rose-200 bg-rose-300/50 dark:border-rose-900/60 dark:bg-rose-500/50',
            badge: 'bg-rose-500/10 text-rose-700 border border-rose-200/70 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-700/70',
            textMain: 'text-rose-900 dark:text-rose-100',
            textMuted: 'text-rose-700 dark:text-rose-300',
        },
    };

    const currentStyle = isCorrect ? styles.correct : styles.wrong;

    return (
        <Card className={cn('mt-6 transition-all duration-200', currentStyle.card)}>
            <CardHeader className="px-4 py-3 border-b border-border/5 flex flex-row items-center gap-2 space-y-0">
                <Badge variant="outline" className={cn('px-3 py-1 flex items-center gap-1.5', currentStyle.badge)}>
                    {isCorrect ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Exactly! Good job.</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4" />
                            <span>Incorrect.</span>
                        </>
                    )}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-sm">
                {score !== undefined && maxScore !== undefined && (
                    <div className="flex items-center gap-2">
                        <p className={cn('font-medium', currentStyle.textMuted)}>Score:</p>
                        <p className={cn('font-medium', currentStyle.textMain)}>
                            {score} / {maxScore}
                        </p>
                    </div>
                )}

                {/* Suggested/Correct Answer */}
                {(!isCorrect || isFreeResponse || isFillInBlank) && correctAnswerText && (
                    <div className="grid gap-1">
                        <p className={cn('font-medium', currentStyle.textMuted)}>
                            {isFreeResponse || isFillInBlank ? 'Suggested answer' : 'Correct answer'}
                        </p>
                        <div className="p-3 rounded-2xl border border-border/50 bg-background/50">
                            <p className="whitespace-pre-wrap text-foreground font-medium">{correctAnswerText}</p>
                        </div>
                    </div>
                )}

                {/* Explanation */}
                {explanation && (
                    <div className="pt-2 border-t border-border/50">
                        <p className={cn('font-medium mb-2', currentStyle.textMain)}>Explanation</p>
                        <p className={cn('leading-relaxed', currentStyle.textMuted)}>{explanation}</p>
                    </div>
                )}

                {/* Reference */}
                {questionText && correctAnswerText && (
                    <div className="pt-2">
                        <Reference content={`${questionText}: ${correctAnswerText}`} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
