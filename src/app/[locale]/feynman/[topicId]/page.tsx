'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import useGenerate from '@/hooks/generate/useGenerate';
import useFetch from '@/hooks/useFetch';
import flashcardService from '@/services/flashcard/flashcard.service';
import LoadingPage from '@/app/loading';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeynmanEditor } from '@/components/feynman/FeynmanEditor';
import { HintPanel } from '@/components/feynman/HintPanel';
import { ActionBar } from '@/components/feynman/ActionBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isNilOrEmpty, isNullOrEmpty, truncate } from '@/utils';
import { FeynmanReviewDialog } from '@/components/feynman/ReviewedDialog';
import { FeynmanAIResponse, IFeynmanResponseQuestion, IFeynmanReviewedResponse } from '@/components/feynman/types';
import { TYPE_GENERATE, maxLengthExplain, minWordLength } from '@/components/feynman/config';
import { toast } from '@/hooks/use-toast';

export default function FeynmanPage() {
    const searchParams = useSearchParams();
    const params = useParams();
    const topicId = params?.topicId as string;
    const method = searchParams?.get('method');

    const tCommon = useTranslations('common');

    const [text, setText] = useState<string>('');
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    const [ai, setAI] = useState<FeynmanAIResponse>({ questions: [], hints: [] });
    const [review, setReview] = useState<IFeynmanReviewedResponse>();
    const [expanded, setExpanded] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [history, setHistory] = useState<{ content: string; ts: number }[]>([]);

    const [openReview, setOpenReview] = useState(false);

    const isValidToFetchOriginDataMethod = (): boolean => {
        return !!method && !!topicId;
    };

    const {
        data: originContent,
        loading: isFetchDataOriginMethod,
        error: errorFetchDataOriginMethod,
    } = useFetch(() => handleGetOriginContent(method!), { shouldRun: isValidToFetchOriginDataMethod() });

    const {
        execute: executeGetQuestion,
        loading: isRegisterFetchQuestion,
        dataGenerated: dataFeynmanQuestion,
        isGenerating: isGeneratingQuestion,
        apiPostContentError: errorGenerateQuestion,
    } = useGenerate<IFeynmanResponseQuestion>();

    const {
        execute: executeReview,
        loading: isRegisterReview,
        dataGenerated: dataFeynmanReviewed,
        isGenerating: isGeneratingReview,
        apiPostContentError: errorReview,
    } = useGenerate<IFeynmanReviewedResponse>();

    const clarityScore = useMemo(() => {
        if (typeof ai.clarityScore === 'number') return ai.clarityScore;
        const penalty = Math.min(100, highlightedWords.length * 12);
        return Math.max(0, 80 - penalty);
    }, [ai.clarityScore, highlightedWords.length]);

    const handleChange = (val: string, highlights: string[]) => {
        setText(val);
        setHighlightedWords(highlights);
    };

    const getKeysByMethod = (): string[] => {
        if (method === 'flashcard') return ['front', 'back'];
        return [];
    };

    const handleParseDataOriginToString = (keys: string[]): string => {
        const origin = originContent;

        if (typeof origin === 'string') return origin;

        if (!Array.isArray(origin) || keys.length === 0) return '';

        return origin
            ?.filter((item) => typeof item === 'object' && item !== null)
            ?.map((item) => {
                const obj = item as Record<string, string | number | null | undefined | object>;

                const lines = keys.map((key) => {
                    const val = obj[key];
                    if (isNilOrEmpty(val)) return null;
                    return `${key}: ${String(val)}`;
                });

                if (!lines.length) return null;
                return lines.join('\n');
            })
            .filter(Boolean)
            .join('\n\n');
    };

    const handleGenerateQuestion = async () => {
        await executeGetQuestion({
            content: handleParseDataOriginToString(getKeysByMethod()),
            method: 'text',
            type: TYPE_GENERATE.QUESTION,
        });
    };

    const handleParseReview = () => {
        const hints = dataFeynmanQuestion?.hints;
        const gaps = dataFeynmanQuestion?.detectedGaps?.map((gap) => `${gap.word}: ${gap.suggestion}`);
        const questions = dataFeynmanQuestion?.questions.map((q) => q.content.trim());

        return [
            'Questions',
            questions?.join('\n'),
            '',
            'Hints',
            hints?.join('\n'),
            '',
            'Detected Gaps',
            gaps?.join('\n'),
            '',
            'User Explanation',
            text,
        ].join('\n');
    };

    const handleSubmitEssay = async () => {
        await executeReview({
            content: handleParseReview(),
            method: 'text',
            type: TYPE_GENERATE.REVIEW,
        });
    };

    const handleGetOriginContentFlashcard = async () => {
        const flashcards = await flashcardService.getFlashcardsForTopic(topicId);
        return flashcards;
    };

    const handleGetOriginContent = async (method: string) => {
        switch (method) {
            case 'flashcard':
                return await handleGetOriginContentFlashcard();
            case 'quiz':
            case 'mindmap':
                // TODO: Implement quiz and mindmap fetching
                console.warn(`Method ${method} not yet implemented`);
                return null;
            default:
                console.error(`Unknown method: ${method}`);
                return null;
        }
    };

    useEffect(() => {
        if (!isRegisterReview && dataFeynmanReviewed && !errorReview) {
            setReview(dataFeynmanReviewed);
            setStep(2);
            setOpenReview(true);
        }
    }, [isRegisterReview, dataFeynmanReviewed]);

    const handleSave = () => {
        toast({
            description: tCommon('messages.featureInComing'),
        });
    };

    const handleReset = () => {
        setText('');
        setAI({ questions: [], hints: [] });
        setHighlightedWords([]);
        setStep(1);
    };

    const renderLeftSide = () => {
        if (isGeneratingQuestion || isRegisterReview || isGeneratingReview)
            return (
                <Card className="rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Generating questions & hints…</p>
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Skeleton className="h-7 w-20 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                        <Skeleton className="h-7 w-16 rounded-full" />
                        <Skeleton className="h-7 w-28 rounded-full" />
                    </div>
                </Card>
            );

        return (
            <div>
                <HintPanel
                    questions={dataFeynmanQuestion?.questions || []}
                    hints={dataFeynmanQuestion?.hints || []}
                    detectedGaps={dataFeynmanQuestion?.detectedGaps}
                    expanded={expanded}
                    onToggle={() => setExpanded((s) => !s)}
                />

                {dataFeynmanQuestion?.hints && dataFeynmanQuestion?.hints.length > 0 && (
                    <Card className="rounded-2xl mt-4">
                        <CardHeader>
                            <CardTitle className="text-base">Analogy Builder</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Compare this topic to something in life. Pick one hint and try rewriting your
                                explanation with that analogy.
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {dataFeynmanQuestion.hints.slice(0, 3).map((hint, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setText((t) => `${t}\n\nAnalogy: ${hint}`)}
                                    >
                                        Use: {truncate(hint, 60)}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    if (
        (isFetchDataOriginMethod && !errorFetchDataOriginMethod) ||
        (isRegisterFetchQuestion && !errorGenerateQuestion) ||
        (isRegisterReview && !errorReview)
    )
        return <LoadingPage isOverlay={true} />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle>Explain in Simple Terms</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FeynmanEditor
                            value={text}
                            onChange={handleChange}
                            maxLength={maxLengthExplain}
                            minWordLength={minWordLength}
                        />
                    </CardContent>
                </Card>

                <ActionBar
                    step={step}
                    onSubmit={handleSubmitEssay}
                    onGetHints={handleGenerateQuestion}
                    onSave={handleSave}
                    onReset={handleReset}
                    clarityScore={clarityScore}
                    jargonCount={highlightedWords.length}
                    isLoadingFetchQuestion={isGeneratingQuestion}
                    isReview={isGeneratingReview}
                    isDisableGetQuestion={isGeneratingQuestion || isGeneratingReview || !!dataFeynmanQuestion}
                    isDisableSubmit={
                        !dataFeynmanQuestion || isGeneratingQuestion || isGeneratingReview || isNullOrEmpty(text)
                    }
                />

                <FeynmanReviewDialog
                    open={openReview}
                    onOpenChange={setOpenReview}
                    review={review}
                    loading={isGeneratingReview}
                    trigger={
                        <Button
                            variant="secondary"
                            size="sm"
                            disabled={!review && !isGeneratingReview}
                            onClick={() => setOpenReview(true)}
                        >
                            View Review
                        </Button>
                    }
                />

                {history.length > 0 && (
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="text-base">Version History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {history.map((h, i) => (
                                <div key={h.ts} className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setText(h.content)}>
                                        Restore
                                    </Button>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {new Date(h.ts).toLocaleString()} — {h.content.slice(0, 80)}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>

            {renderLeftSide()}
        </div>
    );
}
