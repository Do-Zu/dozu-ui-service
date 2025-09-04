'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Search, Filter, Plus, CircleUserRound } from 'lucide-react';
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
import { UpdateTopicModal, IUpdatingTopic } from '../UpdateTopicModal';
import { DeleteTopicModal, IDeletingTopic } from '../DeleteTopicModal';
import { Button } from '@/components/ui/button';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import TopicDetailsModal, { ITopicDetails } from '../TopicDetailsModal';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

const PersonalTopicLibrary = () => {
    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const topicLabel = tTopic('topic');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    const [isCreateTopicModalOpen, setIsCreateTopicModalOpen] = useState<boolean>(false);
    const [isUpdateTopicModalOpen, setIsUpdateTopicModalOpen] = useState<boolean>(false);
    const [isDeleteTopicModalOpen, setIsDeleteTopicModalOpen] = useState<boolean>(false);

    const [updatingTopic, setUpdatingTopic] = useState<IUpdatingTopic | null>();
    const [deletingTopic, setDeletingTopic] = useState<IDeletingTopic | null>();

    // topic details
    const [isTopicDetailsModalOpen, setIsTopicDetailsModalOpen] = useState<boolean>(false);
    const [selectingTopic, setSelectingTopic] = useState<ITopicDetails | null>();

    const {
        data: topics,
        setData: setTopics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopic[]>(topicService.getTopics);

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    // aggregated metrics
    const metrics = useMemo(() => {
        const list = topicsFiltered ?? [];
        let due = 0;
        let fresh = 0;
        let totalFlashcards = 0;
        list.forEach((t) => {
            due += t.flashcardsDueToday || 0;
            fresh += t.flashcardsNew || 0;
            totalFlashcards += t.flashcardsCount || 0;
        });
        return {
            topics: list.length,
            due,
            fresh,
            totalFlashcards,
        };
    }, [topicsFiltered]);

    const { loading: createTopicLoading, execute: createTopicAsync } = usePost<
        ICreateTopicPayload,
        ICreateTopicResponse
    >(topicService.createTopic, 'POST', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data: ICreateTopicResponse) => {
            toastHelper.showSuccessMessage(tCommon('messages.createSuccess', { name: topicLabel }));
            applyCreateTopic(data);
            setIsCreateTopicModalOpen(false);
        },
    });

    const { loading: updateTopicLoading, execute: updateTopicAsync } = usePost<
        IUpdateTopicPayload,
        IUpdateTopicResponse
    >(topicService.updateTopic, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: topicLabel }));
            applyUpdateTopic(data);
            setIsUpdateTopicModalOpen(false);
        },
    });

    const { loading: deleteTopicLoading, execute: deleteTopicAsync } = usePost<number, number>(
        topicService.deleteTopic,
        'DELETE',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess: (data) => {
                toastHelper.showSuccessMessage(tCommon('messages.deleteSuccess', { name: topicLabel }));
                applyDeleteTopic(data);
                setIsDeleteTopicModalOpen(false);
            },
        },
    );

    useEffect(() => {
        if (!topics) return;
        const searchLower = searchQuery.trim().toLowerCase();
        const sorted = [...topics].sort((a, b) => {
            if (sortBy === 'title-asc') return a.name.localeCompare(b.name, 'vi');
            if (sortBy === 'title-desc') return b.name.localeCompare(a.name, 'vi');
            if (sortBy === 'newest') {
                if (a.createdAt === b.createdAt) return 0;
                return a.createdAt! > b.createdAt! ? 1 : -1;
            }
            if (sortBy === 'oldest') {
                if (a.createdAt === b.createdAt) return 0;
                return a.createdAt! < b.createdAt! ? 1 : -1;
            }
            if (sortBy === 'flashcards-due-today') return (b.flashcardsDueToday || 0) - (a.flashcardsDueToday || 0);
            return 0;
        });
        const filtered = searchLower
            ? sorted.filter(
                  (t) =>
                      t.name.toLowerCase().includes(searchLower) ||
                      (t.description || '').toLowerCase().includes(searchLower),
              )
            : sorted;
        setTopicsFiltered(filtered);
    }, [topics, sortBy, searchQuery]);

    useEffect(() => {
        if (!isUpdateTopicModalOpen) {
            setUpdatingTopic(null);
        }
        if (!isDeleteTopicModalOpen) {
            setDeletingTopic(null);
        }
        if (!isTopicDetailsModalOpen) {
            setSelectingTopic(null);
        }
    }, [isUpdateTopicModalOpen, isDeleteTopicModalOpen, isTopicDetailsModalOpen]);

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
                handleNameClick={handleNameClick}
            />
        );
    };

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
                if (e.topicId === topic.topicId)
                    return {
                        ...e,
                        name: topic.name,
                        description: topic.description,
                        imageUrl: topic.imageUrl,
                    };
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
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.name') }));
            return;
        }
        await createTopicAsync(topic);
    }

    async function handleUpdateClick(topic: IUpdateTopicPayload) {
        if (!topic.name) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.name') }));
            return;
        }
        await updateTopicAsync(topic);
    }

    async function handleDeleteClick(topicId: number) {
        await deleteTopicAsync(topicId);
    }

    function handleNameClick(topic: ITopic) {
        const selectingTopic: ITopicDetails = {
            ...topic,
            numbers: { flashcards: topic.flashcardsCount ? topic.flashcardsCount : 0, nodes: 0, quizzes: 0 },
        };
        setSelectingTopic(selectingTopic);
        setTimeout(() => {
            setIsTopicDetailsModalOpen(true);
        }, 50);
    }

    return (
        <div className="relative w-full max-w-6xl mx-auto mb-16 px-6 md:px-8">
            <div className="pointer-events-none absolute -inset-x-10 -top-6 h-40 bg-gradient-to-r from-indigo-300/20 via-sky-300/20 to-cyan-300/20 dark:from-indigo-500/10 dark:via-sky-500/10 dark:to-cyan-500/10 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200/60 dark:border-white/10 bg-gradient-to-br from-white/80 via-white/60 to-white/80 dark:from-slate-800/70 dark:via-slate-900/40 dark:to-slate-800/70 backdrop-blur-md shadow-[0_12px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_8px_40px_-10px_rgba(0,0,0,0.6)] overflow-hidden">
                <div className="absolute inset-0 opacity-[0.25] dark:opacity-[0.04] mix-blend-normal dark:mix-blend-soft-light bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_60%)]" />
                <div className="relative z-10 px-6 pt-6 md:px-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 bg-clip-text text-transparent">
                                    {t('title')}
                                </h2>
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Your topics and personal contents live here
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={handleOpenCreateModal}
                            className="relative rounded-full px-5 h-10 text-sm font-medium bg-gradient-to-bl"
                        >
                            <Plus className="mr-2 h-4 w-4" /> {t('createNewContent')}
                        </Button>
                    </div>
                    <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <Metric label="Topics" value={metrics.topics} />
                        <Metric label="Due Today" value={metrics.due} />
                        <Metric label="New" value={metrics.fresh} />
                        <Metric label="Flashcards" value={metrics.totalFlashcards} />
                    </div>
                    <div className="mt-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="relative w-full md:max-w-sm group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-slate-700 dark:text-slate-500 dark:group-focus-within:text-slate-300 transition-colors" />
                            <Input
                                placeholder={t('searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 rounded-full bg-white/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-0 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                <Filter className="h-4 w-4" />
                                <span>{t('sortBy')}</span>
                            </div>
                            <Select value={sortBy} onValueChange={(value: TopicFilteringAction) => setSortBy(value)}>
                                <SelectTrigger className="w-48 h-10 rounded-full bg-white/70 dark:bg-slate-800/60 border-slate-200/70 dark:border-white/10 text-sm text-slate-700 dark:text-slate-200">
                                    <SelectValue placeholder={t('sortBy')} />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-md bg-white/90 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200">
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
                </div>
                {/* Topics list */}
                <div className="relative z-10 px-4 md:px-6 pb-8 pt-4">{handleRenderTopicsSection()}</div>
            </div>

            <CreateTopicModal
                isOpen={isCreateTopicModalOpen}
                setIsOpen={setIsCreateTopicModalOpen}
                onSubmit={handleCreateClick}
                loading={createTopicLoading}
            />

            <UpdateTopicModal
                isOpen={isUpdateTopicModalOpen}
                setIsOpen={setIsUpdateTopicModalOpen}
                topic={updatingTopic}
                onSubmit={handleUpdateClick}
                loading={updateTopicLoading}
            />

            <DeleteTopicModal
                isOpen={isDeleteTopicModalOpen}
                setIsOpen={setIsDeleteTopicModalOpen}
                topic={deletingTopic}
                handleDeleteClick={handleDeleteClick}
                loading={deleteTopicLoading}
            />

            <TopicDetailsModal
                isOpen={isTopicDetailsModalOpen}
                setIsOpen={setIsTopicDetailsModalOpen}
                topic={selectingTopic}
            />
        </div>
    );
};

const Metric = ({ label, value, tone }: { label: string; value: number; tone?: 'warning' | 'info' | 'accent' }) => {
    const palette: Record<string, string> = {
        warning: 'from-amber-500 to-orange-500 dark:from-amber-400/80 dark:to-orange-400/80',
        info: 'from-sky-600 to-cyan-600 dark:from-sky-400/80 dark:to-cyan-400/80',
        accent: 'from-violet-600 to-indigo-600 dark:from-violet-400/80 dark:to-indigo-400/80',
    };
    const defaultGradient = 'from-indigo-700 to-cyan-700 dark:from-indigo-300/80 dark:to-cyan-300/80';
    const gradient = tone ? palette[tone] : defaultGradient;
    return (
        <div className="relative group overflow-hidden rounded-xl border border-slate-200/60 dark:border-white/10 bg-white/60 dark:bg-slate-800/40 backdrop-blur-sm p-3 flex flex-col gap-1">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-slate-100/80 to-transparent dark:from-white/5" />
            <span className="text-[0.65rem] uppercase tracking-wide text-slate-500 font-medium dark:text-slate-400/80">
                {label}
            </span>
            <span className={`text-base font-semibold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                {value}
            </span>
        </div>
    );
};

export default PersonalTopicLibrary;
