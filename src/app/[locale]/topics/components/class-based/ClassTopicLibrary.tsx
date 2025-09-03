'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Filter, Plus, School, Sparkles, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import TopicsList from '../TopicsList';
import useFetch from '@/hooks/useFetch';
import LoadingPage from '@/app/loading';
import { ITopic } from '../../types/topic.type';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import studentClassService from '@/services/class-based-learning/student/studentClass.service';
import TopicDetailsModal, { ITopicDetails } from '../modals/TopicDetailsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClassFeedList from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedList';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import classFeedService from '@/services/class-based-learning/classFeed.service';
import studentTopicService from '@/services/class-based-learning/student/studentTopic.service';
import { useClassBased } from '@/contexts/class-based';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

const ClassTopicLibrary: React.FC = () => {
    const { classId } = useClassBased();
    const t = useTranslations('home.contentLibrary');
    const tClass = useTranslations('class');
    const tCommon = useTranslations('common');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    // topic details
    const [isTopicDetailsModalOpen, setIsTopicDetailsModalOpen] = useState<boolean>(false);
    const [selectingTopic, setSelectingTopic] = useState<ITopicDetails | null>();

    const {
        data: topics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopic[]>(() => studentTopicService.getTopicsInClass(classId));

    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => studentClassService.getClassById(classId));

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    const {
        data: feeds,
        error: feedsError,
        loading: feedsLoading,
    } = useFetch<IClassFeed[]>(() => classFeedService.getFeedsInClass({ classId }));

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
                handleNameClick={handleNameClick}
            />
        );
    };

    useEffect(() => {
        if (!isTopicDetailsModalOpen) {
            setSelectingTopic(null);
        }
    }, [isTopicDetailsModalOpen]);

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
                            <h2 className="text-2xl font-semibold">
                                {tClass('classWithName', { name: myClass.name })}
                            </h2>
                        </div>
                    </div>
                    <div className="text-muted-foreground">
                        {myClass.description ? myClass.description : tCommon('labels.noDescription')}
                    </div>
                    <div className="text-sm">
                        {tClass('invitationCode')}: {myClass.invitationCode}
                    </div>
                </div>
            </div>
            <Tabs defaultValue="feeds">
                <TabsList>
                    <TabsTrigger value="feeds" className="flex items-center gap-2">
                        <span>Feeds</span>
                    </TabsTrigger>
                    <TabsTrigger value="topics" className="flex items-center gap-2">
                        <span>Topics</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="feeds">
                    {feedsError ? <div>Error: {feedsError}</div> : null}
                    {feedsLoading ? <LoadingPage /> : null}
                    {feeds ? (
                        <div className="mt-5">
                            <ClassFeedList feedList={feeds} editable={false} />
                        </div>
                    ) : null}
                </TabsContent>

                <TabsContent value="topics">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 mt-5 gap-4">
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

                    <TopicDetailsModal
                        isOpen={isTopicDetailsModalOpen}
                        setIsOpen={setIsTopicDetailsModalOpen}
                        topic={selectingTopic}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ClassTopicLibrary;
