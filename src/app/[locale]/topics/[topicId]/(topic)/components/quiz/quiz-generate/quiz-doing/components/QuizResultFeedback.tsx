import React from 'react';
import { InfoIcon, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Reference from '../../../../reference/Reference';
import { Badge } from '@/components/ui/badge';
import { toNumber } from '@/utils/helper';

const RESULT_STATUS = {
    WRONG: 'wrong',
    CLOSE: 'close',
    CORRECT: 'correct',
} as const;

type ResultStatus = (typeof RESULT_STATUS)[keyof typeof RESULT_STATUS];

type ResultStyle = {
    card: string;
    badge: string;
    textMain: string;
    textMuted: string;
};

type BadgeContent = {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
};

function getResultStyle(resultStatus: ResultStatus): ResultStyle {
    switch (resultStatus) {
        case RESULT_STATUS.CORRECT:
            return {
                card: 'border-emerald-200 bg-emerald-100/70 dark:border-emerald-900/60 dark:bg-emerald-950/30',
                badge: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-700/70',
                textMain: 'text-emerald-900 dark:text-emerald-100',
                textMuted: 'text-emerald-700 dark:text-emerald-300',
            };
        case RESULT_STATUS.CLOSE:
            return {
                card: 'border-amber-200 bg-amber-100/70 dark:border-amber-900/60 dark:bg-amber-950/30',
                badge: 'bg-amber-500/10 text-amber-700 border border-amber-200/70 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-700/70',
                textMain: 'text-amber-900 dark:text-amber-100',
                textMuted: 'text-amber-700 dark:text-amber-300',
            };
        case RESULT_STATUS.WRONG:
        default:
            return {
                card: 'border-rose-200 bg-rose-300/50 dark:border-rose-900/60 dark:bg-rose-500/50',
                badge: 'bg-rose-500/10 text-rose-700 border border-rose-200/70 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-700/70',
                textMain: 'text-rose-900 dark:text-rose-100',
                textMuted: 'text-rose-700 dark:text-rose-300',
            };
    }
}

function getBadgeContent(resultStatus: ResultStatus): BadgeContent {
    switch (resultStatus) {
        case RESULT_STATUS.CORRECT:
            return { icon: CheckCircle2, label: 'Exactly!' };
        case RESULT_STATUS.CLOSE:
            return { icon: InfoIcon, label: 'Close.' };
        case RESULT_STATUS.WRONG:
        default:
            return { icon: XCircle, label: 'Incorrect.' };
    }
}

function getResultStatus(score: number | undefined, isCorrect: boolean): ResultStatus {
    const parsedScore = toNumber(score);

    if (!Number.isNaN(parsedScore)) {
        if (parsedScore <= 2) return RESULT_STATUS.WRONG;
        if (parsedScore === 3) return RESULT_STATUS.CLOSE;
        return RESULT_STATUS.CORRECT;
    }

    return isCorrect ? RESULT_STATUS.CORRECT : RESULT_STATUS.WRONG;
}

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
    correctAnswerText,
    explanation,
    score,
    maxScore,
    questionText,
}: QuizResultFeedbackProps) {
    const resultStatus = getResultStatus(score, isCorrect);

    const currentStyle = getResultStyle(resultStatus);

    const badgeContent = getBadgeContent(resultStatus);

    const Icon = badgeContent.icon;

    const shouldShowScore = score !== undefined && maxScore !== undefined;

    const shouldShowSuggestedAnswer =
        Boolean(correctAnswerText) && (resultStatus !== RESULT_STATUS.CORRECT || isFreeResponse || isFillInBlank);

    const shouldShowReference = Boolean(questionText) && Boolean(correctAnswerText);

    const content = `${questionText}: ${correctAnswerText} \n ${explanation}`;

    return (
        <Card className={cn('mt-6 transition-all duration-200', currentStyle?.card)}>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0 border-b border-border/5 px-4 py-3">
                <Badge variant="outline" className={cn('flex items-center gap-1.5 px-3 py-1', currentStyle?.badge)}>
                    <Icon className="size-4" />
                    <span>{badgeContent?.label}</span>
                </Badge>
            </CardHeader>

            <CardContent className="space-y-4 p-4 text-sm">
                {shouldShowScore && (
                    <div className="flex items-center gap-2">
                        <p className={cn('font-medium', currentStyle?.textMuted)}>Score:</p>
                        <p className={cn('font-medium', currentStyle?.textMain)}>
                            {score} / {maxScore}
                        </p>
                    </div>
                )}

                {shouldShowSuggestedAnswer && (
                    <div className="grid gap-1">
                        <p className={cn('font-medium', currentStyle?.textMuted)}>
                            {isFreeResponse || isFillInBlank ? 'Suggested answer' : 'Correct answer'}
                        </p>
                        <div className="rounded-2xl border border-border/50 bg-background/50 p-3">
                            <p className="whitespace-pre-wrap font-medium text-foreground">{correctAnswerText}</p>
                        </div>
                    </div>
                )}

                {explanation && (
                    <div className="border-t border-border/50 pt-2">
                        <p className={cn('font-medium mb-2', currentStyle?.textMain)}>Explanation</p>
                        <p className={cn('leading-relaxed', currentStyle?.textMuted)}>{explanation}</p>
                    </div>
                )}

                {shouldShowReference && (
                    <div className="mx-auto pt-2">
                        <Reference content={content} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
