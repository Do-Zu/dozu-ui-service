'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CommentList from './CommentList';
import { useSubmissionComments, useCreateSubmissionComment, useDeleteComment } from '@/services/class-based-learning/comment';
import { useAuth } from '@/contexts/auth/AuthContext';
import toastHelper from '@/utils/toast.helper';

interface PrivateCommentSectionProps {
    assignmentId: number;
    submissionId: number | null;
}

export default function PrivateCommentSection({ assignmentId, submissionId }: PrivateCommentSectionProps) {
    const { user } = useAuth();
    const [commentContent, setCommentContent] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    const { comments, loading, error, refetch } = useSubmissionComments(
        assignmentId,
        submissionId || undefined,
        page,
        limit
    );
    const { createComment, loading: creating } = useCreateSubmissionComment(assignmentId, submissionId || undefined);
    const { deleteComment, loading: deleting } = useDeleteComment();

    const canEdit = submissionId !== null;

    const handleCreateComment = async () => {
        if (!commentContent.trim() || !submissionId || creating) return;

        try {
            await createComment({ content: commentContent.trim() });
            toastHelper.showSuccessMessage('Đã thêm nhận xét riêng tư thành công');
            setCommentContent('');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể thêm nhận xét. Vui lòng thử lại.');
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

    if (!submissionId) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Nhận xét riêng tư</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Thêm nhận xét riêng tư cho học viên..."
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    disabled={!canEdit || creating}
                    className="min-h-[100px]"
                />
                <div className="flex justify-end">
                    <Button
                        variant="secondary"
                        onClick={handleCreateComment}
                        disabled={!canEdit || !commentContent.trim() || creating}
                    >
                        {creating ? 'Đang gửi...' : 'Gửi'}
                    </Button>
                </div>

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                {comments.length > 0 && (
                    <>
                        <div className="border-t pt-4">
                            <CommentList
                                comments={comments}
                                loading={loading}
                                onDelete={handleDeleteComment}
                                currentUserId={user?.userId ? Number(user.userId) : undefined}
                            />
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

