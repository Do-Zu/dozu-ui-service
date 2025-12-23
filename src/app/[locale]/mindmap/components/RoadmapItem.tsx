import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Check, ChevronRight } from 'lucide-react'; // Import ChevronRight
import React from 'react';
import { cn } from '@/lib/utils';
import { AppNode } from '@/types/mindmap/mindmap.type';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { useInternalNode } from '@xyflow/react';
import { useMindMapContext } from '../context/MindMapContext';

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

    const internalNode = useInternalNode(node.data.nodeId);
    const { fitView } = useMindMapContext();

    const handleClickRoadmapItem = () => {
        if (internalNode) {
            requestAnimationFrame(() => {
                fitView({ nodes: [internalNode], duration: 800, padding: 1 });
            });
        }
    };

    return (
        <div
            className={cn(
                'relative flex items-center w-full rounded-xl border bg-background shadow-sm transition-all px-3 py-2',
                completed && 'bg-muted text-muted-foreground',
            )}
            onClick={handleClickRoadmapItem}
        >
            {/* Left content (text truncates behind buttons) */}
            <div className="flex flex-1 items-center gap-3 pr-20">
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
                                className="size-6 p-0"
                            >
                                <ArrowUp className="size-4" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={index === total - 1}
                                onClick={onMoveDown}
                                className="size-6 p-0"
                            >
                                <ArrowDown className="size-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    ''
                )}

                {/* Label */}
                <div className="line-clamp-2 break-words text-base font-medium">{label}</div>
            </div>

            {/* Right side action buttons (floated on top) */}
            <div className="absolute right-0 top-0 flex h-full border-l">
                {/* Expand */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onExpand}
                    className="h-full w-9 rounded-none border-r text-muted-foreground hover:text-foreground"
                >
                    <ChevronRight className="size-4" />
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
                            <Check className="size-4" />
                        </Button>
                    </>
                ) : (
                    ''
                )}
            </div>
        </div>
    );
}
