'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FeynmanEditor } from '@/components/feynman/FeynmanEditor';
import { HintPanel } from '@/components/feynman/HintPanel';
import { ActionBar } from '@/components/feynman/ActionBar';
import { FeynmanAIRequest, FeynmanAIResponse, FeynmanPracticePageProps } from '@/components/feynman/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams } from 'next/navigation';
import useFetch from '@/hooks/useFetch';
import flashcardService from '@/services/flashcard/flashcard.service';
import LoadingOverlay from '../../generate/components/import/components/LoadingOverlay';
import LoadingPage from '@/app/loading';
import { IFlashcard } from '../../flashcards/types/flashcard.type';
import { isNilOrEmpty } from '@/utils';
import useGenerate from '@/hooks/generate/useGenerate';
import { Loader2 } from 'lucide-react';

type PageProps = {
    params: { locale: string };
    searchParams?: Record<string, string | string[]>;
};

const BASE_URL = '/feynman';
const minWordLength = 9;
const maxLengthExplain = 4000;
const TYPE_GENERATE = {
    QUESTION: 'feynman_question',
    REVIEW: 'feynman_review',
};

interface IFeynmanDetectedGap {
    word: string;
    suggestion: string;
}

interface IFeynmanResponseQuestion {
    questions: { content: string }[];
    hints: string[];
    detectedGaps: IFeynmanDetectedGap[];
}

export default function FeynmanPage(_props: PageProps) {
    const searchParams = useSearchParams();
    const params = useParams();
    const topicId = params?.topicId as string;
    const method = searchParams?.get('method');

    const [text, setText] = useState<string>('');
    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    const [ai, setAI] = useState<FeynmanAIResponse>({ questions: [], hints: [] });
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [history, setHistory] = useState<{ content: string; ts: number }[]>([]);

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
        apiPostContentError,
        isGenerating: isGeneratingQuestion,
    } = useGenerate<IFeynmanResponseQuestion>();

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
            ?.map((item, index) => {
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

    const callAI = async () => {
        await executeGetQuestion({
            content: handleParseDataOriginToString(getKeysByMethod()),
            method: 'text',
            type: TYPE_GENERATE.QUESTION,
        });

        // setIsLoading(true);
        // try {
        //     const payload: FeynmanAIRequest = {
        //         topicId: String(topicId),
        //         explanation: text,
        //         highlightedWords,
        //         method: 'feynman',
        //         origin_content: handleParseDataOriginToString(getKeysByMethod()),
        //     };

        //     const res = await fetch('/api/feynman/generate', {
        //         method: 'POST',
        //         headers: { 'content-type': 'application/json' },
        //         body: JSON.stringify(payload),
        //     });

        //     const data = (await res.json()) as FeynmanAIResponse;

        //     setAI({
        //         questions: data.questions || [],
        //         hints: data.hints || [],
        //     });

        //     setStep(2);
        // } catch (e) {
        //     console.error(e);
        // } finally {
        //     setIsLoading(false);
        // }
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
        }
    };

    useEffect(() => {
        if (!method || !topicId) return;
        handleGetOriginContent(method);
    }, [method, topicId]);

    useEffect(() => {
        if (dataFeynmanQuestion) {
            console.log;
        }
    }, []);

    const handleSave = () => {};

    const handleReset = () => {
        setText('');
        setAI({ questions: [], hints: [] });
        setHighlightedWords([]);
        setStep(1);
    };

    const renderLeftSide = () => {
        if (isGeneratingQuestion) return <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />;

        return (
            <div>
                <HintPanel
                    questions={ai.questions || []}
                    hints={ai.hints || []}
                    feedback={ai.feedBack}
                    detectedGaps={ai.detectedGaps}
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
                                {dataFeynmanQuestion.hints.slice(0, 3).map((h, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setText((t) => `${t}\n\nAnalogy: ${h}`)}
                                    >
                                        Use: {h.length > 24 ? h.slice(0, 24) + '…' : h}
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
        (isFetchDataOriginMethod && !isFetchDataOriginMethod) ||
        (isRegisterFetchQuestion && !errorFetchDataOriginMethod)
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
                    onGetHints={callAI}
                    onSave={handleSave}
                    onReset={handleReset}
                    clarityScore={clarityScore}
                    jargonCount={highlightedWords.length}
                    isLoading={isLoading}
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
