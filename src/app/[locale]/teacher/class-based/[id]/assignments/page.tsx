'use client';

import { CreateAssignment } from '@/app/[locale]/class-based/(assignment)/components/CreateAssignment';
import assignmentService from '@/app/[locale]/class-based/(assignment)/service/assignment.service';
import {
    ICreateAssignmentPayload,
    InsertAssignmentBody,
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
    const isValidId = typeof params.id === 'string' && !isNaN(Number(params.id)) && Number(params.id) > 0;
    if (!isValidId) {
        return <div className="p-8">Invalid classId, please try again.</div>;
    }

    const classId = Number(params.id);

    return <ValidPage classId={classId} />;
}

function ValidPage({ classId }: { classId: number }) {
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

    // Create new assignment
    const { execute: createAssignmentAsync, loading: createAssignmentLoading } = usePost(
        ({ classId, assignment }: ICreateAssignmentPayload) =>
            assignmentService.createAssignment({
                classId,
                assignment,
            }),
        'POST',
        {
            onError(error) {
                toastHelper.showErrorMessage(error);
            },
            onSuccess(data) {
                toastHelper.showSuccessMessage('Create assignment successfully');
                router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
            },
        },
    );

    // upload files
    const { isLoading: isUploading, execute: uploadFiles } = useUploadAttachmentFiles();

    async function onSubmit({
        assignment,
        files,
    }: {
        assignment: Omit<InsertAssignmentBody, 'inputResources'>;
        files: File[];
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
        console.log('assignments submissions', assignment);
        const data: InsertAssignmentBody = { ...assignment, inputResources: uploadedFileResult };
        await createAssignmentAsync({ classId, assignment: data });
    }

    const isLoading = createAssignmentLoading || isUploading;

    if (myClassError || topicsError) {
        return <div>Error: {myClassError || topicsError}</div>;
    }
    if (myClassLoading || topicsLoading) {
        return <LoadingPage />;
    }
    if (!myClass || !topics) {
        return <div>Data Not Found</div>;
    }

    return <CreateAssignment myClass={myClass} topics={topics} onSubmit={onSubmit} loading={isLoading} />;
}
