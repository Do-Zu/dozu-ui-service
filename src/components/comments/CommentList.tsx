'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
    flatMode?: boolean; // If true, display comments in flat list without nested replies
}

export default function CommentList({
    comments,
    loading,
    onUpdate,
    onDelete,
    onReply,
    currentUserId,
    flatMode = false,
}: CommentListProps) {
    const t = useTranslations('classBased.comment');

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
                <p>{t('noCommentsBody')}</p>
            </div>
        );
    }

    // Flatten comments if flatMode is enabled and create parent map
    let displayComments: IPublicComment[] = comments;
    const parentCommentMap = new Map<number, IPublicComment>();

    if (flatMode) {
        // Build parent map first
        comments.forEach((comment) => {
            parentCommentMap.set(comment.commentId, comment);
            if (comment.replies) {
                comment.replies.forEach((reply) => {
                    parentCommentMap.set(reply.commentId, reply);
                });
            }
        });

        // Flatten comments
        displayComments = comments.reduce<IPublicComment[]>((acc, comment) => {
            acc.push(comment);
            if (comment.replies && comment.replies.length > 0) {
                acc.push(...comment.replies);
            }
            return acc;
        }, []);
    }

    // Render comments
    return (
        <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
                {displayComments.map((comment) => {
                    const parentComment = flatMode && comment.parentCommentId 
                        ? parentCommentMap.get(comment.parentCommentId) 
                        : null;

                    return (
                        <CommentItem
                            key={`comment-${comment.commentId}-${comment.updatedAt || comment.createdAt}`}
                            comment={flatMode ? { ...comment, replies: [] } : comment}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onReply={onReply}
                            parentComment={parentComment || undefined}
                            isFlatMode={flatMode}
                        />
                    );
                })}
            </div>
        </ScrollArea>
    );
}
