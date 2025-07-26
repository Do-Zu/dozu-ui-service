'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, School, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import TopicsList from '../TopicsList';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { ICreateTopicResponse, ITopic, IUpdateTopicResponse } from '../../types/topic.type';
import { toast } from '@/hooks/use-toast';
import topicService from '@/services/topic/topic.service';
import { CreateTopicModal } from '../CreateTopicModal';
import { UpdateTopicModal } from '../UpdateTopicModal';
import { DeleteTopicModal } from '../DeleteTopicModal';
import { Button } from '@/components/ui/button';
import { ShowIf } from '@/components/ui/ShowIf';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';

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
    const { isTeacher } = useRoleChecker();

    const t = useTranslations('home.contentLibrary');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    const [topicName, setTopicName] = useState<string>('');
    const [topicDescription, setTopicDescription] = useState<string>('');
    const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState<boolean>(false);

    const [isUpdateTopicModalOpen, setIsUpdateTopicModalOpen] = useState<boolean>(false);
    const [isDeleteTopicModalOpen, setIsDeleteTopicModalOpen] = useState<boolean>(false);

    const [topicUpdatedId, setTopicUpdatedId] = useState<number | null>();
    const [topicUpdatedName, setTopicUpdatedName] = useState<string>('');
    const [topicUpdatedDescription, setTopicUpdatedDescription] = useState<string>('');

    const [topicDeletedId, setTopicDeletedId] = useState<number | null>();
    const [topicDeletedName, setTopicDeletedName] = useState<string>('');

    const {
        data: topics,
        setData: setTopics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopic[]>(`/classes/${classId}/topics`);

    const {
        data: myClass,
        setData: setMyClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(`/classes/${classId}`);

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    useEffect(() => {}, [classId]);

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
            <TopicsList
                type={MODE_ACCESS_PAGE_ROLE.classBased}
                topics={topicsFiltered}
                handleOpenUpdateModal={handleOpenUpdateModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
                editable={isTeacher}
            />
        );
    };

    function handleOpenCreateModal() {
        setTopicName('');
        setTopicDescription('');
        setTimeout(() => {
            setIsCreateTopicModalOpen(true);
        }, 50);
    }

    function handleOpenUpdateModal({
        topicId,
        name,
        description,
    }: {
        topicId: number;
        name: string;
        description: string;
    }) {
        setTopicUpdatedId(topicId);
        setTopicUpdatedName(name);
        setTopicUpdatedDescription(description);

        setTimeout(() => {
            setIsUpdateTopicModalOpen(true);
        }, 50);
    }

    function handleOpenDeleteModal({ topicId, name }: { topicId: number; name: string }) {
        setTopicDeletedId(topicId);
        setTopicDeletedName(name);

        setTimeout(() => {
            setIsDeleteTopicModalOpen(true);
        }, 50);
    }

    const applyCreateTopic = (topic: ICreateTopicResponse) => {
        if (topics === null || topics === undefined) return;
        if (classId) {
            console.log(topic);
            setTopics([...topics, { ...(topic as ITopic) }]);
        } else {
            setTopics([
                ...topics,
                { ...(topic as ITopic), flashcardsCount: 0, flashcardsDueToday: 0, flashcardsNew: 0 },
            ]);
        }
    };

    const applyUpdateTopic = (topic: IUpdateTopicResponse) => {
        if (topics === null || topics === undefined) return;
        const topicsUpdated = topics.map((e) => {
            if (e.topicId === topic.topicId) return { ...e, name: topic.name, description: topic.description };
            return e;
        });
        setTopics(topicsUpdated);
    };

    const applyDeleteTopic = (topicId: number) => {
        if (topics === null || topics === undefined) return;
        const topicsFiltered = topics.filter((topic) => topic.topicId !== topicId);
        setTopics(topicsFiltered);
    };

    async function handleCreateClick() {
        if (!topicName) {
            toast({
                title: 'Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        try {
            let data;
            if (classId) {
                data = await topicService.createTopicForClass({
                    classId,
                    name: topicName,
                    description: topicDescription,
                });
            } else {
                data = await topicService.createTopic({ name: topicName, description: topicDescription });
            }
            applyCreateTopic(data.data);
            setIsCreateTopicModalOpen(false);
            setTopicName('');
            setTopicDescription('');
        } catch (err) {
            toast({
                title: 'Create Topic failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    async function handleUpdateClick() {
        if (!topicUpdatedId || !topicUpdatedName) {
            toast({
                title: 'Topic Id and Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        try {
            let data;
            if (classId) {
                data = await topicService.updateTopicInClass({
                    topicId: topicUpdatedId,
                    name: topicUpdatedName,
                    description: topicUpdatedDescription,
                });
            } else {
                data = await topicService.updateTopic({
                    topicId: topicUpdatedId,
                    name: topicUpdatedName,
                    description: topicUpdatedDescription,
                });
            }
            applyUpdateTopic(data.data);
            setIsUpdateTopicModalOpen(false);
            setTopicUpdatedId(null);
            setTopicUpdatedName('');
            setTopicUpdatedDescription('');
        } catch (err) {
            toast({
                title: 'Update Topic failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    async function handleDeleteClick() {
        if (!topicDeletedId) {
            toast({
                title: 'Topic Id must be provided',
                variant: 'destructive',
            });
            return;
        }
        try {
            if (classId) {
                await topicService.deleteTopicInClass(topicDeletedId);
            } else {
                await topicService.deleteTopic(topicDeletedId);
            }
            applyDeleteTopic(topicDeletedId);
            setIsDeleteTopicModalOpen(false);
        } catch (err) {
            toast({
                title: 'Delete Topic failed, please try again!',
                variant: 'destructive',
            });
        }
    }

    async function handleGenerateClick() {
        router.push(ROUTES.CLASS_BASED_ID_GENERATE(classId));
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
                </div>

                <ShowIf
                    when={isTeacher}
                    children={
                        <div className="flex flex-col gap-4">
                            <Button className="bg-background text-foreground" onClick={handleOpenCreateModal}>
                                <Plus className="mr-2 h-4 w-4" />
                                {t('createNewContent')}
                            </Button>
                            <Button className="bg-background text-foreground" onClick={handleGenerateClick}>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate New Content
                            </Button>
                        </div>
                    }
                />
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
                            {isTeacher ? null : (
                                <SelectItem value="recently-studied">{t('sortOptions.recentlyStudied')}</SelectItem>
                            )}
                            {isTeacher ? null : (
                                <SelectItem value="flashcards-due-today">Flashcards Due Today</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {handleRenderTopicsSection()}

            <ShowIf when={isTeacher}>
                <div>
                    <CreateTopicModal
                        isOpen={isCreateTopicModalOpen}
                        setIsOpen={setIsCreateTopicModalOpen}
                        name={topicName}
                        setName={setTopicName}
                        description={topicDescription}
                        setDescription={setTopicDescription}
                        handleCreateClick={handleCreateClick}
                    />

                    <UpdateTopicModal
                        isOpen={isUpdateTopicModalOpen}
                        setIsOpen={setIsUpdateTopicModalOpen}
                        topicId={topicUpdatedId}
                        name={topicUpdatedName}
                        setName={setTopicUpdatedName}
                        description={topicUpdatedDescription}
                        setDescription={setTopicUpdatedDescription}
                        handleUpdateClick={handleUpdateClick}
                    />

                    <DeleteTopicModal
                        isOpen={isDeleteTopicModalOpen}
                        setIsOpen={setIsDeleteTopicModalOpen}
                        topicId={topicDeletedId}
                        name={topicDeletedName}
                        handleDeleteClick={handleDeleteClick}
                    />
                </div>
            </ShowIf>
        </div>
    );
};

export default ClassTopicLibrary;
