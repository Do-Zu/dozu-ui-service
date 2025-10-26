'use client';

import { EditAssignment } from '@/app/[locale]/class-based/(assignment)/components/EditAssignment';
import assignmentService from '@/app/[locale]/class-based/(assignment)/service/assignment.service';
import {
    IAssignment,
    IUpdateAssignmentBody,
    IUpdateAssignmentPayload,
} from '@/app/[locale]/class-based/(assignment)/types/assignment.type';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useTopics } from '@/app/[locale]/topics/hooks/useTopics';
import LoadingPage from '@/app/loading';
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
        data: assignment,
        loading: assignmentLoading,
        error: assignmentError,
    } = useFetch<IAssignment>(() => assignmentService.getAssignmentById({ classId, assignmentId }));

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
            router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId));
        },
    });

    async function onSubmit({ assignment }: { assignment: IUpdateAssignmentBody }) {
        await updateAssignmentAsync({ classId, assignmentId, assignment });
    }

    if (myClassError || topicsError || assignmentError) {
        return <div>Error: {myClassError || topicsError || assignmentError}</div>;
    }
    if (myClassLoading || topicsLoading || assignmentLoading) {
        return <LoadingPage />;
    }
    if (!myClass || !topics || !assignment) {
        return <div>Data Not Found</div>;
    }

    return (
        <EditAssignment
            myClass={myClass}
            topics={topics}
            assignment={assignment}
            onSubmit={onSubmit}
            loading={updateAssignmentLoading}
        />
    );
}
