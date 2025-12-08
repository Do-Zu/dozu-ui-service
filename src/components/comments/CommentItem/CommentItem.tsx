'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IPublicComment } from '@/services/class-based-learning/comment';
import ConnectorLines from './ConnectorLines';
import CommentContent from './CommentContent';
import CommentActions from './CommentActions';
import ReplyInput from './ReplyInput';
import { formatRelativeTime, getInitials } from '../utils/format';

interface CommentItemProps {
    comment: IPublicComment;
    currentUserId?: number;
    onUpdate?: (commentId: number, content: string) => Promise<void>;
    onDelete?: (commentId: number) => void;
    onReply?: (commentId: number, content: string) => Promise<void>;
    level?: number;
}

export default function CommentItem({
    comment,
    currentUserId,
    onUpdate,
    onDelete,
    onReply,
    level = 0,
}: CommentItemProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [updating, setUpdating] = useState(false);

    const sender = comment.sender;
    const isOwner = currentUserId === comment.senderId;
    const replies = comment.replies || [];
    const hasReplies = replies.length > 0;

    const handleStartEdit = () => {
        setIsEditing(true);
        setShowReplyInput(false);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    const handleSaveEdit = async (content: string) => {
        if (!onUpdate) return;

        try {
            setUpdating(true);
            await onUpdate(comment.commentId, content);
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to update comment:', error);
            throw error;
        } finally {
            setUpdating(false);
        }
    };

    const handleReply = async (content: string) => {
        if (!onReply) return;

        try {
            await onReply(comment.commentId, content);
            setShowReplyInput(false);
        } catch (error) {
            console.error('Failed to reply:', error);
            throw error;
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(comment.commentId);
        }
    };

    return (
        <div className={level > 0 ? 'relative pl-8 mt-3' : ''}>
            {/* Beautiful curved connector lines */}
            <ConnectorLines level={level} />

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors relative z-10">
                <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={sender?.avatarUrl || undefined} alt={sender?.username || 'User'} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs">
                        {getInitials(sender?.fullName || null, sender?.username || '')}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    {/* Header: Name, badge, timestamp */}
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {sender?.fullName || sender?.username || 'Người dùng'}
                        </span>
                        {isOwner && (
                            <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                Bạn
                            </span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                        </span>
                    </div>

                    {/* Content: Edit mode or display mode */}
                    <CommentContent
                        content={comment.content}
                        isEditing={isEditing}
                        updatedAt={comment.updatedAt}
                        createdAt={comment.createdAt}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        updating={updating}
                    />

                    {/* Actions: Reply, Edit, Delete */}
                    <CommentActions
                        isOwner={isOwner}
                        isEditing={isEditing}
                        onReply={() => setShowReplyInput(!showReplyInput)}
                        onEdit={handleStartEdit}
                        onDelete={handleDelete}
                    />

                    {/* Reply input */}
                    {showReplyInput && onReply && (
                        <ReplyInput
                            onReply={handleReply}
                            onCancel={() => setShowReplyInput(false)}
                        />
                    )}
                </div>
            </div>

            {/* Render replies recursively - infinite tree support */}
            {hasReplies && (
                <div className="mt-2 ml-8 relative">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.commentId}
                            comment={reply}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                            onDelete={onDelete}
                            onReply={onReply}
                            level={level + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
