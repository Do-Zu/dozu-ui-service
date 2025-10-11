'use client';

import useFetch from '@/hooks/useFetch';
import { School } from 'lucide-react';
import { IClass, IStudentInClass } from '../../../../class-based/types/class.type';
import { useParams } from 'next/navigation';
import LoadingPage from '@/app/loading';
import { StudentList } from './components/StudentList';
import { toast } from '@/hooks/use-toast';
import teacherClassService, {
    IRemoveStudentInClassPayload
} from '@/services/class-based-learning/teacher/teacherClass.service';
import { IUserProfile } from '@/types/profile';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import StudentProfileModal from './components/StudentProfileModal';
import LanguageSwitcher from '@/components/toolbar/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { USER_ROLES } from '@/utils/constants/roles';

function StudentsManagementComponent({ classId }: { classId: number }) {
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');
    const tStudentList = useTranslations('class.studentList');
    
    // Profile modal state
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudentProfile, setSelectedStudentProfile] = useState<IUserProfile | null>(null);
    const [profileLoading, setProfileLoading] = useState(false);
    
    
    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => teacherClassService.getClassById(classId));

    const {
        data: students,
        setData: setStudents,
        error: studentsError,
        loading: studentsLoading,
    } = useFetch<IStudentInClass[]>(() => teacherClassService.getStudentsInClass(classId));

    const { loading: removeStudentFromClassLoading, execute: removeStudentFromClassAsync } = usePost<
        IRemoveStudentInClassPayload,
        number
    >(teacherClassService.removeStudentFromClass, 'DELETE', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tStudentList('removeSuccess'));
            applyRemoveStudent(data);
        },
    });

    async function applyRemoveStudent(studentId: number) {
        setStudents((prevStudents) => {
            const currentStudents = prevStudents ?? [];
            const studentsFiltered = currentStudents.filter((student) => student.userId !== studentId);
            return studentsFiltered;
        });
    }

    async function handleRemoveClick(studentId: number) {
        if (typeof classId !== 'number' && !classId) return;
        await removeStudentFromClassAsync({ classId: classId as number, studentId });
    }

    async function handleViewProfile(student: IStudentInClass) {
        setProfileLoading(true);
        setIsProfileModalOpen(true);
        try {
            const profileData = await teacherClassService.getStudentProfile(student.userId);
            
            const fullProfile: IUserProfile = {
                ...profileData,
                enrolledAt: student.enrolledAt instanceof Date 
                    ? student.enrolledAt.toISOString() 
                    : student.enrolledAt || new Date().toISOString(),
            };
            
            setSelectedStudentProfile(fullProfile);
        } catch (error) {
            toastHelper.showErrorMessage('Không thể tải thông tin profile');
            setSelectedStudentProfile(null);
            setIsProfileModalOpen(false);
        } finally {
            setProfileLoading(false);
        }
    }
    function handleCloseProfileModal() {
        setIsProfileModalOpen(false);
        setSelectedStudentProfile(null);
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
                            <h2 className="text-2xl font-semibold">
                                {tClass('classWithName', { name: myClass.name })}
                            </h2>
                        </div>
                    </div>
                    <div className="text-muted-foreground">
                        {myClass.description ? myClass.description : tCommon('labels.noDescription')}
                    </div>
                    <div className="text-sm">
                        {tClass('invitationCode')}: {myClass.invitationCode}
                    </div>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <StudentList
                    students={students}
                    handleRemoveClick={handleRemoveClick}
                    handleViewProfile={handleViewProfile}
                />
            </div>

            {/* Student Profile Modal */}
            <StudentProfileModal
                isOpen={isProfileModalOpen}
                onClose={handleCloseProfileModal}
                student={selectedStudentProfile}
                loading={profileLoading}
                classId={classId}
            />
        </div>
    );
}

const AuthComponent = withAuth(StudentsManagementComponent, { requiredRole: USER_ROLES.TEACHER });

export default function Page() {
    let { id: classId } = useParams() as { id: string | string[] | number };

    if (typeof classId !== 'string') {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    classId = Number(classId);

    if (isNaN(classId)) {
        return <div>Invalid Params, classId must be a valid number</div>;
    }

    return <AuthComponent classId={classId} />;
}
