import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { IFeynmanReviewedResponse } from './types';

interface FeynmanReviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    review?: IFeynmanReviewedResponse;
    loading?: boolean;
    trigger?: React.ReactNode;
}

export const FeynmanReviewDialog: React.FC<FeynmanReviewDialogProps> = ({
    open,
    onOpenChange,
    review,
    loading,
    trigger,
}) => {
    const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
    const toggleStep = (i: number) => setExpandedSteps((s) => ({ ...s, [i]: !s[i] }));

    const scoreNames: { key: keyof IFeynmanReviewedResponse['scores']; label: string }[] = [
        { key: 'overall', label: 'Overall' },
        { key: 'clarity', label: 'Clarity' },
        { key: 'correctness', label: 'Correctness' },
        { key: 'simplicity', label: 'Simplicity' },
        { key: 'structure', label: 'Structure' },
        { key: 'analogyUse', label: 'Analogy Use' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-h-[90vh] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Review Result</DialogTitle>
                    <DialogDescription>
                        A structured analysis of your explanation with actionable improvements.
                    </DialogDescription>
                </DialogHeader>

                {loading && (
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-2/3" />
                        <div className="grid grid-cols-2 gap-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                )}

                {!loading && !review && (
                    <div className="text-sm text-muted-foreground">
                        No review available yet. Submit your explanation to generate one.
                    </div>
                )}

                {!loading && review && (
                    <div className="space-y-6">
                        {/* Scores */}
                        <section>
                            <h3 className="text-sm font-medium mb-2">Scores</h3>
                            <div className="grid sm:grid-cols-3 grid-cols-2 gap-3">
                                {scoreNames.map(({ key, label }) => {
                                    const val = review.scores?.[key];
                                    return (
                                        <Card key={key} className="border rounded-md">
                                            <CardContent className="p-3">
                                                <div className="text-xs text-muted-foreground">{label}</div>
                                                <div className="font-semibold text-sm">
                                                    {typeof val === 'number' ? `${val}/100` : '—'}
                                                </div>
                                                <div className="h-1 mt-1 bg-muted rounded">
                                                    <div
                                                        className="h-1 bg-primary rounded"
                                                        style={{ width: `${Math.min(100, Math.max(0, val || 0))}%` }}
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Feedback */}
                        <section>
                            <h3 className="text-sm font-medium mb-2">Feedback Summary</h3>
                            <Card>
                                <CardContent className="p-4 space-y-4">
                                    <p className="text-sm">{review.feedback.summary}</p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-xs font-semibold mb-1 uppercase tracking-wide">
                                                Strengths
                                            </h4>
                                            <ul className="space-y-1">
                                                {review.feedback.strengths.map((s, i) => (
                                                    <li key={i} className="text-xs flex items-start gap-1">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold mb-1 uppercase tracking-wide">
                                                Improvements
                                            </h4>
                                            <ul className="space-y-1">
                                                {review.feedback.improvements.map((s, i) => (
                                                    <li key={i} className="text-xs flex items-start gap-1">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1" />
                                                        <span>{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Improved Explanation */}
                        <section>
                            <h3 className="text-sm font-medium mb-2">Improved Explanation</h3>
                            <Card>
                                <CardContent className="p-4">
                                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {review.improvedExplanation}
                                    </p>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Step By Step */}
                        <section>
                            <h3 className="text-sm font-medium mb-2">Step-by-Step Breakdown</h3>
                            <div className="space-y-2">
                                {review.stepByStep.map((stepText, i) => {
                                    const open = !!expandedSteps[i];
                                    return (
                                        <Card key={i} className={cn('transition', open ? 'border-primary/50' : '')}>
                                            <button
                                                type="button"
                                                onClick={() => toggleStep(i)}
                                                className="w-full text-left flex items-center justify-between p-3"
                                            >
                                                <span className="text-xs font-medium">Step {i + 1}</span>
                                                {open ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </button>
                                            {open && (
                                                <CardContent className="pt-0 pb-3 px-3">
                                                    <p className="text-xs whitespace-pre-wrap leading-relaxed">
                                                        {stepText}
                                                    </p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Hints */}
                        {review.hints?.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium mb-2">Hints (Use for Analogy / Refinement)</h3>
                                <div className="flex flex-wrap gap-2">
                                    {review.hints.slice(0, 12).map((h, i) => (
                                        <Badge
                                            key={i}
                                            variant="secondary"
                                            className="text-xs cursor-default max-w-[180px] truncate"
                                            title={h}
                                        >
                                            {h.length > 40 ? h.slice(0, 40) + '…' : h}
                                        </Badge>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Detected Gaps */}
                        {review.detectedGaps?.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium mb-2">Detected Gaps (Jargon / Ambiguity)</h3>
                                <div className="space-y-2">
                                    {review.detectedGaps.map((g, i) => (
                                        <div
                                            key={i}
                                            className="text-xs border rounded-md p-2 bg-muted/40 flex flex-col gap-0.5"
                                        >
                                            <span className="font-medium">{g.word}</span>
                                            <span className="text-muted-foreground">{g.suggestion}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Glossary */}
                        {review.glossary?.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium mb-2">Glossary</h3>
                                <div className="space-y-2">
                                    {review.glossary.map((g, i) => (
                                        <div key={i} className="text-xs flex gap-2">
                                            <span className="font-medium w-32 shrink-0">{g.term}</span>
                                            <span className="text-muted-foreground">{g.simpleDefinition}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Action Plan */}
                        {review.actionPlan?.length > 0 && (
                            <section>
                                <h3 className="text-sm font-medium mb-2">Action Plan</h3>
                                <ol className="list-decimal ml-5 space-y-1 text-xs">
                                    {review.actionPlan.map((a, i) => (
                                        <li key={i}>{a}</li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
