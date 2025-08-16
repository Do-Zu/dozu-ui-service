'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, School, Sparkles, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import ClassTopicList from './ClassTopicList';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import {
    ICreateTopicForClassResponse,
    ICreateTopicResponse,
    ITopic,
    IUpdateTopicResponse,
} from '@/app/[locale]/topics/types/topic.type';
import { toast } from '@/hooks/use-toast';
import topicService, {
    ICreateTopicForClassPayload,
    ICreateTopicPayload,
    IDeleteTopicInClassPayload,
    IUpdateTopicInClassPayload,
    IUpdateTopicPayload,
} from '@/services/topic/topic.service';
import { CreateTopicModal } from '@/app/[locale]/topics/components/CreateTopicModal';
import { IUpdatingTopic, UpdateTopicModal } from '@/app/[locale]/topics/components/UpdateTopicModal';
import { DeleteTopicModal, IDeletingTopic } from '@/app/[locale]/topics/components/DeleteTopicModal';
import { Button } from '@/components/ui/button';
import { ShowIf } from '@/components/ui/ShowIf';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import teacherClassService from '@/services/class-based-learning/teacher/teacherClass.service';
import studentClassService from '@/services/class-based-learning/student/studentClass.service';
import teacherClassTopicService from '@/services/class-based-learning/teacher/teacherClassTopic.service';

interface Props {
    classId: number;
}

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

