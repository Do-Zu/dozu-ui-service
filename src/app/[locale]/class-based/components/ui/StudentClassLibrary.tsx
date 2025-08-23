import { Button } from '@/components/ui/button';
import { Link, School } from 'lucide-react';
import { StudentClassList } from './StudentClassList';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import useFetch from '@/hooks/useFetch';
import { IClass } from '../../types/class.type';
import LoadingPage from '@/app/loading';
import { JoinClassModal } from '../modal/JoinClassModal';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import studentClassService from '@/services/class-based-learning/student/studentClass.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import LeaveClassModal, { ILeavingClass } from '../modal/LeaveClassModal';
import { useTranslations } from 'next-intl';

export function StudentClassLibrary() {
    const tClass = useTranslations('class');
    const tJoinClass = useTranslations('class.join');
    const tLeaveClass = useTranslations('class.leave');
    const router = useRouter();

    // manage current class that is selected, showing list of topics in the class
    const [classIdSelected, setClassIdSelected] = useState<number | null>();

    // join class
    const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState<boolean>(false);
    const [invitationCode, setInvitationCode] = useState<string>('');

    // leave class
    const [isLeaveClassModalOpen, setIsLeaveClassModalOpen] = useState<boolean>(false);
    const [leavingClass, setLeavingClass] = useState<ILeavingClass | null>(null);

    const {
        data: classes,
        setData: setClasses,
        error: classesError,
        loading: classesLoading,
    } = useFetch<IClass[]>(studentClassService.getClasses);

    const { loading: joinClassLoading, execute: joinClassAsync } = usePost<string, IClass>(
        studentClassService.joinClass,
        'POST',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: (data: IClass) => {
                toastHelper.showSuccessMessage(tJoinClass('joinSuccess'));
                applyJoinClass(data);
                resetJoinClassState();
            },
        },
    );

    const { loading: leaveClassLoading, execute: leaveClassAsync } = usePost<number, number>(
        studentClassService.leaveClass,
        'DELETE',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: (data: number) => {
                toastHelper.showSuccessMessage(tLeaveClass('leaveSuccess'));
                applyLeaveClass(data);
                setIsLeaveClassModalOpen(false);
            },
        },
    );

    function handleClassNameClick({ classId }: { classId: number }) {
        setClassIdSelected(classId);
    }

    function handleLeaveClassModalOpen(leavingClass: ILeavingClass) {
        setLeavingClass(leavingClass);
        setTimeout(() => {
            setIsLeaveClassModalOpen(true);
        }, 50);
    }

    function applyJoinClass(data: IClass) {
        setClasses((prevClasses) => {
            const currentClasses = prevClasses ?? [];
            return [...currentClasses, data];
        });
    }

    function applyLeaveClass(classId: number) {
        setClasses((prevClasses) => {
            const currentClasses = prevClasses ?? [];
            const classFiltered = currentClasses.filter((e) => e.classId !== classId);
            return classFiltered;
        });
    }

    async function handleJoinClick(code: string) {
        await joinClassAsync(code);
    }

    async function handleLeaveClick(classId: number) {
        await leaveClassAsync(classId);
    }

    function resetJoinClassState() {
        setIsJoinClassModalOpen(false);
        setInvitationCode('');
    }

    if (classesError) {
        return <div>Error: {classesError}</div>;
    }
    if (classesLoading || classes === null || classes === undefined) {
        return <LoadingPage />;
    }
    if (classIdSelected) {
        // ClassBasedLibrary
        router.push(ROUTES.CLASS_BASED_ID(classIdSelected));
    }

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <School />
                        <h2 className="text-2xl font-semibold">{tClass('myClasses')}</h2>
                    </div>
                    <div>{tClass('classesEnrolling')}</div>
                </div>

                <Button className="bg-background text-foreground" onClick={() => setIsJoinClassModalOpen(true)}>
                    <Link className="mr-2 h-4 w-4" /> {tJoinClass('title')}
                </Button>
            </div>
            <StudentClassList
                classes={classes}
                handleNameClick={handleClassNameClick}
                handleLeaveClassModalOpen={handleLeaveClassModalOpen}
            />

            <JoinClassModal
                isOpen={isJoinClassModalOpen}
                setIsOpen={setIsJoinClassModalOpen}
                code={invitationCode}
                setCode={setInvitationCode}
                handleJoinClick={handleJoinClick}
                loading={joinClassLoading}
            />

            <LeaveClassModal
                isOpen={isLeaveClassModalOpen}
                setIsOpen={setIsLeaveClassModalOpen}
                myClass={leavingClass}
                handleLeaveClick={handleLeaveClick}
                loading={leaveClassLoading}
            />
        </div>
    );
}
