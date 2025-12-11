'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import CommentList from '@/components/comments/CommentList';
import { useUpdateComment, useDeleteComment, IPublicComment, ICreatePublicCommentBody } from '@/services/class-based-learning/comment';
import { useAuth } from '@/contexts/auth/AuthContext';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';

export interface PrivateCommentSectionProps {
    // Data hooks
    comments: IPublicComment[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    // Create comment hook
    createComment: (body: ICreatePublicCommentBody) => Promise<IPublicComment | null>;
    creating: boolean;
    // Conditional rendering
    canComment: boolean;
    // Optional props
    title?: string;
    placeholder?: string;
    submitButtonText?: string;
    creatingText?: string;
    showCommentsOnlyWhenHasData?: boolean;
}

export default function PrivateCommentSection({
    comments,
    loading,
    error,
    refetch,
    createComment,
    creating,
    canComment,
    title,
    placeholder,
    submitButtonText,
    creatingText,
    showCommentsOnlyWhenHasData = true,
}: PrivateCommentSectionProps) {
    const t = useTranslations('assignment.comments');
    const tComment = useTranslations('classBased.comment');
    const { user } = useAuth();
    const [commentContent, setCommentContent] = useState('');
    const { updateComment } = useUpdateComment();
    const { deleteComment } = useDeleteComment();
    
    const defaultTitle = title || t('privateComment');
    const defaultPlaceholder = placeholder || t('addPrivateComment');
    const defaultSubmitText = submitButtonText || t('send');
    const defaultCreatingText = creatingText || t('sending');

    const handleCreateComment = async () => {
        if (!commentContent.trim() || creating) return;

        try {
            await createComment({ content: commentContent.trim() });
            toastHelper.showSuccessMessage(tComment('toast.createSuccess'));
            setCommentContent('');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(tComment('toast.createError'));
        }
    };

    const handleReply = async (commentId: number, content: string) => {
        if (creating) return;

        try {
            await createComment({ content, parentCommentId: commentId });
            toastHelper.showSuccessMessage(tComment('toast.replySuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(tComment('toast.replyError'));
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        try {
            await updateComment(commentId, { content });
            toastHelper.showSuccessMessage(tComment('toast.updateSuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(tComment('toast.updateError'));
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm(tComment('toast.deleteConfirm'))) {
            return;
        }

        try {
            await deleteComment(commentId);
            toastHelper.showSuccessMessage(tComment('toast.deleteSuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(tComment('toast.deleteError'));
        }
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">{defaultTitle}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {canComment && (
                    <div className="space-y-2">
                        <Textarea
                            placeholder={defaultPlaceholder}
                            className="min-h-[80px] resize-y"
                            value={commentContent}
                            onChange={(e) => setCommentContent(e.target.value)}
                            disabled={creating}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                    e.preventDefault();
                                    handleCreateComment();
                                }
                            }}
                        />
                        <div className="flex justify-end">
                            <Button
                                variant="default"
                                size="sm"
                                onClick={handleCreateComment}
                                disabled={!commentContent.trim() || creating}
                            >
                                {creating ? defaultCreatingText : defaultSubmitText}
                            </Button>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        {error}
                    </div>
                )}

                {(showCommentsOnlyWhenHasData ? comments.length > 0 : true) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <CommentList
                            comments={comments}
                            loading={loading}
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteComment}
                            onReply={handleReply}
                            currentUserId={user?.userId ? Number(user.userId) : undefined}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
