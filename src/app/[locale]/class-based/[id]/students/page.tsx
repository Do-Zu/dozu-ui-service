'use client';

import useFetch from '@/hooks/useFetch';
import { School } from 'lucide-react';
import { IClass, IStudentInClass } from '../../types/class.type';
import { useParams } from 'next/navigation';
import LoadingPage from '@/app/loading';
import { StudentList } from './components/StudentList';
import { toast } from '@/hooks/use-toast';
import classService from '@/services/class-based-learning/class.service';

export default function Page() {
    let { id: classId } = useParams() as { id: string | string[] | number };

    if (typeof classId != 'string') {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    classId = Number(classId);

    if (isNaN(classId)) {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    const {
        data: myClass,
        setData: setMyClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(`/classes/${classId}`);

    const {
        data: students,
        setData: setStudents,
        error: studentsError,
        loading: studentsLoading
    } = useFetch<IStudentInClass[]>(`/classes/enrollments/${classId}/students`);

    async function applyRemoveStudent(studentId: number) {
        if(students === null || students === undefined) return;
        const studentsFiltered = students.filter((student) => student.userId !== studentId);
        setStudents(studentsFiltered);
    }

    async function handleRemoveClick(studentId: number) {
        if(typeof classId !== 'number' && !classId) return;
        try {
            await classService.removeStudentFromClass(classId as number, studentId);
            applyRemoveStudent(studentId);
        } catch(err) {
            toast({
                title: 'Remove Student failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    if (myClassError) {
        return <div>Error: {myClassError}</div>;
    }
    if (studentsError) {
        return <div>Error: {studentsError}</div>;
    }
    if (myClassLoading || studentsLoading) {
        return <LoadingPage />;
    }
    if (!myClass) {
        return <div>Class Not Found</div>;
    }
    if (!students) {
        return <div>Students Not Found</div>;
    }

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800 mt-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-row gap-4 items-center">
                            <School />
                            <h2 className="text-2xl font-semibold">Class {myClass.name}</h2>
                        </div>
                    </div>
                    <div className="text-muted-foreground">
                        {myClass.description ? myClass.description : 'No Description'}
                    </div>
                    <div className='text-sm'>
                        Invitation Code: { myClass.invitationCode }
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <StudentList students={students} handleRemoveClick={handleRemoveClick} />
            </div>
        </div>
    );
}
