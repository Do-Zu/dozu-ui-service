'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type Props = {
    step: 1 | 2;
    onGetHints: () => void;
    onSave: () => void;
    onReset: () => void;
    clarityScore?: number; // 0..100
    jargonCount?: number;
    isLoading?: boolean;
};

export function ActionBar({ step, onGetHints, onSave, onReset, clarityScore = 0, jargonCount = 0, isLoading }: Props) {
    const badge =
        jargonCount === 0 ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-medium">
                Jargon-free ✓
            </span>
        ) : null;

    return (
        <div className="flex flex-col gap-3 lg:items-center lg:justify-between rounded-2xl border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-sm font-medium">Step {step} of 2</div>
                <div className="hidden lg:block text-muted-foreground text-sm">Write → Review</div>
            </div>

            <div className="flex-1 min-w-0 ">
                <div className="flex items-center gap-2 text-xs mb-1">
                    <span>Clarity Score</span>
                    {badge}
                    <span className="ml-auto">{Math.round(clarityScore)}%</span>
                </div>
                <Progress value={clarityScore} />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <Button variant="secondary" onClick={onReset} disabled={isLoading}>
                    Reset
                </Button>
                <Button variant="outline" onClick={onSave} disabled={isLoading}>
                    Save Explanation
                </Button>
                <Button onClick={onGetHints} disabled={isLoading}>
                    {isLoading ? 'Thinking…' : 'Get Questions & Hints'}
                </Button>
            </div>
        </div>
    );
}
