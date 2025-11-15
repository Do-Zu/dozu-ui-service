import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Check } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { AppNode } from '@/types/mindmap/mindmap.type';

interface RoadmapItemProps {
    label: string;
    index: number;
    total: number;
    completed?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onComplete?: () => void;
    node: AppNode;
}

export function RoadmapItem({
    label,
    index,
    total,
    completed = false,
    onMoveUp,
    onMoveDown,
    onComplete,
    node,
}: RoadmapItemProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between w-full rounded-xl border p-3 bg-background shadow-sm transition-all',
                completed && 'bg-muted text-muted-foreground',
            )}
        >
            {/* Left side: reorder buttons */}
            <div className="flex flex-col gap-1">
                <Button variant="ghost" size="icon" disabled={index === 0} onClick={onMoveUp} className="h-6 w-6">
                    <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={index === total - 1}
                    onClick={onMoveDown}
                    className="h-6 w-6"
                >
                    <ArrowDown className="h-4 w-4" />
                </Button>
            </div>

            {/* Middle: item label */}
            <div className="flex-1 mx-3 font-medium truncate">{node.data.label}</div>

            {/* Right side: complete button */}
            {/* <Button variant={completed ? 'secondary' : 'default'} size="icon" onClick={onComplete} className="h-7 w-7">
                <Check className="h-4 w-4" />
            </Button> */}
        </div>
    );
}
