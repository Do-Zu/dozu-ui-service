'use client';

import ContentSection from '@/app/[locale]/class-based/(classwork)/components/common/details/ContentSection';
import AttachmentsSection from '@/app/[locale]/class-based/(classwork)/components/common/details/AttachmentsSection';
import { Separator } from '@/components/ui/separator';
import useFetch from '@/hooks/useFetch';
import { IAssignment } from '@/app/[locale]/class-based/(assignment)/types/assignment.type';
import assignmentService from '@/app/[locale]/class-based/(assignment)/service/assignment.service';
import { useParams, useRouter } from 'next/navigation';
import LoadingPage from '@/app/loading';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PrivateCommentsCard, SubmissionCard } from './components/SubmissionCard';
import {
    IAssignmentSubmission,
    IUpdateAssignmentSubmissionBody,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionService, {
    IUpdateAssignmentSubmissionPayload,
} from '@/app/[locale]/class-based/(assignment)/service/assignmentSubmission.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';

// Mock data (for now)
const mockAssignment = {
    assignmentId: 8,
    classId: 1,
    topicId: 35,
    title: 'History assignment',
    description: 'Writing about history.',
    createdAt: '2025-10-24T08:02:43.826Z',
    attachments: [
        {
            attachmentId: 1,
            title: 'How Your Brain Alters Your Reality.mp4',
            description: '',
            contentType: 'video/mp4',
            metadata: { size: '34MB' },
            createdAt: '2025-10-24T09:00:00.000Z',
        },
        {
            attachmentId: 2,
            title: 'Wikipedia, bách khoa toàn thư mở.png',
            description: '',
            contentType: 'image/png',
            metadata: { size: '2.1MB' },
            createdAt: '2025-10-24T09:05:00.000Z',
        },
        {
            attachmentId: 3,
            title: 'Basic English - Wikipedia.pdf',
            description: '',
            contentType: 'application/pdf',
            metadata: { size: '1.8MB' },
            createdAt: '2025-10-24T09:10:00.000Z',
        },
    ],
    grade: 100,
    deadline: '2025-11-27T09:10:00.000Z',
};

export default function Page() {
    const params = useParams();
    const isValidClassId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    const isValidAssignmentId =
        typeof params.assignmentId === 'string' &&
        !isNaN(Number(params.assignmentId)) &&
        Number(params.assignmentId) > 0;

    const isValidId = isValidClassId && isValidAssignmentId;
    if (!isValidId) {
        return <div className="p-8">Invalid classId, please try again.</div>;
    }

    const classId = Number(params.id);
    const assignmentId = Number(params.assignmentId);

    return <ValidPage classId={classId} assignmentId={assignmentId} />;
}

function ValidPage({ classId, assignmentId }: { classId: number; assignmentId: number }) {
    const router = useRouter();
    const tCommon = useTranslations('common');

    // submission
    const {
        data: submission,
        setData: setSubmission,
        loading: submissionLoading,
        error: submissionError,
    } = useFetch<IAssignmentSubmission>(() => assignmentSubmissionService.getAssignmentSubmission({ assignmentId }));

    // assignment
    const {
        data: assignment,
        loading: assignmentLoading,
        error: assignmentError,
    } = useFetch<IAssignment>(() => assignmentService.getAssignmentById({ classId, assignmentId }));

    // update assignment
    const { loading: updateSubmissionLoading, execute: updateSubmissionAsync } = usePost<
        IUpdateAssignmentSubmissionPayload,
        IAssignmentSubmission
    >(assignmentSubmissionService.updateAssignmentSubmission, 'PUT', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Submit successfully');
            setSubmission(data);
        },
    });

    async function onSubmit({ data }: { data: IUpdateAssignmentSubmissionBody }) {
        if (!submission) return;
        await updateSubmissionAsync({ assignmentId, submissionId: submission.submissionId, data });
    }

    const error = assignmentError || submissionError;
    const loading = assignmentLoading || submissionLoading;
    const notfound = !assignment || !submission;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5 space-y-6">
                <ContentSection
                    teacherName="Hoàng Kỳ Anh"
                    title={assignment.title}
                    description={assignment.content}
                    createdAt={assignment.createdAt}
                    withGrade={true}
                    withDeadline={true}
                    totalGrade={assignment.totalGrades}
                    grade={submission.grade}
                    deadline={assignment.deadline}
                    dropdownMenuContent={
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Sao chép đường liên kết</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    }
                />

                <Separator />

                <AttachmentsSection attachments={mockAssignment.attachments} />
            </div>

            <div className="lg:col-span-2 space-y-6">
                <SubmissionCard submission={submission} onSubmit={onSubmit} loading={updateSubmissionLoading} />

                <PrivateCommentsCard />
            </div>
        </div>
    );
}
