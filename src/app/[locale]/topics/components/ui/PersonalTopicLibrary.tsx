'use client';

import { Fragment, ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

import LoadingPage from '@/app/loading';
import { Button } from '@/components/ui/button';
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/utils/constants/routes';
import {
    BookOpen,
    ClipboardCheck,
    Edit,
    Filter,
    GitFork,
    GraduationCap,
    Layers,
    Package,
    Play,
    Plus,
    Search,
    Settings,
    Trash2,
} from 'lucide-react';

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
        open: handleCreateTopicModalOpen,
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

    const {
        isOpen: isTopicDetailsModalOpen,
        setIsOpen: setIsTopicDetailsModalOpen,
        open: handleTopicDetailsModalOpen,
        selectingTopic,
    } = showTopicDetails;

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
            <DropdownMenuContent align="start" side="top">
                {/* Topic itself */}
                <DropdownMenuItem onSelect={() => onSelectTopicForPackage(topic)}>
                    <Package className="mr-2 h-4 w-4" />
                    <span>{tTopic('addPackage')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => handleUpdateTopicModalOpen({ topicId, name, description, imageUrl })}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>{tCommon('actions.edit')}</span>
                </DropdownMenuItem>

                <DropdownMenuItem onSelect={() => handleDeleteTopicModalOpen({ topicId, name })}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>{tCommon('actions.delete')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        );
    };

    const cardFooter = (topic: ITopic) => {
        const { topicId } = topic;
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
            <div>
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[0.6rem] font-semibold text-slate-600 dark:text-slate-300">
                            {progressValue}%
                        </span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                        <div
                            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-cyan-500 dark:from-indigo-200 dark:via-sky-200 dark:to-cyan-200 shadow-[0_0_0_1px_rgba(0,0,0,0.05)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.15)] transition-[width] duration-700 ease-out"
                            style={{ width: `${progressValue}%` }}
                        />
                        <div className="absolute inset-0 animate-[shimmer_2.5s_infinite] bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_40%,rgba(255,255,255,0)_80%)] dark:bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.15)_40%,rgba(255,255,255,0)_80%)] bg-[length:200%_100%]" />
                    </div>
                </div>
            </div>
        );
    };

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
        return (
            <div className="relative z-10 px-4 md:px-6 pb-8 pt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
        <div className="relative z-10 px-6 pt-6 md:px-8">
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Metric label="New" value={metrics.fresh} />
                <Metric label="Learning" value={metrics.learning} />
                <Metric label="Due Today" value={metrics.due} />
            </div>
            <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
    );

    const topicContent = (
        <Fragment>
            {metricContent}

            <ListPackage
                isOpenListPackage={isOpenListPackage}
                setIsOpenListPackage={setIsOpenListPackage}
                topic={selectingTopicForPackageModal}
            />

            {/* LIST TOPICS SECTION */}
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
        <Button
            onClick={handleOpenCreateModal}
            className="relative rounded-3xl px-5 h-10 text-sm font-medium"
        >
            <Plus className="mr-2 h-4 w-4" /> {t('createNewContent')}
        </Button>
    );

    return <LearningSpace mode="personal" topicContent={topicContent} mainActionButtons={mainActionButtons} />;
}
