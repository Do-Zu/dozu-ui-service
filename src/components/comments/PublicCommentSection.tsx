'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import CommentList from '@/components/comments/CommentList';
import { useUpdateComment, useDeleteComment, IPublicComment, ICreatePublicCommentBody } from '@/services/class-based-learning/comment';
import { useAuth } from '@/contexts/auth/AuthContext';
import toastHelper from '@/utils/toast.helper';
import { MessageCircle } from 'lucide-react';
import CommentInput from '@/app/[locale]/teacher/class-based/[id]/assignments/[assignmentId]/details/components/CommentInput';

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
    title = 'Nhận xét công khai',
    commentInputComponent: CommentInputComponent = CommentInput,
}: PublicCommentSectionProps) {
    const { user } = useAuth();
    const { updateComment } = useUpdateComment();
    const { deleteComment } = useDeleteComment();

    const handleCreateComment = async (content: string) => {
        try {
            await createComment({ content });
            toastHelper.showSuccessMessage('Đã thêm nhận xét thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể thêm nhận xét. Vui lòng thử lại.');
            throw error;
        }
    };

    const handleReply = async (commentId: number, content: string) => {
        try {
            await createComment({ content, parentCommentId: commentId });
            toastHelper.showSuccessMessage('Đã thêm phản hồi thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể thêm phản hồi. Vui lòng thử lại.');
            throw error;
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        try {
            await updateComment(commentId, { content });
            toastHelper.showSuccessMessage('Đã cập nhật nhận xét thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể cập nhật nhận xét. Vui lòng thử lại.');
            throw error;
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa nhận xét này?')) {
            return;
        }

        try {
            await deleteComment(commentId);
            toastHelper.showSuccessMessage('Đã xóa nhận xét thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể xóa nhận xét. Vui lòng thử lại.');
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <CommentInputComponent onSubmit={handleCreateComment} loading={creating} />
                <Separator />
                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}
                <CommentList
                    comments={comments}
                    loading={loading}
                    onUpdate={handleUpdateComment}
                    onDelete={handleDeleteComment}
                    onReply={handleReply}
                    currentUserId={user?.userId ? Number(user.userId) : undefined}
                />
            </CardContent>
        </Card>
    );
}

export default PublicCommentSection;
export { PublicCommentSection };
