'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { truncate } from '@/utils';
import { CheckCircle2, ChevronRight, Lightbulb, TriangleAlert } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

type Question = { content: string };
type Gap = { word: string; suggestion: string };

export interface LeftMissionPanelProps {
    title?: string;
    questions?: Question[];
    hints?: string[];
    detectedGaps?: Gap[];
    expanded: boolean;
    onToggle: () => void;
    onUseAnalogy: (hint: string) => void;
}

/**
 * LeftMissionPanel
 * A progressive-disclosure panel for Feynman flow: shows one question at a time,
 * inline hint bubble, compact knowledge gaps, and light gamification with progress.
 */
export const LeftMissionPanel: React.FC<LeftMissionPanelProps> = ({
    title = 'Mission: Teach it simply',
    questions = [],
    hints = [],
    detectedGaps = [],
    expanded,
    onToggle,
    onUseAnalogy,
}) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [hintModalOpen, setHintModalOpen] = useState(false);
    const [selectedHint, setSelectedHint] = useState<string | null>(null);
    const total = questions.length || 1;

    const progress = useMemo(() => Math.min(100, Math.round(((currentIdx + 1) / total) * 100)), [currentIdx, total]);
    const currentQuestion = questions[currentIdx]?.content ?? "Start by explaining it like I'm 8 years old.";

    const next = () => {
        setShowHint(false);
        setCurrentIdx((i) => (i + 1 < total ? i + 1 : i));
    };

    const openHintModal = (hint: string) => {
        setSelectedHint(hint);
        setHintModalOpen(true);
    };

    return (
        <div className="space-y-4">
            {/* Mission header + Progress */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                        <span>{title}</span>
                        <span className="text-xs text-muted-foreground">
                            Step {Math.min(currentIdx + 1, total)} / {total}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Active question card */}
            <Card className="rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle2
                            className={`h-4 w-4 ${currentIdx > 0 ? 'text-green-500' : 'text-muted-foreground'}`}
                        />
                        Question
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm leading-6">{currentQuestion}</p>

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="gap-2" onClick={() => setShowHint((s) => !s)}>
                            <Lightbulb className="h-4 w-4" />
                            Hint
                        </Button>
                        <Button
                            size="sm"
                            className="gap-2"
                            variant="default"
                            onClick={next}
                            disabled={currentIdx + 1 >= total}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {showHint && hints.length > 0 && (
                        <div className="mt-1 rounded-lg border p-3 bg-muted/40">
                            <p className="text-xs text-muted-foreground mb-2">Try one of these prompts:</p>
                            <div className="relative px-6">
                                <Carousel opts={{ align: 'start', containScroll: 'trimSnaps' }}>
                                    <CarouselContent>
                                        {hints.map((hint, idx) => (
                                            <CarouselItem key={idx} className="min-w-0 basis-1/2 md:basis-1/3">
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="w-full justify-start text-left overflow-hidden"
                                                    onClick={() => openHintModal(hint)}
                                                >
                                                    <span className="truncate" title={hint}>
                                                        Use: {truncate(hint, 60)}
                                                    </span>
                                                </Button>
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="-left-4 md:-left-6" />
                                    <CarouselNext className="-right-4 md:-right-6" />
                                </Carousel>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Knowledge gaps (compact) */}
            {detectedGaps && detectedGaps.length > 0 && (
                <Card className="rounded-2xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <TriangleAlert className="h-4 w-4 text-amber-500" />
                            Knowledge gaps
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">You might have missed:</p>
                        <ul className="text-sm space-y-1 list-disc pl-5">
                            {detectedGaps.slice(0, 6).map((g, i) => (
                                <li key={i}>
                                    <span className="font-medium">{g.word}</span>
                                    {g.suggestion ? (
                                        <span className="text-muted-foreground"> – {g.suggestion}</span>
                                    ) : null}
                                </li>
                            ))}
                        </ul>
                        {detectedGaps.length > 3 && (
                            <Button variant="ghost" size="sm" className="mt-1 px-0" onClick={onToggle}>
                                {expanded ? 'Hide more' : `Show ${detectedGaps.length - 3} more`}
                            </Button>
                        )}
                        {expanded && detectedGaps.length > 3 && (
                            <div className="mt-2 border-t pt-2 space-y-1 text-sm">
                                {detectedGaps.slice(3).map((g, i) => (
                                    <div key={i}>
                                        <span className="font-medium">{g.word}</span>
                                        {g.suggestion ? (
                                            <span className="text-muted-foreground"> – {g.suggestion}</span>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Analogy builder (kept from original) */}
            {/* {hints && hints.length > 0 && (
                <Card className="rounded-2xl">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Analogy Builder
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Compare this topic to something in life. Pick one hint and try rewriting your explanation
                            with that analogy.
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {hints.slice(0, 3).map((hint, idx) => (
                                <Button key={idx} size="sm" variant="secondary">
                                    Use: {truncate(hint, 60)}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )} */}

            {/* Hint Fullscreen Modal */}
            <Dialog open={hintModalOpen} onOpenChange={setHintModalOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Hint</DialogTitle>
                        <DialogDescription>Use this hint to improve your explanation.</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm whitespace-pre-wrap leading-6">{selectedHint}</div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="ghost" onClick={() => setHintModalOpen(false)}>
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                if (selectedHint) onUseAnalogy(selectedHint);
                                setHintModalOpen(false);
                            }}
                        >
                            Use this hint
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Tiny motivation */}
            <div className="text-xs text-muted-foreground text-center">
                "If you can’t explain it simply, you don’t understand it well enough."
            </div>
        </div>
    );
};

export default LeftMissionPanel;
