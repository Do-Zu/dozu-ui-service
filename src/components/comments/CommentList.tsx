'use client';

import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { IPublicComment } from '@/services/class-based-learning/comment';
import CommentItem from './CommentItem/CommentItem';

export interface CommentListProps {
    comments: IPublicComment[];
    loading?: boolean;
    onUpdate?: (commentId: number, content: string) => Promise<void>;
    onDelete?: (commentId: number) => void;
    onReply?: (commentId: number, content: string) => Promise<void>;
    currentUserId?: number;
}

export default function CommentList({
    comments,
    loading,
    onUpdate,
    onDelete,
    onReply,
    currentUserId,
}: CommentListProps) {
    // Loading state
    if (loading && comments.length === 0) {
        return (
            <div className="space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
                            <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    // Empty state
    if (comments.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Chưa có nhận xét nào. Hãy là người đầu tiên nhận xét!</p>
            </div>
        );
    }

    // Render comments
    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
                {comments.map((comment) => (
                    <CommentItem
                        key={comment.commentId}
                        comment={comment}
                        currentUserId={currentUserId}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onReply={onReply}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}
