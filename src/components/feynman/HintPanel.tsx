'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
    questions: string[];
    hints: string[];
    feedback?: string;
    detectedGaps?: { word: string; suggestion: string }[];
    expanded?: boolean;
    onToggle?: () => void;
};

export function HintPanel({ questions, hints, feedback, detectedGaps, expanded, onToggle }: Props) {
    const hasContent = questions.length || hints.length || detectedGaps?.length || feedback;
    return (
        <div className="space-y-3">
            <AnimatePresence>
                {hasContent ? (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <Card className="rounded-2xl">
                            <CardHeader>
                                <CardTitle className="text-lg">AI Guidance</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {feedback && (
                                    <div>
                                        <div className="text-sm font-medium mb-1">Feedback</div>
                                        <p className="text-sm text-muted-foreground">{feedback}</p>
                                    </div>
                                )}
                                {questions?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium mb-1">Questions</div>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            {questions.map((q, i) => (
                                                <li key={i}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {hints?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium mb-1">Hints</div>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            {hints.map((h, i) => (
                                                <li key={i}>{h}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {detectedGaps && detectedGaps.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium mb-1">Detected Gaps</div>
                                        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                                            {detectedGaps.map((g, i) => (
                                                <li key={i}>
                                                    <span className="font-medium">{g.word}:</span> {g.suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={onToggle}
                                    className="text-xs text-primary underline underline-offset-2"
                                >
                                    {expanded ? 'Hide' : 'See More Suggestions'}
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
