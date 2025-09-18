'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FeynmanEditor } from '@/components/feynman/FeynmanEditor';
import { HintPanel } from '@/components/feynman/HintPanel';
import { ActionBar } from '@/components/feynman/ActionBar';
import { FeynmanAIRequest, FeynmanAIResponse, FeynmanPracticePageProps } from '@/components/feynman/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams } from 'next/navigation';

type PageProps = {
    params: { locale: string };
    searchParams?: Record<string, string | string[]>;
};

const DEFAULT_PROPS: FeynmanPracticePageProps = {
    topicId: 'unknown',
    initialContent: '',
    maxLengthExplain: 4000,
    highlightConfig: { minWordLength: 9 },
};

export default function FeynmanPage(_props: PageProps) {
    const searchParams = useSearchParams();
    const params = useParams();

    const topicId = params?.topicId as string;

    const originContent = searchParams?.get('originContent');
    const initialContent = searchParams?.get('initialContent') ?? 'a';
    const minWordLength = 9;
    const maxLengthExplain = 4000;

    const [text, setText] = useState<string>(
        Array.isArray(initialContent) ? initialContent.join('\n') : initialContent,
    );

    const [highlightedWords, setHighlightedWords] = useState<string[]>([]);
    const [ai, setAI] = useState<FeynmanAIResponse>({ questions: [], hints: [] });
    const [expanded, setExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);

    // Version history in localStorage
    // const storageKey = `feynman:${topicId}`;
    const [history, setHistory] = useState<{ content: string; ts: number }[]>([]);

    // useEffect(() => {
    //     const raw = localStorage.getItem(storageKey);
    //     if (raw) {
    //         try {
    //             setHistory(JSON.parse(raw));
    //         } catch {}
    //     }
    // }, [storageKey]);

    // const saveHistory = useCallback(
    //     (content: string) => {
    //         const next = [{ content, ts: Date.now() }, ...history].slice(0, 10);
    //         setHistory(next);
    //         localStorage.setItem(storageKey, JSON.stringify(next));
    //     },
    //     [history, storageKey],
    // );

    // Derive clarity: prefer server clarityScore; else simple heuristic
    const clarityScore = useMemo(() => {
        if (typeof ai.clarityScore === 'number') return ai.clarityScore;
        const penalty = Math.min(100, highlightedWords.length * 12);
        return Math.max(0, 80 - penalty);
    }, [ai.clarityScore, highlightedWords.length]);

    const handleChange = (val: string, highlights: string[]) => {
        setText(val);
        setHighlightedWords(highlights);
    };

    const callAI = useCallback(async () => {
        setIsLoading(true);
        try {
            const payload: FeynmanAIRequest = {
                topicId: String(topicId),
                explanation: text,
                highlightedWords,
                method: 'feynman',
                origin_content: String(originContent),
            };
            const res = await fetch('/api/feynman/generate', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = (await res.json()) as FeynmanAIResponse;
            setAI({
                questions: data.questions || [],
                hints: data.hints || [],
            });
            setStep(2);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [originContent, text, highlightedWords, topicId]);

    // On mount, if initialContent exists, fetch initial questions
    useEffect(() => {
        if (initialContent) {
            callAI();
        }
    }, []);

    const handleSave = () => {
        // saveHistory(text);
    };

    const handleReset = () => {
        setText('');
        setAI({ questions: [], hints: [] });
        setHighlightedWords([]);
        setStep(1);
    };

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

            <div>
                <HintPanel
                    questions={ai.questions || []}
                    hints={ai.hints || []}
                    feedback={ai.feedBack}
                    detectedGaps={ai.detectedGaps}
                    expanded={expanded}
                    onToggle={() => setExpanded((s) => !s)}
                />

                {ai.hints && ai.hints.length > 0 && (
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
                                {ai.hints.slice(0, 3).map((h, idx) => (
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
        </div>
    );
}
