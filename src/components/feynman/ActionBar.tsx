'use client';

import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

type Props = {
    step: 1 | 2;
    onSubmit: () => void;
    onGetHints: () => void;
    onSave: () => void;
    onReset: () => void;
    clarityScore?: number; // 0..100
    jargonCount?: number;
    isLoadingFetchQuestion?: boolean;
    isReview: boolean;
    isDisableGetQuestion: boolean;
    isDisableSubmit: boolean;
    isDisableSaveButton: boolean;
};

export function ActionBar({
    step,
    onGetHints,
    onSave,
    onReset,
    onSubmit,
    clarityScore = 0,
    jargonCount = 0,
    isDisableGetQuestion,
    isDisableSubmit,
    isLoadingFetchQuestion,
    isDisableSaveButton,
    isReview,
}: Props) {
    const t = useTranslations('feynman');
    const badge =
        jargonCount === 0 ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-medium">
                Jargon-free ✓
            </span>
        ) : null;

    return (
        <div className="flex flex-col gap-3 lg:items-center lg:justify-between rounded-2xl border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-sm font-medium">{t('stepOf', { current: step, total: 2 })}</div>
                <div className="hidden lg:block text-muted-foreground text-sm">{t('writeReviewSteps')}</div>
            </div>

            {/* <div className="flex-1 min-w-0 ">
                <div className="flex items-center gap-2 text-xs mb-1">
                    <span>Clarity Score</span>
                    {badge}
                    <span className="ml-auto">{Math.round(clarityScore)}%</span>
                </div>
                <Progress value={clarityScore} />
            </div> */}

            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" onClick={onReset} disabled={isLoadingFetchQuestion || isReview}>
                    {t('reset')}
                </Button>
                <Button variant="outline" onClick={onSave} disabled={isDisableSaveButton}>
                    {t('save')}
                </Button>
                <Button onClick={onGetHints} disabled={isDisableGetQuestion}>
                    {isLoadingFetchQuestion ? t('thinking') : t('getQuestions')}
                </Button>
                <Button onClick={onSubmit} disabled={isDisableSubmit}>
                    {isReview ? t('reviewing') : t('submit')}
                </Button>
            </div>
        </div>
    );
}
