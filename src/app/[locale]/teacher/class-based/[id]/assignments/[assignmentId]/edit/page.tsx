'use client';

import { EditAssignment } from '@/app/[locale]/class-based/(assignment)/components/EditAssignment';
import assignmentService from '@/app/[locale]/class-based/(assignment)/service/assignment.service';
import {
    IAssignment,
    IAssignmentWithAttachments,
    IUpdateAssignmentBody,
    IUpdateAssignmentPayload,
} from '@/app/[locale]/class-based/(assignment)/types/assignment.type';
import { IInputResource } from '@/app/[locale]/class-based/(classwork)/types/attachment.type';
import { ClassDashboardTab } from '@/app/[locale]/class-based/[id]/utils/class.constant';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { RESOURCE_CONTENT_TYPE } from '@/app/[locale]/generate/constants/resource';
import { useTopics } from '@/app/[locale]/topics/hooks/useTopics';
import LoadingPage from '@/app/loading';
import useUploadAttachmentFiles from '@/hooks/upload/useUploadAttachmentFiles';
import useFetch from '@/hooks/useFetch';
import usePost from '@/hooks/usePost';
import teacherClassService from '@/services/class-based-learning/teacher/teacherClass.service';
import { ROUTES } from '@/utils/constants/routes';
import toastHelper from '@/utils/toast.helper';
import { useParams, useRouter } from 'next/navigation';

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

    // temporarily fetch data from server, will change to getting data from global state, avoiding refetching data
    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => teacherClassService.getClassById(classId));

    // topics
    const { fetchTopics } = useTopics({
        mode: 'class-based',
        role: 'teacher',
        classId,
    });
    const { topics, topicsError, topicsLoading } = fetchTopics;

    // assignment
    const {
        data: assignmentWithAttachments,
        loading: assignmentWithAttachmentsLoading,
        error: assignmentWithAttachmentsError,
    } = useFetch<IAssignmentWithAttachments>(() =>
        assignmentService.getAssignmentWithAttachmentsById({ classId, assignmentId }),
    );

    // update assignment
    const { execute: updateAssignmentAsync, loading: updateAssignmentLoading } = usePost<
        IUpdateAssignmentPayload,
        IAssignment
    >(assignmentService.updateAssignmentById, 'PUT', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Edit assignment successfully');
            router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
        },
    });

    // upload files
    const { isLoading: isUploading, execute: uploadFiles } = useUploadAttachmentFiles();

    async function onSubmit({
        assignment,
        files,
        urls,
    }: {
        assignment: IUpdateAssignmentBody;
        files: File[];
        urls: string[];
    }) {
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

        const data: IUpdateAssignmentBody = {
            ...assignment,
            inputResources: uploadedFileResult,
            urls: [...(assignment.urls ?? []), ...urls],
        };
        await updateAssignmentAsync({ classId, assignmentId, assignment: data });
    }

    const error = myClassError || topicsError || assignmentWithAttachmentsError;
    const loading = myClassLoading || topicsLoading || assignmentWithAttachmentsLoading;
    const notfound = !myClass || !topics || !assignmentWithAttachments;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    const { assignment, attachments } = assignmentWithAttachments;
    const updateLoading = isUploading || updateAssignmentLoading;

    return (
        <EditAssignment
            myClass={myClass}
            topics={topics}
            assignment={assignment}
            attachments={attachments}
            urlAttachments={assignment.urls || []}
            onSubmit={onSubmit}
            loading={updateLoading}
        />
    );
}
