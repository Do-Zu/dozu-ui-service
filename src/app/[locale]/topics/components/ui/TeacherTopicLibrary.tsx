'use client';

import TopicLibrary from '../common/TopicLibrary';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Search,
    Filter,
    Plus,
    CircleUserRound,
    School,
    Layers,
    Edit,
    BookOpen,
    GitFork,
    ClipboardCheck,
    Play,
    Trash2,
    GraduationCap,
    BellRing,
    Sparkles,
    Users,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
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
import { CreateTopicModal } from '@/app/[locale]/topics/components/modals/CreateTopicModal';
import { IUpdatingTopic, UpdateTopicModal } from '@/app/[locale]/topics/components/modals/UpdateTopicModal';
import { DeleteTopicModal, IDeletingTopic } from '@/app/[locale]/topics/components/modals/DeleteTopicModal';
import { Button } from '@/components/ui/button';
import { ShowIf } from '@/components/ui/ShowIf';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import teacherClassService from '@/services/class-based-learning/teacher/teacherClass.service';
import TopicDetailsModal, { ITopicDetails } from '@/app/[locale]/topics/components/modals/TopicDetailsModal';
import UpdateFeedModal, { IUpdatingFeed } from '@/app/[locale]/teacher/feeds/components/modals/UpdateFeedModal';
import CreateFeedModal, { IDefaultFeed } from '@/app/[locale]/teacher/feeds/components/modals/CreateFeedModal';
import { DeleteFeedModal } from '@/app/[locale]/teacher/feeds/components/modals/DeleteFeedModal';
import TopicCard from '../common/TopicCard';
import { formatDate } from '@/utils';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { useTopics, useValidateTopic } from '../../hooks/useTopics';
import { useFeeds } from '@/app/[locale]/teacher/feeds/hooks/useFeeds';
import ClassFeedCard from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedCard';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import ClassFeedGroupedByTime from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedGroupByTime';
import { IFeedGroup } from '@/utils/feeds/feed.helper';
import ActivityTab from './ActivityTab';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

