'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    Layers,
    Edit,
    BookOpen,
    GitFork,
    ClipboardCheck,
    Play,
    Trash2,
    GraduationCap,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { ICreateTopicResponse, ITopic, IUpdateTopicResponse } from '../../types/topic.type';
import topicService, { ICreateTopicPayload, IUpdateTopicPayload } from '@/services/topic/topic.service';
import { CreateTopicModal } from '../modals/CreateTopicModal';
import { UpdateTopicModal, IUpdatingTopic } from '../modals/UpdateTopicModal';
import { DeleteTopicModal, IDeletingTopic } from '../modals/DeleteTopicModal';
import { Button } from '@/components/ui/button';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import TopicDetailsModal, { ITopicDetails } from '../modals/TopicDetailsModal';
import TopicLibrary from './TopicLibrary';
import TopicCard from './TopicCard';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/utils/constants/routes';
import { useRouter } from 'next/navigation';
import { useTopics } from '../../hooks/useTopics';

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

    const topicContent = (
        <>
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

            {/* Topic Section */}
            {topicsError ? (
                <div>Error: {topicsError}</div>
            ) : topicsLoading || !topics || !topicsFiltered ? (
                <LoadingPage />
            ) : topics.length === 0 || topicsFiltered.length === 0 ? (
                <div></div>
            ) : (
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
            )}

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
        <Button className="bg-background text-foreground" onClick={handleCreateTopicModalOpen}>
            <Plus className="mr-2 h-4 w-4" />
            {t('createNewContent')}
        </Button>
    );

    return <TopicLibrary mode="personal" topicContent={topicContent} mainActionButtons={mainActionButtons} />;
}
