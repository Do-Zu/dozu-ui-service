'use client';

import TopicLibrary from './TopicLibrary';
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
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import usePost from '@/hooks/usePost';
import toastHelper from '@/utils/toast.helper';
import teacherClassService from '@/services/class-based-learning/teacher/teacherClass.service';
import TopicDetailsModal, { ITopicDetails } from '@/app/[locale]/topics/components/modals/TopicDetailsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import classFeedService, {
    ICreateClassFeedBody,
    ICreateClassFeedPayload,
    IDeleteClassFeedPayload,
    IUpdateClassFeedBody,
    IUpdateClassFeedPayload,
} from '@/services/class-based-learning/classFeed.service';
import ClassFeedList from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedList';
import UpdateFeedModal, { IUpdatingFeed } from '@/app/[locale]/teacher/home/components/modal/classFeed/UpdateFeedModal';
import CreateFeedModal from '@/app/[locale]/teacher/home/components/modal/classFeed/CreateFeedModal';
import { DeleteFeedModal } from '@/app/[locale]/teacher/home/components/modal/classFeed/DeleteFeedModal';
import ClassTopicList from '@/app/[locale]/teacher/class-based/components/ui/ClassTopicList';
import TopicCard from './TopicCard';
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
import { useTopics } from '../../hooks/useTopics';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

export default function TeacherTopicLibrary({ classId }: { classId: number }) {
    const router = useRouter();

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

    // feeds
    const {
        data: feeds,
        setData: setFeeds,
        error: feedsError,
        loading: feedsLoading,
    } = useFetch<IClassFeed[]>(() => classFeedService.getFeedsInClassForTeacher({ classId }));

    // create feed
    const [isCreateFeedModalOpen, setIsCreateFeedModalOpen] = useState<boolean>(false);

    // update feed
    const [isUpdateFeedModalOpen, setIsUpdateFeedModalOpen] = useState<boolean>(false);
    const [updatingFeed, setUpdatingFeed] = useState<IUpdatingFeed | null>(null);

    // delete feed
    const [isDeleteFeedModalOpen, setIsDeleteFeedModalOpen] = useState<boolean>(false);
    const [deletingFeed, setDeletingFeed] = useState<number | null>(null);

    const { loading: createFeedLoading, execute: createFeedAsync } = usePost<ICreateClassFeedPayload, IClassFeed>(
        classFeedService.createGeneralFeed,
        'POST',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Create class feed successfully');
                applyCreateFeed(data);
                setIsCreateFeedModalOpen(false);
            },
        },
    );

    const { loading: updateFeedLoading, execute: updateFeedAsync } = usePost<IUpdateClassFeedPayload, IClassFeed>(
        classFeedService.updateFeed,
        'PUT',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Update class feed successfully');
                applyUpdateFeed(data);
                setIsUpdateFeedModalOpen(false);
            },
        },
    );

    const { loading: deleteFeedLoading, execute: deleteFeedAsync } = usePost<IDeleteClassFeedPayload, number>(
        classFeedService.deleteFeed,
        'DELETE',
        {
            onError: toastHelper.showErrorMessage,
            onSuccess(data) {
                toastHelper.showSuccessMessage('Delete class feed successfully');
                applyDeleteFeed(data);
                setIsDeleteFeedModalOpen(false);
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

    const handleOpenCreateFeedModal = useCallback(() => {
        setTimeout(() => {
            setIsCreateFeedModalOpen(true);
        }, 50);
    }, []);

    const handleOpenUpdateFeedModal = useCallback((feed: IUpdatingFeed) => {
        setTimeout(() => {
            setIsUpdateFeedModalOpen(true);
            setUpdatingFeed(feed);
        }, 50);
    }, []);

    const handleOpenDeleteFeedModal = useCallback((classFeedId: number) => {
        setTimeout(() => {
            setIsDeleteFeedModalOpen(true);
            setDeletingFeed(classFeedId);
        }, 50);
    }, []);

    const applyCreateFeed = (feed: IClassFeed) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            currentFeeds.unshift(feed);
            return currentFeeds;
        });
    };

    const applyUpdateFeed = (feed: IClassFeed) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            const feedsUpdated = currentFeeds.map((e) => {
                return e.classFeedId === feed.classFeedId ? feed : e;
            });
            return feedsUpdated;
        });
    };

    const applyDeleteFeed = (classFeedId: number) => {
        setFeeds((prevFeeds) => {
            const currentFeeds = prevFeeds ?? [];
            const feedsFiltered = currentFeeds.filter((e) => e.classFeedId !== classFeedId);
            return feedsFiltered;
        });
    };

    async function handleCreateFeedClick(feed: ICreateClassFeedBody) {
        if (!feed.title) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.title') }));
            return;
        }
        const value: ICreateClassFeedPayload = { ...feed, classId };
        await createFeedAsync(value);
    }

    async function handleUpdateFeedClick(feed: IUpdatingFeed) {
        if (!updatingFeed) {
            toastHelper.showErrorMessage('No selecting feed');
            return;
        }
        if (!feed.title) {
            toastHelper.showErrorMessage(tCommon('validation.required', { name: tCommon('labels.title') }));
            return;
        }
        const value: IUpdateClassFeedPayload = { ...feed, classId };
        await updateFeedAsync(value);
    }

    async function handleDeleteFeedClick(classFeedId: number) {
        const value: IDeleteClassFeedPayload = { classId, classFeedId };
        await deleteFeedAsync(value);
    }

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
        router.push(ROUTES.MINDMAP_EDIT(topicId));
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

    const feedContent = (
        <>
            {feedsError ? <div>Error: {feedsError}</div> : null}
            {feedsLoading ? <LoadingPage /> : null}
            {feeds ? (
                <div className="mt-5 flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row justify-between items-start">
                        <Button className="bg-background text-foreground" onClick={handleOpenCreateFeedModal}>
                            <BellRing className="mr-2 h-4 w-4" />
                            Post an Announcement
                        </Button>
                    </div>

                    <ClassFeedList
                        feedList={feeds}
                        editable={true}
                        onUpdateOpen={handleOpenUpdateFeedModal}
                        onDeleteOpen={handleOpenDeleteFeedModal}
                    />

                    <CreateFeedModal
                        isOpen={isCreateFeedModalOpen}
                        setIsOpen={setIsCreateFeedModalOpen}
                        onSubmit={handleCreateFeedClick}
                        loading={createFeedLoading}
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
        <div className="w-full mx-auto rounded-lg bg-gray-100 shadow-md dark:bg-gray-800 mt-5">
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
        </div>
    );

    return (
        <TopicLibrary
            mode="class-based"
            myClass={myClass}
            mainActionButtons={mainActionButtons}
            feedContent={feedContent}
            topicContent={topicContent}
        />
    );
}
