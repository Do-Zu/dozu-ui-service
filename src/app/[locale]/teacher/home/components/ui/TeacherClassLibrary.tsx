import { Button } from '@/components/ui/button';
import { Edit, MoreVertical, Plus, School, Sparkles, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CreateClassModal } from '@/app/[locale]/teacher/home/components/modal/CreateClassModal';
import { IUpdatingClass, UpdateClassModal } from '@/app/[locale]/teacher/home/components/modal/UpdateClassModal';
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
import { useTranslations } from 'next-intl';
import ClassLibrary from '../../../../class-based/components/common/class/ClassLibrary';
import { DropdownMenuItem, DropdownMenuContent } from '@/components/ui/dropdown-menu';
import ClassCard from '@/app/[locale]/class-based/components/common/class/ClassCard';

export default function TeacherClassLibrary() {
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');
    const classLabel = tClass('class');
    const router = useRouter();

    // create class
    const [isCreateClassModalOpen, setIsCreateClassModalOpen] = useState<boolean>(false);

    // update class
    const [isUpdateClassModalOpen, setIsUpdateClassModalOpen] = useState<boolean>(false);
    const [updatingClass, setUpdatingClass] = useState<IUpdatingClass | null>();

    // manage current class that is selected, showing list of topics in the class
    const [classIdSelected, setClassIdSelected] = useState<number | null>();

    useEffect(() => {
        if (classIdSelected) {
            router.push(ROUTES.TEACHER.CLASS_BASED_ID(classIdSelected));
        }
    }, [classIdSelected, router]);

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
            toastHelper.showSuccessMessage(tCommon('messages.createSuccess', { name: classLabel }));
            applyCreateClass(data);
            setIsCreateClassModalOpen(false);
        },
    });

    const { loading: updateClassLoading, execute: updateClassAsync } = usePost<
        IUpdateClassPayload,
        IUpdateClassResponse
    >(teacherClassService.updateClass, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: classLabel }));
            applyUpdateClass(data);
            setIsUpdateClassModalOpen(false);
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
                if (e.classId === data.classId)
                    return { ...e, name: data.name, description: data.description, imageUrl: data.imageUrl };
                return e;
            });
            return classesUpdated;
        });
    }

    async function handleCreateClick(myClass: ICreateClassPayload) {
        if (!myClass.name) {
            toast({
                title: tCommon('validation.required', { name: tCommon('labels.name') }),
                variant: 'destructive',
            });
            return;
        }
        await createClassAsync(myClass);
    }

    async function handleUpdateClick(myClass: IUpdateClassPayload) {
        if (!myClass.name) {
            toast({
                title: tCommon('validation.required', { name: tCommon('labels.name') }),
                variant: 'destructive',
            });
            return;
        }
        await updateClassAsync(myClass);
    }

    function handleOpenUpdateModal(data: IUpdatingClass) {
        setUpdatingClass(data);

        setTimeout(() => {
            setIsUpdateClassModalOpen(true);
        }, 50);
    }

    async function handleClassNameClick({ classId }: { classId: number }) {
        setClassIdSelected(classId);
    }

    // ... UI
    // button actions
    const mainActionButtons = (
        <Button 
            variant="default"
            className="shadow-sm hover:shadow-md transition-all duration-200 rounded-lg px-5 py-2.5 h-auto font-medium" 
            onClick={() => setIsCreateClassModalOpen(true)}
        >
            <Plus className="h-4 w-4" /> {tCommon('titles.createNew', { name: classLabel })}
        </Button>
    );

    async function handleGenerateClick(classId: number) {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_GENERATE(classId));
    }

    async function handleManageStudentsClick(classId: number) {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_STUDENTS(classId));
    }

    const menuContentInCard = (myClass: IClass) => {
        const { classId, name, description, imageUrl } = myClass;
        return (
            <DropdownMenuContent align="start" side="top" className="rounded-lg border-0 shadow-lg bg-popover p-1.5 min-w-[180px]">
                <DropdownMenuItem onSelect={() => handleGenerateClick(classId)} className="rounded-md px-3 py-2 cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tClass('generateContent')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleManageStudentsClick(classId)} className="rounded-md px-3 py-2 cursor-pointer">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tClass('manageStudents')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => handleOpenUpdateModal({ classId, name, description, imageUrl })} className="rounded-md px-3 py-2 cursor-pointer">
                    <Edit className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{tCommon('actions.edit')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        );
    };

    const modals = (
        <div>
            <CreateClassModal
                isOpen={isCreateClassModalOpen}
                setIsOpen={setIsCreateClassModalOpen}
                onSubmit={handleCreateClick}
                loading={createClassLoading}
            />

            <UpdateClassModal
                isOpen={isUpdateClassModalOpen}
                setIsOpen={setIsUpdateClassModalOpen}
                myClass={updatingClass}
                onSubmit={handleUpdateClick}
                loading={updateClassLoading}
            />
        </div>
    );

    const classCard = (myClass: IClass) => (
        <ClassCard
            role="teacher"
            myClass={myClass}
            handleNameClick={handleClassNameClick}
            menuContent={menuContentInCard}
        />
    );

    if (classesError) {
        return <div>Error: {classesError}</div>;
    }
    if (classesLoading || classes === null || classes === undefined) {
        return <LoadingPage />;
    }

    return (
        <ClassLibrary
            role="teacher"
            classes={classes}
            mainActionButtons={mainActionButtons}
            modals={modals}
            classCard={classCard}
        />
    );
}
