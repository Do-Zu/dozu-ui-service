'use client';

import ContentSection from '@/app/[locale]/class-based/(classwork)/components/common/details/ContentSection';
import AttachmentsViewSection from '@/app/[locale]/class-based/(classwork)/components/common/details/AttachmentsViewSection';
import { Separator } from '@/components/ui/separator';
import useFetch from '@/hooks/useFetch';
import { IAssignment, IAssignmentWithAttachments } from '@/app/[locale]/class-based/(assignment)/types/assignment.type';
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
    IAssignmentSubmissionWithAttachments,
    IUpdateAssignmentSubmissionBody,
    IUpdatedAssignmentSubmission,
} from '@/app/[locale]/class-based/(assignment)/types/assignmentSubmission.type';
import assignmentSubmissionService, {
    IUpdateAssignmentSubmissionPayload,
} from '@/app/[locale]/class-based/(assignment)/service/assignmentSubmission.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { IInputResource } from '@/app/[locale]/class-based/(classwork)/types/attachment.type';
import useUploadAttachmentFiles from '@/hooks/upload/useUploadAttachmentFiles';
import { RESOURCE_CONTENT_TYPE } from '@/app/[locale]/generate/constants/resource';

export default function Page() {
    const params = useParams();
    const isValidClassId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    const isValidAssignmentId =
        typeof params.assignmentId === 'string' &&
        !isNaN(Number(params.assignmentId)) &&
        Number(params.assignmentId) > 0;

    const isValidId = isValidClassId && isValidAssignmentId;
    if (!isValidId) {
        return <div className="p-8">Invalid classId or assignmentId, please try again.</div>;
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
        data: submissionWithAttachments,
        setData: setSubmissionWithAttachments,
        loading: submissionWithAttachmentsLoading,
        error: submissionWithAttachmentsError,
    } = useFetch<IAssignmentSubmissionWithAttachments>(() =>
        assignmentSubmissionService.getAssignmentSubmissionWithAttachments({ assignmentId }),
    );

    // assignment
    const {
        data: assignmentWithAttachments,
        loading: assignmentWithAttachmentsLoading,
        error: assignmentWithAttachmentsError,
    } = useFetch<IAssignmentWithAttachments>(() =>
        assignmentService.getAssignmentWithAttachmentsById({ classId, assignmentId }),
    );

    // update submission
    const { loading: updateSubmissionLoading, execute: updateSubmissionAsync } = usePost<
        IUpdateAssignmentSubmissionPayload,
        IUpdatedAssignmentSubmission
    >(assignmentSubmissionService.updateAssignmentSubmission, 'PUT', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Submit successfully');
            setSubmissionWithAttachments((prev) => {
                if (!prev) return null;
                const updatedSubmissionWithAttachments = {
                    assignmentSubmission: data.updatedAssignmentSubmission,
                    attachments: prev.attachments.concat(data.addedAttachments),
                };
                return updatedSubmissionWithAttachments;
            });
        },
    });

    const { isLoading: isUploading, execute: uploadFiles } = useUploadAttachmentFiles();

    // handle upload files
    async function onSubmit({
        data,
        files,
    }: {
        data: Omit<IUpdateAssignmentSubmissionBody, 'inputResources'>;
        files: File[];
    }) {
        if (!submissionWithAttachments) return;
        let uploadedFileResult: IInputResource[] | undefined = undefined;
        if (files.length > 0) {
            const result = await uploadFiles(files);
            uploadedFileResult = result.map((fileResponse) => ({
                title: fileResponse.fileName,
                contentType: RESOURCE_CONTENT_TYPE.FILE,
                metadata: {
                    ...fileResponse,
                },
            }));
        }
        const submittedData: IUpdateAssignmentSubmissionBody = { ...data, inputResources: uploadedFileResult };
        await updateSubmissionAsync({
            assignmentId,
            submissionId: submissionWithAttachments.assignmentSubmission.submissionId,
            data: submittedData,
        });
    }

    const error = assignmentWithAttachmentsError || submissionWithAttachmentsError;
    const loading = assignmentWithAttachmentsLoading || submissionWithAttachmentsLoading;
    const notfound = !assignmentWithAttachments || !submissionWithAttachments;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    const { assignment, attachments: assignmentAttachments } = assignmentWithAttachments;
    const { assignmentSubmission: submission, attachments: submissionAttachments } = submissionWithAttachments;
    const updateLoading = isUploading || updateSubmissionLoading;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-7 gap-6">
            <div className="lg:col-span-5 space-y-6">
                <ContentSection
                    teacherName=""
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

                <AttachmentsViewSection attachments={assignmentAttachments} urls={assignment.urls} />
            </div>

            <div className="lg:col-span-2 space-y-6">
                <SubmissionCard
                    submission={submission}
                    attachments={submissionAttachments}
                    urlAttachments={submission.urls || []}
                    onSubmit={onSubmit}
                    loading={updateLoading}
                />

                <PrivateCommentsCard />
            </div>
        </div>
    );
}
