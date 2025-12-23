import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Check, ChevronRight } from 'lucide-react'; // Import ChevronRight
import React from 'react';
import { cn } from '@/lib/utils';
import { AppNode } from '@/types/mindmap/mindmap.type';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

interface RoadmapItemProps {
    label: string;
    index: number;
    total: number;
    completed?: boolean;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
    onComplete?: () => void;
    onExpand?: () => void; // New prop for expand action
    node: AppNode;
    role?: UserRoleEnum.USER | UserRoleEnum.TEACHER;
    mode?: ILearningMode;
}
export function RoadmapItem({
    label,
    index,
    total,
    completed,
    onMoveUp,
    onMoveDown,
    onComplete,
    onExpand,
    node,
    role = UserRoleEnum.TEACHER,
    mode,
}: RoadmapItemProps) {
    const completeButtonVariant = completed ? 'secondary' : 'outline';

    return (
        <div
            className={cn(
                'relative flex items-center w-full rounded-xl border bg-background shadow-sm transition-all px-3 py-2',
                completed && 'bg-muted text-muted-foreground',
            )}
        >
            {/* Left content (text truncates behind buttons) */}
            <div className="flex items-center gap-3 flex-1 pr-20">
                {/* Reorder buttons */}
                {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                    <>
                        {' '}
                        <div className="flex flex-col gap-1.5">
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={index === 0}
                                onClick={onMoveUp}
                                className="h-6 w-6 p-0"
                            >
                                <ArrowUp className="h-4 w-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={index === total - 1}
                                onClick={onMoveDown}
                                className="h-6 w-6 p-0"
                            >
                                <ArrowDown className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    ''
                )}

                {/* Label */}
                <div className="font-medium text-base break-words line-clamp-2">{label}</div>
            </div>

            {/* Right side action buttons (floated on top) */}
            <div className="absolute right-0 top-0 h-full flex border-l">
                {/* Expand */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onExpand}
                    className="h-full w-9 rounded-none border-r text-muted-foreground hover:text-foreground"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Complete */}

                {mode === MODE_ACCESS_PAGE_ROLE.personal && role !== UserRoleEnum.TEACHER ? (
                    <>
                        <Button
                            variant={completeButtonVariant}
                            size="icon"
                            onClick={onComplete}
                            className="h-full w-11 rounded-none"
                        >
                            <Check className="h-4 w-4" />
                        </Button>
                    </>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}
