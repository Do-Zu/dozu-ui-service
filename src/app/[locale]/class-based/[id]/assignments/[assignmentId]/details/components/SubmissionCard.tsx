import AttachmentItem from '@/app/[locale]/class-based/(classwork)/components/common/AttachmentItem';
import {
    AssignmentSubmissionStatusEnum,
    IAssignmentSubmission,
    IAssignmentSubmissionStatus,
    IUpdateAssignmentSubmissionBody,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionUtils from '@/app/[locale]/class-based/(assignment)/utils/assignmentSubmission.utils';
import FileItem from '@/app/[locale]/class-based/(classwork)/components/common/FileItem';
import { IAttachment } from '@/app/[locale]/class-based/(classwork)/types/attachment.type';
import attachmentUtils from '@/app/[locale]/class-based/(classwork)/utils/attachment.utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FileText, Users, Link2, Upload } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';
import UrlAttachmentItem from '@/app/[locale]/class-based/(classwork)/components/common/UrlAttachmentItem';
import UrlAttachmentModal from '@/app/[locale]/class-based/(classwork)/components/common/UrlAttachmentModal';
import { useSubmissionComments, useCreateSubmissionComment } from '@/services/class-based-learning/comment';
import PrivateCommentSection from '@/components/comments/PrivateCommentSection';
import { useTranslations } from 'next-intl';
import { isNil } from '@/utils';

interface Props {
    submission: IAssignmentSubmission;
    attachments: IAttachment[];
    urlAttachments: string[];
    onSubmit: ({
        data,
        files,
    }: {
        data: Omit<IUpdateAssignmentSubmissionBody, 'inputResources'>;
        files: File[];
    }) => Promise<void>;
    loading: boolean;
    grade?: number | null;
    totalGrade?: number;
}

export function SubmissionCard({ submission, attachments, urlAttachments, onSubmit, loading, grade, totalGrade }: Props) {
    const t = useTranslations('assignment');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    //modal open
    const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

    // Get status label with translation
    // If status is undefined/null, treat it as 'draft' (assigned but not submitted)
    const getStatusLabel = (status: IAssignmentSubmissionStatus | undefined) => {
        const actualStatus = status ?? 'draft';
        switch (actualStatus) {
            case 'draft':
                return t('status.draft');
            case 'submitted':
                return t('status.submitted');
            case 'returned':
                return t('status.returned');
            default:
                return t('status.draft'); // Fallback to draft instead of invalid
        }
    };

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
        const data = { status: AssignmentSubmissionStatusEnum.SUBMITTED, urls: [...urlAttachments, ...urls] };
        await onSubmit({ data, files });
        setFiles([]);
        setUrls([]);
    }

    function handleFileRemove(index: number) {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    }

    // Get grade-based color (for consistent coloring with score)
    const getGradeColor = () => {
        if (isNil(grade) || !totalGrade) return null;
        const percent = (grade / totalGrade) * 100;
        if (percent >= 80) {
            return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30';
        }
        if (percent >= 60) {
            return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30';
        }
        if (percent >= 40) {
            return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
        }
        return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30';
    };

    // Get status badge styling - use grade color if available and status is 'returned'
    const getStatusBadge = (status: IAssignmentSubmissionStatus) => {
        // If status is 'returned' and we have grade, use grade-based color for consistency
        if (status === 'returned' && !isNil(grade) && totalGrade) {
            const gradeColor = getGradeColor();
            if (gradeColor) {
                return {
                    label: getStatusLabel(status),
                    className: gradeColor,
                };
            }
        }
        
        // Otherwise use status-based colors
        switch (status) {
            case 'submitted':
                return {
                    label: getStatusLabel(status),
                    className: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
                };
            case 'returned':
                return {
                    label: getStatusLabel(status),
                    className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
                };
            case 'draft':
            default:
                return {
                    label: getStatusLabel(status),
                    className: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
                };
        }
    };

    const statusBadge = getStatusBadge(submission.status);

    return (
        <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/30">
                <CardTitle className="text-lg font-semibold">{t('submission.yourAssignment')}</CardTitle>
                <Badge 
                    variant="outline" 
                    className={`text-xs font-semibold px-3 py-1 ${statusBadge.className}`}
                >
                    {statusBadge.label}
                </Badge>
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
                    {urls?.map((u, i) => (
                        <FileItem
                            key={i}
                            title={'link'}
                            url={u}
                            onRemove={() => setUrls(urls.filter((_, idx) => idx !== i))}
                        />
                    ))}
                    {attachments.map((attachment) => (
                        <AttachmentItem key={attachment.attachmentId} attachment={attachment} />
                    ))}
                    {urlAttachments.map((url, i) => (
                        <UrlAttachmentItem key={i} url={url} />
                    ))}
                </div>

                <div className="flex flex-wrap gap-4">
                    <Button variant="outline" onClick={() => setIsUrlModalOpen(true)}>
                        <Link2 className="mr-2 h-4 w-4" /> {t('submission.link')}
                    </Button>
                    <Button variant="outline" onClick={handleUploadClick}>
                        <Upload className="mr-2 h-4 w-4" /> {t('submission.uploadFile')}
                    </Button>
                    <UrlAttachmentModal
                        open={isUrlModalOpen}
                        onClose={() => setIsUrlModalOpen(false)}
                        onSubmit={(link) => {
                            setUrls((prev) => [...prev, link]);
                        }}
                    />
                    <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                </div>
                <Button className="w-full" onClick={handleSubmit} disabled={loading}>
                    {loading ? t('submission.saving') : t('submission.submit')}
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
    const t = useTranslations('assignment');
    const page = 1;
    const limit = 20;

    const { comments, loading, error, refetch } = useSubmissionComments(
        assignmentId,
        submissionId || undefined,
        page,
        limit,
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
            placeholder={t('comments.addPrivateComment')}
            submitButtonText={t('comments.post')}
            flatMode={true}
        />
    );
}

export function ClassCommentsCard() {
    const t = useTranslations('assignment');

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm font-medium">{t('comments.classComments')}</p>
                </div>
                <button className="mt-3 w-full rounded-lg border p-3 text-left text-sm text-muted-foreground hover:bg-muted/50">
                    {t('comments.addClassComment')}
                </button>
            </CardContent>
        </Card>
    );
}
