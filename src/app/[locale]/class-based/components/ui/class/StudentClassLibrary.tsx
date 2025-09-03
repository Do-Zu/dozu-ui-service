import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import studentClassService from '@/services/class-based-learning/student/studentClass.service';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { useTranslations } from 'next-intl';
import LeaveClassModal, { ILeavingClass } from '../../modal/LeaveClassModal';
import { IClass } from '../../../types/class.type';
import { JoinClassModal } from '../../modal/JoinClassModal';
import { Button } from '@/components/ui/button';
import { Link, LogOut } from 'lucide-react';
import { DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import ClassLibrary from '../../common/class/ClassLibrary';

export default function StudentClassLibrary() {
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

    useEffect(() => {
        if (classIdSelected) {
            router.push(ROUTES.CLASS_BASED_ID(classIdSelected));
        }
    }, [classIdSelected, router]);

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

    // ... UI
    // button actions
    const mainActionButtons = (
        <Button className="bg-background text-foreground" onClick={() => setIsJoinClassModalOpen(true)}>
            <Link className="mr-2 h-4 w-4" /> {tJoinClass('title')}
        </Button>
    );

    const modals = (
        <div>
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

    const menuContentInCard = (myClass: IClass) => (
        <DropdownMenuContent align="start" side="top">
            <DropdownMenuItem
                onSelect={() => handleLeaveClassModalOpen({ classId: myClass.classId, name: myClass.name })}
            >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{tLeaveClass('label')}</span>
            </DropdownMenuItem>
        </DropdownMenuContent>
    );

    if (classesError) {
        return <div>Error: {classesError}</div>;
    }
    if (classesLoading || classes === null || classes === undefined) {
        return <LoadingPage />;
    }

    return (
        <ClassLibrary
            role="student"
            classes={classes}
            handleNameClick={handleClassNameClick}
            mainActionButtons={mainActionButtons}
            menuContentInCard={menuContentInCard}
            modals={modals}
        />
    );
}
