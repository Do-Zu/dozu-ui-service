'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
    Play,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';

import { useTopics } from '../../hooks/useTopics';
import { ITopic } from '../../types/topic.type';
import Metric from '../common/Metric';
import TopicCard from '../common/TopicCard';
import TopicLibrary from '../common/TopicLibrary';
import { CreateTopicModal } from '../modals/CreateTopicModal';
import { DeleteTopicModal } from '../modals/DeleteTopicModal';
import TopicDetailsModal from '../modals/TopicDetailsModal';
import { UpdateTopicModal } from '../modals/UpdateTopicModal';

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

    const { fetchTopics, createTopic, updateTopic, deleteTopic, showTopicDetails } = useTopics({ mode: 'personal' });
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

    function handleOnSelectEditFlashcard(topicId: number) {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }

    function handleOnSelectBrowse(topicId: number) {
        router.push(ROUTES.FLASHCARDS_BROWSE(topicId));
    }

    async function handleOnSelectLearning(topicId: number) {
        router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
    }

    function handleOnClickMindmap(topicId: number) {
        router.push(ROUTES.MINDMAP_EDIT(topicId));
    }

    function handleOnClickStartQuiz(topicId: number) {
        router.push(ROUTES.QUIZ_START(topicId));
    }

    function handleOnClickEditQuestion(topicId: number) {
        router.push(ROUTES.QUIZ_EDIT(topicId));
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
                {/* Flashard section */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Layers className="mr-2 h-4 w-4" />
                        <span>Flashcard</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => handleOnSelectEditFlashcard(topicId)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{tCommon('actions.edit')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOnSelectBrowse(topicId)}>
                            <BookOpen className="mr-2 h-4 w-4" />
                            <span>{tTopic('browse')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOnSelectLearning(topicId)}>
                            <GraduationCap className="mr-2 h-4 w-4" />
                            <span>{tTopic('learning')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Mindmap section */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <GitFork className="mr-2 h-4 w-4" />
                        <span>Mind Map</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => handleOnClickMindmap(topicId)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{tCommon('actions.edit')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Quiz */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <ClipboardCheck className="mr-2 h-4 w-4" />
                        <span>Quiz</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                        <DropdownMenuItem onSelect={() => handleOnClickStartQuiz(topicId)}>
                            <Play className="mr-2 h-4 w-4" />
                            <span>{tTopic('start-quiz')}</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOnClickEditQuestion(topicId)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{tCommon('actions.edit')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* Topic itself */}
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

    const cardFooter = (topic: ITopic) => (
        <div className="flex flex-col text-xs text-foreground justify-between">
            <div className="flex flex-row justify-between items-center text-[0.7rem]">
                <div>
                    <span className="font-bold">{topic.flashcardsNew}</span> new flashcards
                </div>
                <div>
                    <span className="font-bold">{topic.flashcardsDueToday}</span> flashcards due today
                </div>
            </div>
        </div>
    );

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
            <div className="relative z-10 px-4 md:px-6 pb-8 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {topicsFiltered.map((topic) => (
                        <TopicCard
                            key={topic.topicId}
                            topic={topic}
                            handleNameClick={handleTopicDetailsModalOpen}
                            menuContent={menuContentInCard}
                            footer={cardFooter}
                        />
                    ))}
                </div>
            </div>
        );
    };

    const topicContent = (
        <>
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
        </>
    );

    const mainActionButtons = (
        <Button
            onClick={handleOpenCreateModal}
            className="relative rounded-full px-5 h-10 text-sm font-medium bg-gradient-to-bl"
        >
            <Plus className="mr-2 h-4 w-4" /> {t('createNewContent')}
        </Button>
    );

    return <TopicLibrary mode="personal" topicContent={topicContent} mainActionButtons={mainActionButtons} />;
}
