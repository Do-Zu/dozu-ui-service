'use client';

import { CreateAssignment } from '@/app/[locale]/class-based/(assignment)/components/CreateAssignment';
import teacherAssignmentService from '@/app/[locale]/class-based/(assignment)/service/teacher/teacherAssignment.service';
import {
    ICreateAssignmentPayload,
    InsertAssignmentBody,
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
            teacherAssignmentService.createAssignment({
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
                router.push(ROUTES.TEACHER.CLASS_BASED_ID(classId));
            },
        },
    );

    async function onSubmit({ assignment }: { assignment: InsertAssignmentBody }) {
        await createAssignmentAsync({ classId, assignment });
    }

    if (myClassError || topicsError) {
        return <div>Error: {myClassError || topicsError}</div>;
    }
    if (myClassLoading || topicsLoading) {
        return <LoadingPage />;
    }
    if (!myClass || !topics) {
        return <div>Data Not Found</div>;
    }

    return <CreateAssignment myClass={myClass} topics={topics} onSubmit={onSubmit} loading={createAssignmentLoading} />;
}
