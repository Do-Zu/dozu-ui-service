'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Search, Filter, Plus, CircleUserRound, School } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import TopicsList from '../TopicsList';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { ICreateTopicResponse, ITopic, IUpdateTopicResponse } from '../../types/topic.type';
import { toast } from '@/hooks/use-toast';
import topicService, { ICreateTopicPayload, IUpdateTopicPayload } from '@/services/topic/topic.service';
import { CreateTopicModal } from '../CreateTopicModal';
import { UpdateTopicModal } from '../UpdateTopicModal';
import { DeleteTopicModal } from '../DeleteTopicModal';
import { Button } from '@/components/ui/button';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

const PersonalTopicLibrary = () => {
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
    } = useFetch<ITopic[]>(topicService.getTopics);

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    const { loading: createTopicLoading, execute: createTopicAsync } = usePost<
        ICreateTopicPayload,
        ICreateTopicResponse
    >(topicService.createTopic, 'POST', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data: ICreateTopicResponse) => {
            toastHelper.showSuccessMessage('Create topic successfully');
            applyCreateTopic(data);
            resetCreateTopicState();
        },
    });

    const { loading: updateTopicLoading, execute: updateTopicAsync } = usePost<
        IUpdateTopicPayload,
        IUpdateTopicResponse
    >(topicService.updateTopic, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage('Update topic successfully');
            applyUpdateTopic(data);
            resetUpdateTopicState();
        },
    });

    const { loading: deleteTopicLoading, execute: deleteTopicAsync } = usePost<number, number>(
        topicService.deleteTopic,
        'DELETE',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: (data) => {
                toastHelper.showSuccessMessage('Delete topic successfully');
                applyDeleteTopic(data);
                setIsDeleteTopicModalOpen(false);
            },
        },
    );

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
                type={MODE_ACCESS_PAGE_ROLE.personal}
                topics={topicsFiltered}
                handleOpenUpdateModal={handleOpenUpdateModal}
                handleOpenDeleteModal={handleOpenDeleteModal}
            />
        );
    };

    const handleOpenCreateModal = useCallback(() => {
        setTopicName('');
        setTopicDescription('');
        setTimeout(() => {
            setIsCreateTopicModalOpen(true);
        }, 50);
    }, []);

    const handleOpenUpdateModal = useCallback(
        ({ topicId, name, description }: { topicId: number; name: string; description: string }) => {
            setTopicUpdatedId(topicId);
            setTopicUpdatedName(name);
            setTopicUpdatedDescription(description);
            setTimeout(() => {
                setIsUpdateTopicModalOpen(true);
            }, 50);
        },
        [],
    );

    const handleOpenDeleteModal = useCallback(({ topicId, name }: { topicId: number; name: string }) => {
        setTopicDeletedId(topicId);
        setTopicDeletedName(name);
        setTimeout(() => {
            setIsDeleteTopicModalOpen(true);
        }, 50);
    }, []);

    const applyCreateTopic = (topic: ICreateTopicResponse) => {
        setTopics((prevTopics) => {
            const currentTopics = prevTopics ?? [];
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
                if (e.topicId === topic.topicId) return { ...e, name: topic.name, description: topic.description };
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

    function resetCreateTopicState() {
        setIsCreateTopicModalOpen(false);
        setTopicName('');
        setTopicDescription('');
    }

    function resetUpdateTopicState() {
        setIsUpdateTopicModalOpen(false);
        setTopicUpdatedId(null);
        setTopicUpdatedName('');
        setTopicUpdatedDescription('');
    }

    async function handleCreateClick() {
        if (!topicName) {
            toast({
                title: 'Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        await createTopicAsync({
            name: topicName,
            description: topicDescription,
        });
    }

    async function handleUpdateClick() {
        if (!topicUpdatedId || !topicUpdatedName) {
            toast({
                title: 'Topic Id and Topic Name must be provided',
                variant: 'destructive',
            });
            return;
        }
        await updateTopicAsync({
            topicId: topicUpdatedId,
            name: topicUpdatedName,
            description: topicUpdatedDescription,
        });
    }

    async function handleDeleteClick() {
        if (!topicDeletedId) {
            toast({
                title: 'Topic Id must be provided',
                variant: 'destructive',
            });
            return;
        }
        await deleteTopicAsync(topicDeletedId);
    }

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-row gap-4 items-center">
                                <CircleUserRound />
                                <h2 className="text-2xl font-semibold">{t('title')}</h2>
                            </div>
                            <div>Your topics and personal contents live here</div>
                        </div>
                    </div>
                </div>
                <Button className="bg-background text-foreground" onClick={handleOpenCreateModal}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createNewContent')}
                </Button>
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
                            <SelectItem value="recently-studied">{t('sortOptions.recentlyStudied')}</SelectItem>
                            <SelectItem value="flashcards-due-today">Flashcards Due Today</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {handleRenderTopicsSection()}

            <CreateTopicModal
                isOpen={isCreateTopicModalOpen}
                setIsOpen={setIsCreateTopicModalOpen}
                name={topicName}
                setName={setTopicName}
                description={topicDescription}
                setDescription={setTopicDescription}
                handleCreateClick={handleCreateClick}
                loading={createTopicLoading}
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
                loading={updateTopicLoading}
            />

            <DeleteTopicModal
                isOpen={isDeleteTopicModalOpen}
                setIsOpen={setIsDeleteTopicModalOpen}
                topicId={topicDeletedId}
                name={topicDeletedName}
                handleDeleteClick={handleDeleteClick}
                loading={deleteTopicLoading}
            />
        </div>
    );
};

export default PersonalTopicLibrary;