export default function TeacherTopicLibrary({ classId }: { classId: number }) {
    const router = useRouter();
    const validateTopic = useValidateTopic();

    const t = useTranslations('home.contentLibrary');
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const tClass = useTranslations('class');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => teacherClassService.getClassById(classId));

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    // topics
    const { fetchTopics, createTopic, updateTopic, deleteTopic, showTopicDetails } = useTopics({
        mode: 'class-based',
        role: 'teacher',
        classId,
    });
    const { topics, topicsError, topicsLoading } = fetchTopics;
    const {
        isOpen: isCreateTopicModalOpen,
        setIsOpen: setIsCreateTopicModalOpen,
        open: handleCreateTopicModalOpen,
        loading: createTopicLoading,
        createAsync: createTopicAsync,
    } = createTopic;

    const {
        isOpen: isUpdateTopicModalOpen,
        setIsOpen: setIsUpdateTopicModalOpen,
        open: handleUpdateTopicModalOpen,
        loading: updateTopicLoading,
        submit: handleUpdateTopicClick,
        updatingTopic,
    } = updateTopic;

    const {
        isOpen: isDeleteTopicModalOpen,
        setIsOpen: setIsDeleteTopicModalOpen,
        open: handleDeleteTopicModalOpen,
        loading: deleteTopicLoading,
        submit: handleDeleteTopicClick,
        deletingTopic,
    } = deleteTopic;

    const {
        isOpen: isTopicDetailsModalOpen,
        setIsOpen: setIsTopicDetailsModalOpen,
        open: handleTopicDetailsModalOpen,
        selectingTopic,
    } = showTopicDetails;

    const [defaultFeed, setDefaultFeed] = useState<IDefaultFeed>();

    // feeds
    const { fetchFeeds, createFeed, updateFeed, deleteFeed } = useFeeds({
        classId,
    });
    const { feeds, feedsError, feedsLoading } = fetchFeeds;
    const {
        isOpen: isCreateFeedModalOpen,
        setIsOpen: setIsCreateFeedModalOpen,
        open: handleCreateFeedModalOpen,
        loading: createFeedLoading,
        submit: handleCreateFeedClick,
    } = createFeed;

    const notifyFeed = { ...createFeed };
    const {
        isOpen: isNotifyModalOpen,
        setIsOpen: setIsNotifyModalOpen,
        open: handleNotifyModalOpen,
        close: handleNotifyModalClose,
        loading: notifyLoading,
        submit: handleNotifyClick,
    } = notifyFeed;

    const {
        isOpen: isUpdateFeedModalOpen,
        setIsOpen: setIsUpdateFeedModalOpen,
        open: handleUpdateFeedModalOpen,
        loading: updateFeedLoading,
        submit: handleUpdateFeedClick,
        updatingFeed,
    } = updateFeed;

    const {
        isOpen: isDeleteFeedModalOpen,
        setIsOpen: setIsDeleteFeedModalOpen,
        open: handleDeleteFeedModalOpen,
        loading: deleteFeedLoading,
        submit: handleDeleteFeedClick,
        deletingFeed,
    } = deleteFeed;

    async function handleCreateTopicClick(topic: ICreateTopicPayload) {
        if (!validateTopic(topic)) {
            return;
        }

        const data = await createTopicAsync(topic);
        if (data) {
            const defaultFeed: IDefaultFeed = {
                title: 'A new topic has been created',
                content: `Topic '${data.name}' is now available in our class. Check out to see the learning materials!`,
                link: null,
            };
            setDefaultFeed(defaultFeed);
            handleNotifyModalOpen();
        }
    }

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
                return (b.flashcardCounts?.review || 0) - (a.flashcardCounts?.review || 0);
            } else {
                return 0;
            }
        });
        setTopicsFiltered(topicsFiltered);
    }, [topics, sortBy]);

    function handleGenerateClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_GENERATE(classId));
    }

    function handleManageStudentsClick() {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_STUDENTS(classId));
    }

    function handleOnSelectEditFlashcard(topicId: number) {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }

    function handleOnSelectBrowse(topicId: number) {
        router.push(ROUTES.FLASHCARDS_BROWSE(topicId));
    }

    async function handleOnSelectLearning(topic: ITopic) {
        const { topicId, hasProgress } = topic;
        if (hasProgress != undefined && !hasProgress) {
            await topicService.startLearningFlashcards(topicId);
        }
        router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
    }

    function handleOnClickEditMindmap(topicId: number) {
        router.push(ROUTES.TEACHER.CLASS_BASED_ID_MINDMAP_EDIT(classId, topicId));
    }

    function handleOnClickStartQuiz(topicId: number) {
        router.push(ROUTES.QUIZ_START(topicId));
    }

    function handleOnClickEditQuestion(topicId: number) {
        router.push(ROUTES.QUIZ_EDIT(topicId));
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

    // UI Section

    const mainActionButtons = (
        <div className="flex flex-col gap-4">
            <Button className="bg-background text-foreground" onClick={handleManageStudentsClick}>
                <Users className="mr-2 h-4 w-4" />
                <span>{tClass('manageStudents')}</span>
            </Button>
        </div>
    );

    const renderFeedCard = (feedGroup: IFeedGroup) => {
        const { feed, group } = feedGroup;
        return (
            <ClassFeedCard
                key={feed.classFeedId}
                role="teacher"
                feed={feed}
                group={group}
                onUpdateOpen={handleUpdateFeedModalOpen}
                onDeleteOpen={handleDeleteFeedModalOpen}
            />
        );
    };

    const feedContent = (
        <>
            {feedsError ? <div>Error: {feedsError}</div> : null}
            {feedsLoading ? <LoadingPage /> : null}
            {feeds ? (
                <div className="mt-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <Button className="bg-background text-foreground" onClick={() => handleCreateFeedModalOpen()}>
                            <BellRing className="mr-2 h-4 w-4" />
                            Post an Announcement
                        </Button>
                    </div>

                    <div className="w-full h-full">
                        <ClassFeedGroupedByTime feeds={feeds} renderFeedCard={renderFeedCard} />
                    </div>

                    <CreateFeedModal
                        isOpen={isCreateFeedModalOpen}
                        setIsOpen={setIsCreateFeedModalOpen}
                        onSubmit={handleCreateFeedClick}
                        loading={createFeedLoading}
                        type="custom"
                    />

                    <UpdateFeedModal
                        isOpen={isUpdateFeedModalOpen}
                        setIsOpen={setIsUpdateFeedModalOpen}
                        feed={updatingFeed}
                        onSubmit={handleUpdateFeedClick}
                        loading={updateFeedLoading}
                    />

                    <DeleteFeedModal
                        isOpen={isDeleteFeedModalOpen}
                        setIsOpen={setIsDeleteFeedModalOpen}
                        classFeedId={deletingFeed}
                        onSubmit={handleDeleteFeedClick}
                        loading={deleteFeedLoading}
                    />
                </div>
            ) : null}
        </>
    );

    const activityContent = (
        <ActivityTab classId={classId} />
    );

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
                        <DropdownMenuItem onSelect={() => handleOnSelectLearning(topic)}>
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
                        <DropdownMenuItem onSelect={() => handleOnClickEditMindmap(topicId)}>
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
                        <DropdownMenuItem>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>{tCommon('actions.delete')}</span>
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
        <div className="text-xs text-foreground">
            Created At: <span className="font-bold">{formatDate(topic.createdAt)}</span>
        </div>
    );

    const topicContent = (
        <div className="w-full mx-auto mt-5">
            <div className="mb-4 flex flex-row justify-start items-start gap-4">
                <Button className="bg-background text-foreground" onClick={handleCreateTopicModalOpen}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t('createNewContent')}
                </Button>
                <Button className="bg-background text-foreground" onClick={handleGenerateClick}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {tClass('generateContent')}
                </Button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="relative w-full md:w-[300px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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
                onSubmit={handleCreateTopicClick}
                loading={createTopicLoading}
            />

            <UpdateTopicModal
                isOpen={isUpdateTopicModalOpen}
                setIsOpen={setIsUpdateTopicModalOpen}
                topic={updatingTopic}
                onSubmit={handleUpdateTopicClick}
                loading={updateTopicLoading}
            />

            <DeleteTopicModal
                isOpen={isDeleteTopicModalOpen}
                setIsOpen={setIsDeleteTopicModalOpen}
                topic={deletingTopic}
                handleDeleteClick={handleDeleteTopicClick}
                loading={deleteTopicLoading}
            />

            <TopicDetailsModal
                isOpen={isTopicDetailsModalOpen}
                setIsOpen={setIsTopicDetailsModalOpen}
                topic={selectingTopic}
            />

            <CreateFeedModal
                isOpen={isNotifyModalOpen}
                setIsOpen={setIsNotifyModalOpen}
                onSubmit={handleNotifyClick}
                loading={notifyLoading}
                defaultFeed={defaultFeed}
                type="system"
                onCancel={handleNotifyModalClose}
            />
        </div>
    );

    return (
        <TopicLibrary
            mode="class-based"
            myClass={myClass}
            mainActionButtons={mainActionButtons}
            feedContent={feedContent}
            topicContent={topicContent}
            activityContent={activityContent}
        />
    );
}
