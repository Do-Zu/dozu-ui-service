import {
    AssignmentSubmissionStatusEnum,
    IAssignmentSubmission,
    IUpdateAssignmentSubmissionBody,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionUtils from '@/app/[locale]/class-based/(assignment)/utils/assignmentSubmission.utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, FileText, Users, Link2, Upload } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

const mockSubmission = [{ name: 'Hoàng Ký Anh - Bài luận Space Tourism.docx', type: 'Google Tài liệu' }];

interface Props {
    submission: IAssignmentSubmission;
    onSubmit: ({ data }: { data: IUpdateAssignmentSubmissionBody }) => Promise<void>;
    loading: boolean;
}

export function SubmissionCard({ submission, onSubmit, loading }: Props) {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [submissions, setSubmission] = useState(mockSubmission);

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const selectedFiles = Array.from(event.target.files);
        const allFiles = selectedFiles.concat(files);
        setFiles(allFiles);
        const selectedSubmissions = selectedFiles.map((file) => ({
            name: file.name,
            type: 'Google tài liệu',
        }));
        setSubmission((prev) => {
            const allSubmissions = prev.concat(selectedSubmissions);
            return allSubmissions;
        });
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    async function handleSubmit() {
        const data: IUpdateAssignmentSubmissionBody = { status: AssignmentSubmissionStatusEnum.SUBMITTED };
        await onSubmit({ data });
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
                    {submissions.map((file) => (
                        <div
                            key={file.name}
                            className="flex items-center justify-between rounded-md border p-3 bg-secondary/30"
                        >
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <FileText className="h-5 w-5 flex-shrink-0 text-blue-500" />
                                <div className="flex flex-col overflow-hidden">
                                    <span className="truncate font-medium text-sm text-blue-700">{file.name}</span>
                                    <span className="text-xs text-muted-foreground">{file.type}</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
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

export function PrivateCommentsCard() {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Nhận xét riêng tư</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Textarea placeholder="Thêm nhận xét cho Home English..." className="min-h-[80px]" />
                <Button variant="ghost" size="sm" disabled>
                    Đăng
                </Button>
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