const ClassTopicLibrary: React.FC<Props> = ({ classId }) => {
    const router = useRouter();

    const t = useTranslations('home.contentLibrary');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState<boolean>(false);
    const [isUpdateTopicModalOpen, setIsUpdateTopicModalOpen] = useState<boolean>(false);
    const [isDeleteTopicModalOpen, setIsDeleteTopicModalOpen] = useState<boolean>(false);

    const [updatingTopic, setUpdatingTopic] = useState<IUpdatingTopic | null>();
    const [deletingTopic, setDeletingTopic] = useState<IDeletingTopic | null>();

    const {
        data: topics,
        setData: setTopics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopic[]>(() => teacherClassService.getTopicsInClass(classId));

    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => teacherClassService.getClassById(classId));

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    const { loading: createTopicForClassLoading, execute: createTopicForClassAsync } = usePost<
        ICreateTopicForClassPayload,
        ICreateTopicForClassResponse
    >(teacherClassTopicService.createTopicForClass, 'POST', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data: ICreateTopicForClassResponse) => {
            toastHelper.showSuccessMessage('Create topic successfully');
            applyCreateTopic(data);
            setIsCreateTopicModalOpen(false);
        },
    });

    const { loading: updateTopicInClassLoading, execute: updateTopicInClassAsync } = usePost<
        IUpdateTopicInClassPayload,
        IUpdateTopicResponse
    >(teacherClassTopicService.updateTopicInClass, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage('Update topic successfully');
            applyUpdateTopic(data);
            setIsUpdateTopicModalOpen(false);
        },
    });

    const { loading: deleteTopicInClassLoading, execute: deleteTopicInClassAsync } = usePost<
        IDeleteTopicInClassPayload,
        number
    >(teacherClassTopicService.deleteTopicInClass, 'DELETE', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage('Delete topic successfully');
            applyDeleteTopic(data);
            setIsDeleteTopicModalOpen(false);
        },
    });

    useEffect(() => {
        if (!topics) {
            return;
        }
        const topicsCopied = [...topics];
        const topicsFiltered = topicsCopied.sort((a, b) => {
            if (sortBy === 'title-asc') {
                return a.name.localeCompare(b.name, 'vi');
            } else if (sortBy === 'title-desc') {
                return b.name.localeCompare(a.name, 'vi');
            } else if (sortBy === 'newest') {
                if (a.createdAt === b.createdAt) return 0;
                return a.createdAt! > b.createdAt! ? 1 : -1;
            } else if (sortBy === 'oldest') {
                if (a.createdAt === b.createdAt) return 0;
                return a.createdAt! < b.createdAt! ? 1 : -1;
            } else if (sortBy === 'flashcards-due-today') {
                return b.flashcardsDueToday! - a.flashcardsDueToday!;
            } else {
                return 0;
            }
        });
        setTopicsFiltered(topicsFiltered);
    }, [topics, sortBy]);

    const handleOpenCreateModal = useCallback(() => {
        setTimeout(() => {
            setIsCreateTopicModalOpen(true);
        }, 50);
    }, []);

    const handleOpenUpdateModal = useCallback((topic: IUpdatingTopic) => {
        setUpdatingTopic(topic);
        setTimeout(() => {
            setIsUpdateTopicModalOpen(true);
        }, 50);
    }, []);

    const handleOpenDeleteModal = useCallback((topic: IDeletingTopic) => {
        setDeletingTopic(topic);
        setTimeout(() => {
            setIsDeleteTopicModalOpen(true);
        }, 50);
    }, []);

    const handleRenderTopicsSection = () => {
        if (topicsError) {
            return <div>Error: {topicsError} </div>;
        }
        if (topicsLoading || !topics || !topicsFiltered) {
            return <LoadingPage />;
        }
        if (topics?.length === 0) {
            return <div></div>;
        }
        // todo-ka: cân nhắc setTopicsFiltered ngay khi nhận response từ API thay vì useEffect topics
        return (
            <ClassTopicList
                topics={topicsFiltered}
                handleOpenUpdateModal={handleOpenUpdateModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
            />
        );
    };

    const applyCreateTopic = (topic: ICreateTopicResponse) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            if (classId) {
                return [...currentTopics, { ...(topic as ITopic) }];
            }
            return [
                ...currentTopics,
                { ...(topic as ITopic), flashcardsCount: 0, flashcardsDueToday: 0, flashcardsNew: 0 },
            ];
        });
    };

    const applyUpdateTopic = (topic: IUpdateTopicResponse) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            const topicsUpdated = currentTopics.map((e) => {
                if (e.topicId === topic.topicId)
                    return { ...e, name: topic.name, description: topic.description, imageUrl: topic.imageUrl };
                return e;
            });
            return topicsUpdated;
        });
    };

    const applyDeleteTopic = (topicId: number) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
            const topicsFiltered = currentTopics.filter((topic) => topic.topicId !== topicId);
            return topicsFiltered;
        });
    };

    async function handleCreateClick(topic: ICreateTopicPayload) {
        if (!topic.name) {
            toast({
                title: 'Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        const value: ICreateTopicForClassPayload = { ...topic, classId };
        await createTopicForClassAsync(value);
    }

    async function handleUpdateClick(topic: IUpdateTopicPayload) {
        if (!topic.name) {
            toast({
                title: 'Topic Id and Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        const value: IUpdateTopicInClassPayload = { ...topic, classId };
        await updateTopicInClassAsync(value);
    }

    async function handleDeleteClick(topicId: number) {
        await deleteTopicInClassAsync({ classId, topicId });
    }

    async function handleGenerateClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_GENERATE(classId));
    }

    async function handleManageStudentsClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_STUDENTS(classId));
    }

    if (myClassError) {
        return <div>Error: {myClassError}</div>;
    }
    if (myClassLoading) {
        return <LoadingPage />;
    }
    if (!myClass) {
        return <div>Class Not Found</div>;
    }

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
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
                    <div className="text-sm">Invitation Code: {myClass.invitationCode}</div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-row gap-4">
                        <Button className="bg-background text-foreground" onClick={handleOpenCreateModal}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('createNewContent')}
                        </Button>
                        <Button className="bg-background text-foreground" onClick={handleGenerateClick}>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Generate New Content
                        </Button>
                    </div>
                    <Button
                        className="bg-background text-foreground w-[50%] ml-auto"
                        onClick={handleManageStudentsClick}
                    >
                        <Users className="mr-2 h-4 w-4" />
                        <span>Manage Students</span>
                    </Button>
                </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />{' '}
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-500 h-4 w-4" />
                        <span className="text-sm text-gray-600">{t('sortBy')}</span>
                    </div>
                    <Select value={sortBy} onValueChange={(value: TopicFilteringAction) => setSortBy(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder={t('sortBy')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">{t('sortOptions.newest')}</SelectItem>
                            <SelectItem value="oldest">{t('sortOptions.oldest')}</SelectItem>
                            <SelectItem value="title-asc">{t('sortOptions.titleAsc')}</SelectItem>
                            <SelectItem value="title-desc">{t('sortOptions.titleDesc')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {handleRenderTopicsSection()}

            <CreateTopicModal
                isOpen={isCreateTopicModalOpen}
                setIsOpen={setIsCreateTopicModalOpen}
                onSubmit={handleCreateClick}
                loading={createTopicForClassLoading}
            />

            <UpdateTopicModal
                isOpen={isUpdateTopicModalOpen}
                setIsOpen={setIsUpdateTopicModalOpen}
                topic={updatingTopic}
                onSubmit={handleUpdateClick}
                loading={updateTopicInClassLoading}
            />

            <DeleteTopicModal
                isOpen={isDeleteTopicModalOpen}
                setIsOpen={setIsDeleteTopicModalOpen}
                topic={deletingTopic}
                handleDeleteClick={handleDeleteClick}
                loading={deleteTopicInClassLoading}
            />
        </div>
    );
};

export default ClassTopicLibrary;
