import { Button } from '@/components/ui/button';
import { Plus, School } from 'lucide-react';
import { useState } from 'react';
import { CreateClassModal } from '../modal/CreateClassModal';
import { UpdateClassModal } from '../modal/UpdateClassModal';
import teacherClassService, {
    ICreateClassPayload,
    IUpdateClassPayload,
} from '@/services/class-based-learning/teacher/teacherClass.service';
import { toast } from '@/hooks/use-toast';
import useFetch from '@/hooks/useFetch';
import { IClass, ICreateClassResponse, IUpdateClassResponse } from '../../../../class-based/types/class.type';
import LoadingPage from '@/app/loading';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import { TeacherClassList } from './TeacherClassList';

export function TeacherClassLibrary() {
    const router = useRouter();

    // create class
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState<boolean>(false);
    const [className, setClassName] = useState<string>('');
    const [classDescription, setClassDescription] = useState<string>('');

    // update class
    const [isUpdateClassModalOpen, setIsUpdateClassModalOpen] = useState<boolean>(false);
    const [classUpdatedId, setClassUpdatedId] = useState<number | null>();
    const [classUpdatedName, setClassUpdatedName] = useState<string>('');
    const [classUpdatedDescription, setClassUpdatedDescription] = useState<string>('');

    // manage current class that is selected, showing list of topics in the class
    const [classIdSelected, setClassIdSelected] = useState<number | null>();
    const [classNameSelected, setClassNameSelected] = useState<string>('');
    const [classDescriptionSelected, setClassDescriptionSelected] = useState<string>('');

    const {
        data: classes,
        setData: setClasses,
        error: classesError,
        loading: classesLoading,
    } = useFetch<IClass[]>(teacherClassService.getClasses);

    const { loading: createClassLoading, execute: createClassAsync } = usePost<
        ICreateClassPayload,
        ICreateClassResponse
    >(teacherClassService.createClass, 'POST', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage('Create class successfully');
            applyCreateClass(data);
            resetCreateClassState();
        },
    });

    const { loading: updateClassLoading, execute: updateClassAsync } = usePost<
        IUpdateClassPayload,
        IUpdateClassResponse
    >(teacherClassService.updateClass, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage('Update class successfully');
            applyUpdateClass(data);
            resetUpdateClassState();
        },
    });

    function applyCreateClass(data: ICreateClassResponse) {
        setClasses((prevClasses) => {
            const currentClasses = prevClasses ?? [];
            return [...currentClasses, data];
        });
    }

    function applyUpdateClass(data: IUpdateClassResponse) {
        setClasses((prevClasses) => {
            const currentClasses = prevClasses ?? [];
            const classesUpdated = currentClasses.map((e) => {
                if (e.classId === data.classId) return { ...e, name: data.name, description: data.description };
                return e;
            });
            return classesUpdated;
        });
    }

    function resetCreateClassState() {
        setIsCreateClassModalOpen(false);
        setClassName('');
        setClassDescription('');
    }

    function resetUpdateClassState() {
        setIsUpdateClassModalOpen(false);
        setClassUpdatedId(null);
        setClassUpdatedName('');
        setClassUpdatedDescription('');
    }

    async function handleCreateClick() {
        if (!className) {
            toast({
                title: 'Class Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        await createClassAsync({ name: className, description: classDescription });
    }

    async function handleUpdateClick() {
        if (!classUpdatedId) {
            toast({
                title: 'Class Id must be provided',
                variant: 'destructive',
            });
            return;
        }
        await updateClassAsync({
            classId: classUpdatedId,
            name: classUpdatedName,
            description: classUpdatedDescription,
        });
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
        // return <TopicLibrary classId={classIdSelected} className={classNameSelected} />;
        router.push(ROUTES.TEACHER.CLASS_BASED_ID(classIdSelected));
    }

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <School />
                        <h2 className="text-2xl font-semibold">My Classes</h2>
                    </div>
                </div>
                <Button className="bg-background text-foreground" onClick={() => setIsCreateClassModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create New Class
                </Button>
            </div>

            <TeacherClassList
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
                loading={createClassLoading}
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
                loading={updateClassLoading}
            />
        </div>
    );
}
