'use client';

import { Fragment, ReactElement, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import LoadingPage from '@/app/loading';
import { Button } from '@/components/ui/button';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/utils/constants/routes';
import { Edit, Filter, Package, Plus, Search, Trash2 } from 'lucide-react';

import { useTopics } from '../../hooks/useTopics';
import { ITopic } from '../../types/topic.type';
import Metric from '../common/Metric';
import TopicCard from '../common/TopicCard';
import LearningSpace from '../common/LearningSpace';
import { CreateTopicModal } from '../modals/CreateTopicModal';
import { DeleteTopicModal } from '../modals/DeleteTopicModal';
import TopicDetailsModal from '../modals/TopicDetailsModal';
import { UpdateTopicModal } from '../modals/UpdateTopicModal';
import ListPackage from './ListPackage';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

export default function PersonalTopicLibrary() {
    const router = useRouter();
    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    const metrics = useMemo(() => {
        const list = topicsFiltered ?? [];
        let due = 0;
        let fresh = 0;
        let totalFlashcards = 0;
        let learning = 0;
        list.forEach((t) => {
            fresh += t.flashcardCounts?.new || 0;
            learning += t.flashcardCounts?.learning || 0;
            due += t.flashcardCounts?.review || 0;
            totalFlashcards += t.flashcardCounts?.total || 0;
        });
        return {
            topics: list.length,
            fresh,
            learning,
            due,
            totalFlashcards,
        };
    }, [topicsFiltered]);

    const { fetchTopics, createTopic, updateTopic, deleteTopic, showTopicDetails, selectPackage } = useTopics({
        mode: 'personal',
    });

    const { topics, topicsError, topicsLoading } = fetchTopics;

    const {
        isOpen: isCreateTopicModalOpen,
        setIsOpen: setIsCreateTopicModalOpen,
        loading: createTopicLoading,
        submit: handleCreateTopicSubmit,
    } = createTopic;

    const {
        isOpen: isUpdateTopicModalOpen,
        setIsOpen: setIsUpdateTopicModalOpen,
        open: handleUpdateTopicModalOpen,
        loading: updateTopicLoading,
        submit: handleUpdateTopicSubmit,
        updatingTopic,
    } = updateTopic;

    const {
        isOpen: isDeleteTopicModalOpen,
        setIsOpen: setIsDeleteTopicModalOpen,
        open: handleDeleteTopicModalOpen,
        loading: deleteTopicLoading,
        submit: handleDeleteTopicSubmit,
        deletingTopic,
    } = deleteTopic;

    const { isOpen: isTopicDetailsModalOpen, setIsOpen: setIsTopicDetailsModalOpen, selectingTopic } = showTopicDetails;

    const {
        isOpen: isOpenListPackage,
        setIsOpen: setIsOpenListPackage,
        open: onSelectTopicForPackage,
        selectingTopic: selectingTopicForPackageModal,
    } = selectPackage;

    useEffect(() => {
        if (!topics) {
            return;
        }

        const filterPattern = searchQuery.trim().toLowerCase();

        let baseFiltered = topics;

        if (filterPattern) {
            baseFiltered = topics.filter((topic) => {
                if (!filterPattern) return true;

                const namePattern = topic?.name?.trim().toLowerCase();
                const descriptionPattern = topic?.description?.trim()?.toLowerCase();

                return namePattern.includes(filterPattern) || descriptionPattern?.includes(filterPattern);
            });
        }

        const sorted = [...baseFiltered].sort((a, b) => {
            if (sortBy === 'title-asc') return a.name.localeCompare(b.name, 'vi');
            if (sortBy === 'title-desc') return b.name.localeCompare(a.name, 'vi');
            const ts = (d?: string | number | Date) => (d ? new Date(d).getTime() : 0);
            if (sortBy === 'newest') return ts(b.createdAt) - ts(a.createdAt);
            if (sortBy === 'oldest') return ts(a.createdAt) - ts(b.createdAt);
            if (sortBy === 'flashcards-due-today')
                return (b.flashcardCounts?.review || 0) - (a.flashcardCounts?.review || 0);
            return 0;
        });

        setTopicsFiltered(sorted);
    }, [topics, sortBy, searchQuery]);

    function handleTopicNameClick({ topicId }: ITopic) {
        router.push(ROUTES.TOPIC_WORKSPACE({ topicId }));
    }

    const handleOpenCreateModal = useCallback(() => {
        setTimeout(() => {
            setIsCreateTopicModalOpen(true);
        }, 50);
    }, []);

    // UI Section

    const menuContentInCard = (topic: ITopic) => {
        const { topicId, name, description, imageUrl } = topic;
        return (
            <DropdownMenuContent align="start" side="top" className="w-48 border-zinc-200 dark:border-zinc-800">
                <DropdownMenuItem
                    onSelect={() => onSelectTopicForPackage(topic)}
                    className="cursor-pointer text-zinc-600 focus:text-zinc-900 dark:text-zinc-400 dark:focus:text-zinc-100"
                >
                    <Package className="mr-2 size-4" />
                    <span>{tTopic('addPackage')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                    onSelect={() => handleUpdateTopicModalOpen({ topicId, name, description, imageUrl })}
                    className="cursor-pointer text-zinc-600 focus:text-zinc-900 dark:text-zinc-400 dark:focus:text-zinc-100"
                >
                    <Edit className="mr-2 size-4" />
                    <span>{tCommon('actions.edit')}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />

                <DropdownMenuItem
                    onSelect={() => handleDeleteTopicModalOpen({ topicId, name })}
                    className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 dark:focus:bg-red-900/20"
                >
                    <Trash2 className="mr-2 size-4" />
                    <span>{tCommon('actions.delete')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        );
    };

    const cardFooter = (topic: ITopic) => {
        const newFlashcards = topic.flashcardCounts?.new || 0;
        const totalFlashcards = topic.flashcardCounts?.total || 0;
        const learningFlashcards = topic.flashcardCounts?.learning || 0;
        const dueTodayFlashcards = topic.flashcardCounts?.review || 0;
        //TODO: note for update logic calculate remain flashcard remain and get progress

        let progressValue = 0;
        if (totalFlashcards) {
            const completed = totalFlashcards - (newFlashcards + learningFlashcards + dueTodayFlashcards);
            const percentage = Math.round((completed / totalFlashcards) * 100);
            // Clamp between 0 and 100
            progressValue = Math.min(100, Math.max(0, percentage));
        }

        return (
            <div className="mt-2 w-full">
                <div className="mb-2 flex items-end justify-between">
                    <span className="text-xs font-medium text-zinc-500">Progress</span>
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{progressValue}%</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                        className="h-full bg-zinc-900 transition-all duration-500 ease-out dark:bg-zinc-100"
                        style={{ width: `${progressValue}%` }}
                    />
                </div>
            </div>
        );
    };

    const handleRenderTopicsSection = () => {
        if (topicsError) {
            return <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-500"></div>;
        }
        if (topicsLoading || !topics || !topicsFiltered) {
            return <LoadingPage />;
        }
        if (topics?.length === 0) {
            return <div className="p-8 text-center text-zinc-500">No topics found.</div>;
        }
        return (
            <div className="relative z-10 px-4 pb-12 pt-6 md:px-8">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {topicsFiltered?.map((topic) => (
                        <TopicCard
                            key={topic.topicId}
                            topic={topic}
                            handleNameClick={handleTopicNameClick}
                            menuContent={menuContentInCard}
                            footer={cardFooter}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const metricContent: ReactElement = (
        <div className="relative z-10 px-4 pt-8 md:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Metric label="New" value={metrics.fresh} />
                <Metric label="Learning" value={metrics.learning} />
                <Metric label="Due Today" value={metrics.due} />
            </div>

            <div className="mt-8 flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
                    <Input
                        placeholder={t('searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 rounded-full border-zinc-200 bg-white pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-100"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden text-xs font-medium uppercase tracking-wider text-zinc-500 sm:block">
                        {t('sortBy')}
                    </span>
                    <Select value={sortBy} onValueChange={(value: TopicFilteringAction) => setSortBy(value)}>
                        <SelectTrigger className="h-10 w-full rounded-full border-zinc-200 bg-white text-zinc-900 focus:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 md:w-[200px]">
                            <div className="flex items-center gap-2">
                                <Filter className="size-3.5 opacity-70" />
                                <SelectValue placeholder={t('sortBy')} />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
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
    );

    const topicContent = (
        <Fragment>
            {metricContent}

            <ListPackage
                isOpenListPackage={isOpenListPackage}
                setIsOpenListPackage={setIsOpenListPackage}
                topic={selectingTopicForPackageModal}
            />

            {handleRenderTopicsSection()}

            <CreateTopicModal
                isOpen={isCreateTopicModalOpen}
                setIsOpen={setIsCreateTopicModalOpen}
                onSubmit={handleCreateTopicSubmit}
                loading={createTopicLoading}
            />

            <UpdateTopicModal
                isOpen={isUpdateTopicModalOpen}
                setIsOpen={setIsUpdateTopicModalOpen}
                topic={updatingTopic}
                onSubmit={handleUpdateTopicSubmit}
                loading={updateTopicLoading}
            />

            <DeleteTopicModal
                isOpen={isDeleteTopicModalOpen}
                setIsOpen={setIsDeleteTopicModalOpen}
                topic={deletingTopic}
                handleDeleteClick={handleDeleteTopicSubmit}
                loading={deleteTopicLoading}
            />

            <TopicDetailsModal
                isOpen={isTopicDetailsModalOpen}
                setIsOpen={setIsTopicDetailsModalOpen}
                topic={selectingTopic}
            />
        </Fragment>
    );

    const mainActionButtons = (
        <Button onClick={handleOpenCreateModal} className="h-10 px-6 font-medium" variant="outline">
            <Plus className="size-4" /> {t('createNewContent')}
        </Button>
    );

    return <LearningSpace mode="personal" topicContent={topicContent} mainActionButtons={mainActionButtons} />;
}
