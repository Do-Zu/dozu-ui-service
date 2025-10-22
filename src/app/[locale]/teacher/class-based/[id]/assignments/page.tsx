'use client';

import { EditAssignment } from '@/app/[locale]/class-based/(assignment)/components/edit/EditAssignment';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useTopics } from '@/app/[locale]/topics/hooks/useTopics';
import LoadingPage from '@/app/loading';
import useFetch from '@/hooks/useFetch';
import teacherClassService from '@/services/class-based-learning/teacher/teacherClass.service';
import { useParams } from 'next/navigation';

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

    if (myClassError || topicsError) {
        return <div>Error: {myClassError || topicsError}</div>;
    }
    if (myClassLoading || topicsLoading) {
        return <LoadingPage />;
    }
    if (!myClass || !topics) {
        return <div>Data Not Found</div>;
    }

    return <EditAssignment myClass={myClass} topics={topics} />;
}
