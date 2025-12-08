import AttachmentItem from '@/app/[locale]/class-based/(classwork)/components/common/AttachmentItem';
import {
    AssignmentSubmissionStatusEnum,
    IAssignmentSubmission,
    IUpdateAssignmentSubmissionBody,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionUtils from '@/app/[locale]/class-based/(assignment)/utils/assignmentSubmission.utils';
import FileItem from '@/app/[locale]/class-based/(classwork)/components/common/FileItem';
import { IAttachment } from '@/app/[locale]/class-based/(classwork)/types/attachment.type';
import attachmentUtils from '@/app/[locale]/class-based/(classwork)/utils/attachment.utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FileText, Users, Link2, Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useSubmissionComments, useCreateSubmissionComment, useUpdateComment, useDeleteComment } from '@/services/class-based-learning/comment';
import { useAuth } from '@/contexts/auth/AuthContext';
import toastHelper from '@/utils/toast.helper';
import CommentList from '@/components/comments/CommentList';

interface Props {
    submission: IAssignmentSubmission;
    attachments: IAttachment[];
    onSubmit: ({
        data,
        files,
    }: {
        data: Omit<IUpdateAssignmentSubmissionBody, 'inputResources'>;
        files: File[];
    }) => Promise<void>;
    loading: boolean;
}

export function SubmissionCard({ submission, attachments, onSubmit, loading }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const selectedFiles = Array.from(event.target.files);
        const allFiles = selectedFiles.concat(files);
        setFiles(allFiles);
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    async function handleSubmit() {
        const data = { status: AssignmentSubmissionStatusEnum.SUBMITTED };
        await onSubmit({ data, files });
        setFiles([]);
    }

    function handleFileRemove(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">Bài tập của bạn</CardTitle>
                <span className="text-sm text-muted-foreground">
                    {assignmentSubmissionUtils.getStatusLabel(submission.status)}
                </span>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <FileItem
                            key={`file-${index}-${file.name}`}
                            file={file}
                            onRemove={() => handleFileRemove(index)}
                        />
                    ))}
                    {attachments.map((attachment) => (
                        <AttachmentItem key={attachment.attachmentId} attachment={attachment} />
                    ))}
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline">
                        <Link2 className="mr-2 h-4 w-4" /> Liên kết
                    </Button>
                    <Button variant="outline" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" /> Tải lên Tệp
                    </Button>
                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Saving...' : 'Nộp bài'}
                </Button>
            </CardContent>
        </Card>
    );
}

interface PrivateCommentsCardProps {
    assignmentId: number;
    submissionId: number | null;
}

export function PrivateCommentsCard({ assignmentId, submissionId }: PrivateCommentsCardProps) {
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
    const { updateComment, loading: updating } = useUpdateComment();
    const { deleteComment, loading: deleting } = useDeleteComment();

    const canComment = submissionId !== null;

    const handleCreateComment = async () => {
        if (!commentContent.trim() || !submissionId || creating) return;

        try {
            await createComment({ content: commentContent.trim() });
            toastHelper.showSuccessMessage('Đã thêm nhận xét thành công');
            setCommentContent('');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể thêm nhận xét. Vui lòng thử lại.');
        }
    };

    const handleReply = async (commentId: number, content: string) => {
        if (!submissionId || creating) return;

        try {
            await createComment({ content, parentCommentId: commentId });
            toastHelper.showSuccessMessage('Đã thêm phản hồi thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể thêm phản hồi. Vui lòng thử lại.');
        }
    };

    const handleUpdateComment = async (commentId: number, content: string) => {
        try {
            await updateComment(commentId, { content });
            toastHelper.showSuccessMessage('Đã cập nhật nhận xét thành công');
            refetch();
        } catch (error) {
            toastHelper.showErrorMessage('Không thể cập nhật nhận xét. Vui lòng thử lại.');
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
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Nhận xét riêng tư</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea
                    placeholder="Thêm nhận xét riêng tư..."
                    className="min-h-[80px]"
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    disabled={!canComment || creating}
                />
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCreateComment}
                    disabled={!canComment || !commentContent.trim() || creating}
                >
                    {creating ? 'Đang gửi...' : 'Đăng'}
                </Button>

                {error && (
                    <div className="text-sm text-red-600 dark:text-red-400 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        {error}
                    </div>
                )}

                {comments.length > 0 && (
                    <div className="border-t pt-3 mt-3">
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

export function ClassCommentsCard() {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">Nhận xét của lớp học</p>
                </div>
                <button className="mt-3 w-full rounded-lg border p-3 text-left text-sm text-muted-foreground hover:bg-muted/50">
                    Thêm nhận xét trong lớp học...
                </button>
            </CardContent>
        </Card>
    );
}
