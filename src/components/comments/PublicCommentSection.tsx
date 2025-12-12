'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { MessageCircle } from 'lucide-react';
import CommentInput from '@/app/[locale]/teacher/class-based/[id]/assignments/[assignmentId]/details/components/CommentInput';
import { useTranslations } from 'next-intl';

export interface PublicCommentSectionProps {
    // Data hooks
    comments: IPublicComment[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    // Create comment hook
    createComment: (body: ICreatePublicCommentBody) => Promise<IPublicComment | null>;
    creating: boolean;
    // Optional props
    title?: string;
    commentInputComponent?: React.ComponentType<{
        onSubmit: (content: string) => Promise<void>;
        loading: boolean;
    }>;
}

function PublicCommentSection({
    comments,
    loading,
    error,
    refetch,
    createComment,
    creating,
    title,
    commentInputComponent: CommentInputComponent = CommentInput,
}: PublicCommentSectionProps) {
    const t = useTranslations('classBased.comment');
    const { user } = useAuth();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState<number | null>(null);
    const { updateComment } = useUpdateComment();
    const { deleteComment } = useDeleteComment();
    
    const sectionTitle = title || t('section.title');

    const handleCreateComment = async (content: string) => {
        try {
            await createComment({ content });
            toastHelper.showSuccessMessage(t('toast.createSuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(t('toast.createError'));
            throw error;
        }
    };

    const handleReply = async (commentId: number, content: string) => {
        try {
            await createComment({ content, parentCommentId: commentId });
            toastHelper.showSuccessMessage(t('toast.replySuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(t('toast.replyError'));
            throw error;
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        try {
            await updateComment(commentId, { content });
            toastHelper.showSuccessMessage(t('toast.updateSuccess'));
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage(t('toast.updateError'));
            throw error;
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
            toastHelper.showSuccessMessage(t('toast.deleteSuccess'));
            refetch();
            setDeleteDialogOpen(false);
            setCommentIdToDelete(null);
        } catch (error) {
            toastHelper.showErrorMessage(t('toast.deleteError'));
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {sectionTitle}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <CommentInputComponent onSubmit={handleCreateComment} loading={creating} />
                <Separator />
                {error && (
                    <div className="text-sm text-destructive p-3 bg-destructive/10 rounded-lg">
                        {error}
                    </div>
                )}
                <CommentList
                    comments={comments}
                    loading={loading}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteClick}
                    onReply={handleReply}
                    currentUserId={user?.userId ? Number(user.userId) : undefined}
                />
            </CardContent>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('toast.deleteTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('toast.deleteConfirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setCommentIdToDelete(null)}>
                            {t('actions.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('actions.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

export default PublicCommentSection;
export { PublicCommentSection };
