'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ActionBar } from '@/components/feynman/ActionBar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { isNilOrEmpty, isNullOrEmpty, toNumber } from '@/utils';
import { FeynmanReviewDialog } from '@/components/feynman/ReviewedDialog';
import { IFeynmanResponseQuestion, IFeynmanReviewedResponse } from '@/components/feynman/types';
import { TYPE_GENERATE, maxLengthExplain, minWordLength } from '@/components/feynman/config';
import { useFeynmanService } from './hooks/useFeynmanService';
import History from '@/components/feynman/History';
import LeftMissionPanel from '@/components/feynman/LeftMissionPanel';
import { toast } from '@/hooks/use-toast';

export default function FeynmanPage() {
    const tCommon = useTranslations('common');
    const tFeynman = useTranslations('feynman');

    const searchParams = useSearchParams();
    const params = useParams();
    const topicId = params?.topicId as string;
    const method = searchParams?.get('method');

    const [text, setText] = useState<string>('');
    const [html, setHtml] = useState<string>('');
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    // const [ai, setAI] = useState<FeynmanAIResponse>({ questions: [], hints: [] });
    const [review, setReview] = useState<IFeynmanReviewedResponse>();
    const [expanded, setExpanded] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [history, setHistory] = useState<{ content: string; ts: number }[]>([]);
    const [openReview, setOpenReview] = useState(false);

    const { get, update } = useFeynmanService();

    const isValidToFetchOriginDataMethod = (): boolean => {
        return !!method && !!topicId;
    };

    const {
        data: originContent,
        loading: isFetchDataOriginMethod,
        error: errorFetchDataOriginMethod,
    } = useFetch(() => handleGetOriginContent(method!), {
        shouldRun: isValidToFetchOriginDataMethod(),
        onError: () => {
            toast({
                description: tCommon('messages.readError', { name: tFeynman('messages.flashcard') }),
            });
        },
        onEmpty: () => {
            toast({
                description: tFeynman('messages.emptyOriginContent'),
            });
        },
    });

    const {
        execute: executeGetQuestion,
        loading: isRegisterFetchQuestion,
        dataGenerated: dataFeynmanQuestion,
        isGenerating: isGeneratingQuestion,
        apiPostContentError: errorGenerateQuestion,
        setDataGenerated,
    } = useGenerate<IFeynmanResponseQuestion>({
        onSuccess: (questions) => handleStorageQuestion(questions),
    });

    const {
        execute: executeReview,
        loading: isRegisterReview,
        dataGenerated: dataFeynmanReviewed,
        isGenerating: isGeneratingReview,
        apiPostContentError: errorReview,
    } = useGenerate<IFeynmanReviewedResponse>();

    const htmlRefOlder = useRef(html);

    const textRef = useRef(text);
    const htmlRef = useRef(html);
    const questionsRef = useRef(dataFeynmanQuestion);
    const reviewRef = useRef(review);
    const highlightedWordsRef = useRef<string[]>(highlightedWords);
    const stepRef = useRef(step);
    const topicIdRef = useRef(topicId);
    const methodRef = useRef(method);

    useEffect(() => {
        textRef.current = text;
    }, [text]);
    useEffect(() => {
        htmlRef.current = html;
    }, [html]);
    useEffect(() => {
        questionsRef.current = dataFeynmanQuestion;
    }, [dataFeynmanQuestion]);
    useEffect(() => {
        reviewRef.current = review;
    }, [review]);
    useEffect(() => {
        highlightedWordsRef.current = highlightedWords;
    }, [highlightedWords]);
    useEffect(() => {
        stepRef.current = step;
    }, [step]);
    useEffect(() => {
        topicIdRef.current = topicId;
    }, [topicId]);
    useEffect(() => {
        methodRef.current = method;
    }, [method]);

    //TODO: Calculate clarity after storage success data
    // const clarityScore = useMemo(() => {
    //     if (typeof ai.clarityScore === 'number') return ai.clarityScore;
    //     const penalty = Math.min(100, highlightedWords.length * 12);
    //     return Math.max(0, 80 - penalty);
    // }, [ai.clarityScore, highlightedWords.length]);

    const handleChange = (val: string, highlights: string[]) => {
        setText(val);
        setHighlightedWords(highlights);
    };

    const getKeysByMethod = (): string[] => {
        if (method === 'flashcard') return ['front', 'back'];
        //TODO: implement keys bind for other method learning (quiz, mindmap)
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

    const handleReset = () => {
        setText('');
        setHighlightedWords([]);
        setStep(1);
    };

    const handleFetchFeynmanSession = useCallback(async () => {
        if (!topicId || !method) return;

        const data = await get.fetch({ topicId: toNumber(topicId, -1), method });

        if (!data) return;

        if (data.questions && data.questions.questions.length > 0) {
            setDataGenerated({
                ...data.questions,
            });
        }

        if (data.review) {
            setReview(data.review);
        }

        if (data.explanationHtml && data.explanationText) {
            setHtml(data.explanationHtml);
            setText(data.explanationHtml);
            htmlRefOlder.current = data.explanationHtml;
        }

        if (data.highlightedWords) {
            setHighlightedWords(data.highlightedWords);
        }
    }, [topicId, method]);

    const handleUpdateSession = useCallback(async () => {
        if (isNullOrEmpty(topicId) || isNullOrEmpty(method) || isNullOrEmpty(text) || isNullOrEmpty(html)) return;

        await update.execute({
            method: method!,
            topicId: toNumber(topicId, -1),
            explanationHtml: html,
            explanationText: text,
            review: review,
            questions: dataFeynmanQuestion,
            highlightedWords,
            step,
        });
    }, [topicId, method, html, text, review, highlightedWords, step]);

    const saveLatestSessionOnUnmount = async () => {
        const m = methodRef.current;
        const topicIdStr = topicIdRef.current;
        const t = textRef.current;
        const h = htmlRef.current;

        if (
            isNullOrEmpty(topicIdStr) ||
            isNullOrEmpty(m) ||
            isNullOrEmpty(t) ||
            isNullOrEmpty(h) ||
            h == htmlRefOlder.current
        )
            return;

        await update.execute({
            method: m!,
            topicId: toNumber(topicIdStr as string, -1),
            explanationHtml: h!,
            explanationText: t!,
            review: reviewRef.current,
            questions: questionsRef.current ?? undefined,
            highlightedWords: highlightedWordsRef.current ?? [],
            step: stepRef.current,
        });
    };

    async function handleStorageQuestion(questions: IFeynmanResponseQuestion) {
        if (!topicId || !method) return;

        await update.execute({
            topicId: toNumber(topicId, -1),
            method,
            questions,
        });
    }

    const isDisableSave = useMemo(() => {
        return isNullOrEmpty(html) || html == htmlRefOlder.current;
    }, [html, htmlRefOlder.current]);

    const handleSave = async () => {
        if (isDisableSave) return;
        return handleUpdateSession();
    };

    useEffect(() => {
        if (!isRegisterReview && dataFeynmanReviewed && !errorReview) {
            setReview(dataFeynmanReviewed);
            setStep(2);
            setOpenReview(true);
        }
    }, [isRegisterReview, dataFeynmanReviewed]);

    useEffect(() => {
        void handleFetchFeynmanSession();
    }, [topicId, method]);

    useEffect(() => {
        return () => {
            void saveLatestSessionOnUnmount();
        };
    }, []);

    const isDisableGetQuestionButton = useMemo(() => {
        return (
            isGeneratingQuestion ||
            isGeneratingReview ||
            !!dataFeynmanQuestion ||
            !originContent ||
            isFetchDataOriginMethod
        );
    }, [isGeneratingQuestion, isGeneratingReview, dataFeynmanQuestion]);

    const isDisableSubmitReviewButton = useMemo(() => {
        return !dataFeynmanQuestion || isGeneratingQuestion || isGeneratingReview || isNullOrEmpty(text);
    }, [isGeneratingQuestion, isGeneratingReview, text]);

    const isLoadingPage = useMemo(() => {
        return (
            (isFetchDataOriginMethod && !errorFetchDataOriginMethod) ||
            (isRegisterFetchQuestion && !errorGenerateQuestion) ||
            (isRegisterReview && !errorReview) ||
            (get.loading && !get.error) ||
            (update.loading && !update.error)
        );
    }, [isFetchDataOriginMethod, isRegisterFetchQuestion, isRegisterReview, get.loading, update.loading]);

    const renderLeftSide = () => {
        if (isGeneratingQuestion || isRegisterReview || isGeneratingReview)
            return (
                <Card className="rounded-2xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">{tFeynman('loadingGenerate')}</p>
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
            <LeftMissionPanel
                questions={dataFeynmanQuestion?.questions || []}
                hints={dataFeynmanQuestion?.hints || []}
                detectedGaps={dataFeynmanQuestion?.detectedGaps}
                expanded={expanded}
                onToggle={() => setExpanded((s) => !s)}
                onUseAnalogy={(hint) => setText((t) => `${t}\n\nAnalogy: ${hint}`)}
            />
        );
    };

    if (isLoadingPage) return <LoadingPage isOverlay={true} />;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <Card className="rounded-2xl">
                    <CardHeader></CardHeader>
                    <CardContent>
                        <FeynmanEditor
                            value={text}
                            onChange={handleChange}
                            onChangeHtml={setHtml}
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
                    jargonCount={highlightedWords.length}
                    isLoadingFetchQuestion={isGeneratingQuestion}
                    isReview={isGeneratingReview}
                    isDisableGetQuestion={isDisableGetQuestionButton}
                    isDisableSubmit={isDisableSubmitReviewButton}
                    isDisableSaveButton={isDisableSave}
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
                            {tFeynman('viewReview')}
                        </Button>
                    }
                />

                <History history={history} setText={setText} />
            </div>

            {renderLeftSide()}
        </div>
    );
}
