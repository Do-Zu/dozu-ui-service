import { Button } from '@/components/ui/button';
import { Link, School } from 'lucide-react';
import { ClassesList } from '../ClassesList';
import { useState } from 'react';
import classService from '@/services/class-based-learning/class.service';
import { toast } from '@/hooks/use-toast';
import useFetch from '@/hooks/useFetch';
import { IClass } from '../../types/class.type';
import LoadingPage from '@/app/loading';
import { JoinClassModal } from '../JoinClassModal';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

export function StudentClassLibrary() {
    const router = useRouter();

    // manage current class that is selected, showing list of topics in the class
    const [classIdSelected, setClassIdSelected] = useState<number | null>();
    const [classNameSelected, setClassNameSelected] = useState<string>('');
    const [classDescriptionSelected, setClassDescriptionSelected] = useState<string>('');

    // join class
    const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState<boolean>(false);
    const [invitationCode, setInvitationCode] = useState<string>('');

    const {
        data: classes,
        setData: setClasses,
        error: classesError,
        loading: classesLoading,
    } = useFetch<IClass[]>('/classes');

    async function handleClassNameClick({
        classId,
        name,
        description,
    }: {
        classId: number;
        name: string;
        description: string;
    }) {
        setClassIdSelected(classId);
        setClassNameSelected(name);
        setClassDescriptionSelected(description);
    }

    function applyJoinClass(data: IClass) {
        if (classes === null || classes === undefined) {
            throw new Error('Cannot apply Join Class');
        }
        setClasses([...classes, data]);
    }

    async function handleJoinClick(code: string) {
        try {
            const data = await classService.joinClass(code);
            applyJoinClass(data.data);
            setIsJoinClassModalOpen(false);
            setInvitationCode('');
        } catch (err) {
            toast({
                title: 'Join Class failed, please try again!', // todo-ka: toast incorrect invitation code if it is
                variant: 'destructive',
            });
        }
    }

    function applyLeaveClass(classId: number) {
        if (classes === null || classes === undefined) return;
        const classFiltered = classes.filter((e) => e.classId !== classId);
        setClasses(classFiltered);
    }

    async function handleLeaveClick(classId: number) {
        try {
            await classService.leaveClass(classId);
            applyLeaveClass(classId);
        } catch(err) {
            toast({
                title: 'Leave Class failed, please try again!', 
                variant: 'destructive',
            });
        }
    }

    if (classesError) {
        return <div>Something went wrong</div>;
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
                        <h2 className="text-2xl font-semibold">My Classes</h2>
                    </div>
                    <div>You're enrolled in the following classes</div>
                </div>

                <Button className="bg-background text-foreground" onClick={() => setIsJoinClassModalOpen(true)}>
                    <Link className="mr-2 h-4 w-4" /> Join Class
                </Button>
            </div>
            <ClassesList
                role='student'
                classes={classes}
                handleNameClick={handleClassNameClick}
                handleLeaveClick={handleLeaveClick}
            />

            <JoinClassModal
                isOpen={isJoinClassModalOpen}
                setIsOpen={setIsJoinClassModalOpen}
                code={invitationCode}
                setCode={setInvitationCode}
                handleJoinClick={handleJoinClick}
            />
        </div>
    );
}
