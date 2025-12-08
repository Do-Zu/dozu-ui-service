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
import { ChangeEvent, useRef, useState } from 'react';
import { useSubmissionComments, useCreateSubmissionComment } from '@/services/class-based-learning/comment';
import PrivateCommentSection from '@/components/comments/PrivateCommentSection';

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
    const page = 1;
    const limit = 20;

    const { comments, loading, error, refetch } = useSubmissionComments(
        assignmentId,
        submissionId || undefined,
        page,
        limit
    );
    const { createComment, loading: creating } = useCreateSubmissionComment(assignmentId, submissionId || undefined);

    if (!submissionId) {
        return null;
    }

    return (
        <PrivateCommentSection
            comments={comments}
            loading={loading}
            error={error}
            refetch={refetch}
            createComment={createComment}
            creating={creating}
            canComment={submissionId !== null}
            placeholder="Thêm nhận xét riêng tư..."
            submitButtonText="Đăng"
        />
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
