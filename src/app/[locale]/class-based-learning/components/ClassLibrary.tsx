import { Button } from '@/components/ui/button';
import { Link, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { ClassesList } from './ClassesList';
import { useState } from 'react';
import { CreateClassModal } from './CreateClassModal';
import { UpdateClassModal } from './UpdateClassModal';
import classService from '@/services/class-based-learning/class.service';
import { toast } from '@/hooks/use-toast';
import useFetch from '@/hooks/useFetch';
import { IClass, ICreateClassResponse, IUpdateClassResponse } from '../types/class.type';
import LoadingPage from '@/app/loading';
import { ITopic } from '../../topics/topic.type';
import TopicLibrary from '../../topics/components/TopicLibrary';
import { useAuth } from '@/contexts/auth/AuthContext';
import { JoinClassModal } from './JoinClassModal';
import { useRoleChecker } from '@/hooks/useRoleChecker';

export function ClassesLibrary() {
    const t = useTranslations('home.classBasedLearning');
    const { isTeacher } = useRoleChecker();

    // create class
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState<boolean>(false);
    const [className, setClassName] = useState<string>('');
    const [classDescription, setClassDescription] = useState<string>('');

    // update class
    const [isUpdateClassModalOpen, setIsUpdateClassModalOpen] = useState<boolean>(false);
    const [classUpdatedId, setClassUpdatedId] = useState<number | null>();
    const [classUpdatedName, setClassUpdatedName] = useState<string>('');
    const [classUpdatedDescription, setClassUpdatedDescription] = useState<string>('');

    // delete class

    // manage current class that is selected, showing list of topics in the class
    const [classIdSelected, setClassIdSelected] = useState<number | null>();
    const [classNameSelected, setClassNameSelected] = useState<string>('');
    const [classDescriptionSelected, setClassDescriptionSelected] = useState<string>('');
    const [topicsInClassSelected, setTopicsInClassSelected] = useState<ITopic>();

    // join class
    const [isJoinClassModalOpen, setIsJoinClassModalOpen] = useState<boolean>(false);
    const [invitationCode, setInvitationCode] = useState<string>('');

    const {
        data: classes,
        setData: setClasses,
        error: classesError,
        loading: classesLoading,
    } = useFetch<IClass[]>('/classes');

    function applyCreateClass(data: ICreateClassResponse) {
        if (classes === null || classes === undefined) {
            throw new Error('Cannot apply Create Class');
        }
        setClasses([...classes, data]);
    }

    function applyUpdateClass(data: IUpdateClassResponse) {
        if (classes === null || classes === undefined) {
            throw new Error('Cannot apply Update Class');
        }
        const classesUpdated = classes.map((e) => {
            if (e.classId === data.classId) return { ...e, name: data.name, description: data.description };
            return e;
        });
        setClasses(classesUpdated);
    }

    function applyJoinClass(data: IClass) {
        if (classes === null || classes === undefined) {
            throw new Error('Cannot apply Join Class');
        }
        setClasses([...classes, data]);
    }

    async function handleCreateClick() {
        try {
            const data = await classService.createClass({ name: className, description: classDescription });
            applyCreateClass(data.data);
            setIsCreateClassModalOpen(false);
            setClassName('');
            setClassDescription('');
        } catch (err) {
            toast({
                title: 'Create Class failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    async function handleUpdateClick() {
        if (!classUpdatedId) {
            toast({
                title: 'Class Id must be provided',
                variant: 'destructive',
            });
            return;
        }
        try {
            const data = await classService.updateClass({
                classId: classUpdatedId,
                name: classUpdatedName,
                description: classUpdatedDescription,
            });
            applyUpdateClass(data.data);
            setIsUpdateClassModalOpen(false);
            setClassUpdatedId(null);
            setClassUpdatedName('');
            setClassUpdatedDescription('');
        } catch (err) {
            toast({
                title: 'Update Class failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    function handleOpenUpdateModal({
        classId,
        name,
        description,
    }: {
        classId: number;
        name: string;
        description: string;
    }) {
        setClassUpdatedId(classId);
        setClassUpdatedName(name);
        setClassUpdatedDescription(description);

        setTimeout(() => {
            setIsUpdateClassModalOpen(true);
        }, 50);
    }

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

    if (classesError) {
        return <div>Something went wrong</div>;
    }
    if (classesLoading || classes === null || classes === undefined) {
        return <LoadingPage />;
    }
    if (classIdSelected) {
        return <TopicLibrary classId={classIdSelected} className={classNameSelected} />;
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

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">My Classes</h2>
                {isTeacher ? (
                    <Button className="bg-background text-foreground" onClick={() => setIsCreateClassModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Create New Class
                    </Button>
                ) : (
                    <Button className="bg-background text-foreground" onClick={() => setIsJoinClassModalOpen(true)}>
                        <Link className="mr-2 h-4 w-4" /> Join Class
                    </Button>
                )}
            </div>
            <ClassesList
                handleNameClick={handleClassNameClick}
                classes={classes}
                handleOpenUpdateModal={handleOpenUpdateModal}
            />
            <CreateClassModal
                isOpen={isCreateClassModalOpen}
                setIsOpen={setIsCreateClassModalOpen}
                name={className}
                setName={setClassName}
                description={classDescription}
                setDescription={setClassDescription}
                handleCreateClick={handleCreateClick}
            />

            <UpdateClassModal
                isOpen={isUpdateClassModalOpen}
                setIsOpen={setIsUpdateClassModalOpen}
                classId={classUpdatedId}
                name={classUpdatedName}
                setName={setClassUpdatedName}
                description={classUpdatedDescription}
                setDescription={setClassUpdatedDescription}
                handleUpdateClick={handleUpdateClick}
            />

            {/* todo-ka: consider delete class or not? */}

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
