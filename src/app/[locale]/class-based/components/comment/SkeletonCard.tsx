import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SkeletonCardProps {
    showReplies?: boolean;
    replyCount?: number;
    depth?: number;
}

const CommentSkeleton = ({ depth = 0 }: { depth?: number }) => {
    return (
        <div
            className={cn(
                'group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/30 border border-gray-100/50 dark:border-gray-700/50 border-[1px]',
            )}
            style={{ marginLeft: `${depth * 24}px` }}
        >
            <div className="flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />

                <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-3 w-16 opacity-60" />
                        </div>
                        <Skeleton className="h-3 w-20" />
                    </div>

                    {/* Comment content */}
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const CommentListSkeleton = ({ showReplies = true, replyCount = 2, depth = 0 }: SkeletonCardProps) => {
    return (
        <div className="space-y-4">
            <CommentSkeleton depth={depth} />

            {/* Render reply skeletons if needed */}
            {showReplies && replyCount > 0 && (
                <div className="space-y-3">
                    {Array.from({ length: replyCount }).map((_, index) => (
                        <CommentSkeleton key={index} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentThreadSkeleton = ({ amount = 2 }: { amount?: number }) => {
    return (
        <div className="rounded-2xl ">
            <div className="space-y-6">
                {Array.from({ length: amount }).map((_, index) => {
                    return <CommentListSkeleton showReplies={false} key={index} />;
                })}
            </div>
        </div>
    );
};

export { CommentSkeleton, CommentListSkeleton };
export default CommentThreadSkeleton;
