'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    flatMode?: boolean; // If true, display comments in flat list without nested replies
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
    flatMode = false,
}: PrivateCommentSectionProps) {
    const t = useTranslations('assignment.comments');
    const tComment = useTranslations('classBased.comment');
    const { user } = useAuth();
    const [commentContent, setCommentContent] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState<number | null>(null);
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

    const handleDeleteClick = (commentId: number) => {
        setCommentIdToDelete(commentId);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!commentIdToDelete) return;

        try {
            await deleteComment(commentIdToDelete);
            toastHelper.showSuccessMessage(tComment('toast.deleteSuccess'));
            refetch();
            setDeleteDialogOpen(false);
            setCommentIdToDelete(null);
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
                    <div className="flex items-end gap-2">
                        <Textarea
                            placeholder={defaultPlaceholder}
                            className="min-h-[60px] flex-1 resize-none"
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
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleCreateComment}
                            disabled={!commentContent.trim() || creating}
                            className="shrink-0"
                        >
                            {creating ? defaultCreatingText : defaultSubmitText}
                        </Button>
                    </div>
                )}

                {error && (
                    <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        {error}
                    </div>
                )}

                {(showCommentsOnlyWhenHasData ? comments.length > 0 : true) && (
                    <div className="border-t border-border pt-4 mt-4">
                        <CommentList
                            comments={comments}
                            loading={loading}
                            onUpdate={handleUpdateComment}
                            onDelete={handleDeleteClick}
                            onReply={handleReply}
                            currentUserId={user?.userId ? Number(user.userId) : undefined}
                            flatMode={flatMode}
                        />
                    </div>
                )}
            </CardContent>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{tComment('toast.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {tComment('toast.deleteConfirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentIdToDelete(null)}>
                            {tComment('actions.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {tComment('actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
