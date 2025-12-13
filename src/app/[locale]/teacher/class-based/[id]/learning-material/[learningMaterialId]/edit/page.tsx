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
import { EditLearningMaterial } from '@/app/[locale]/class-based/(learning-material)/components/EditLearningMaterial';
import learningMaterialService from '@/app/[locale]/class-based/(learning-material)/service/learningMaterial.service';
import {
    ILearningMaterial,
    ILearningMaterialWithAttachments,
    IUpdateLearningMaterialBody,
    IUpdateLearningMaterialPayload,
} from '@/app/[locale]/class-based/(learning-material)/types/learningMaterial.type';
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
    const isValidLearningMaterial =
        typeof params.learningMaterialId === 'string' &&
        !isNaN(Number(params.learningMaterialId)) &&
        Number(params.learningMaterialId) > 0;

    const isValidId = isValidClassId && isValidLearningMaterial;
    if (!isValidId) {
        return <div className="p-8">Invalid classId, please try again.</div>;
    }

    const classId = Number(params.id);
    const learningMaterialId = Number(params.learningMaterialId);

    return <ValidPage classId={classId} learningMaterialId={learningMaterialId} />;
}

function ValidPage({ classId, learningMaterialId }: { classId: number; learningMaterialId: number }) {
    const router = useRouter();

    // temporarily fetch data from server, will change to getting data from global state, avoiding refetching data
    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => teacherClassService.getClassById(classId));

    // topics, destructure topics
    const { fetchTopics } = useTopics({
        mode: 'class-based',
        role: 'teacher',
        classId,
    });
    const { topics, topicsError, topicsLoading } = fetchTopics;

    // learningMaterial
    const {
        data: learningMaterialWithAttachments,
        loading: learningMaterialWithAttachmentsLoading,
        error: learningMaterialWithAttachmentsError,
    } = useFetch<ILearningMaterialWithAttachments>(() =>
        learningMaterialService.getLearningMaterialWithAttachmentsById({ classId, learningMaterialId }),
    );

    // update assignment
    const { execute: updateLearningMaterialAsync, loading: updateLearningMaterialLoading } = usePost<
        IUpdateLearningMaterialPayload,
        ILearningMaterial
    >(learningMaterialService.updateLearningMaterialById, 'PUT', {
        onError(error) {
            toastHelper.showErrorMessage(error);
        },
        onSuccess(data) {
            toastHelper.showSuccessMessage('Edit learning material successfully');
            router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId, ClassDashboardTab.CLASSWORK));
        },
    });

    // upload files
    const { isLoading: isUploading, execute: uploadFiles } = useUploadAttachmentFiles();

    async function onSubmit({
        learningMaterial,
        files,
        urls,
    }: {
        learningMaterial: IUpdateLearningMaterialBody;
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
        const data: IUpdateLearningMaterialBody = {
            ...learningMaterial,
            inputResources: uploadedFileResult,
            urls: urls,
        };
        await updateLearningMaterialAsync({ classId, learningMaterialId, learningMaterial: data });
    }

    const error = myClassError || topicsError || learningMaterialWithAttachmentsError;
    const loading = myClassLoading || topicsLoading || learningMaterialWithAttachmentsLoading;
    const notfound = !myClass || !topics || !learningMaterialWithAttachments;

    if (error) {
        return <div>Error: {error}</div>;
    }
    if (loading) {
        return <LoadingPage />;
    }
    if (notfound) {
        return <div>Data Not Found</div>;
    }

    // const { assignment, attachments } = assignmentWithAttachments;
    const updateLoading = isUploading || updateLearningMaterialLoading;

    return (
        <>
            <EditLearningMaterial
                myClass={myClass}
                topics={topics}
                learningMaterial={learningMaterialWithAttachments.learningMaterial}
                attachments={learningMaterialWithAttachments.attachments}
                urlAttachments={learningMaterialWithAttachments.learningMaterial.urls}
                onSubmit={onSubmit}
                loading={updateLoading}
            />
        </>
    );
}
