'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import ContentCard from './ContentCard';
import TopicsList from '../../topics/components/TopicsList';
import { useRouter } from 'next/navigation';
import { TopicModal } from '../../topics/components/TopicModal';
import { TopicCreatedForm } from '../../topics/components/TopicCreatedForm';
import useFetch from '@/hooks/useFetch';
import { ITopicForUser, ITopicsForUserReturned } from '../../topics/topic.type';
import LoadingPage from '@/app/loading';

interface ContentLibraryProps {
    contentSets?: ContentSet[];
    onCreateContent?: () => void;
    onStudyContent?: (id: string) => void;
    onEditContent?: (id: string) => void;
    onDeleteContent?: (id: string) => void;
}

interface ContentSet {
    id: string;
    title: string;
    createdAt: string;
    contentType: 'flashcards' | 'notes' | 'quiz';
    itemCount: number;
    lastStudied?: string;
}

//TODO: change sample content by data fetching
const sampleContentSets: ContentSet[] = [
    {
        id: '1',
        title: 'Introduction to React',
        createdAt: '2023-05-15',
        contentType: 'flashcards',
        itemCount: 24,
        lastStudied: '3 days ago',
    },
    {
        id: '2',
        title: 'JavaScript Fundamentals',
        createdAt: '2023-04-20',
        contentType: 'notes',
        itemCount: 15,
        lastStudied: '1 week ago',
    },
    {
        id: '3',
        title: 'CSS Grid & Flexbox',
        createdAt: '2023-06-10',
        contentType: 'flashcards',
        itemCount: 32,
        lastStudied: '2 days ago',
    },
    {
        id: '4',
        title: 'TypeScript Basics',
        createdAt: '2023-05-28',
        contentType: 'quiz',
        itemCount: 18,
    },
    {
        id: '5',
        title: 'React Hooks Deep Dive',
        createdAt: '2023-06-22',
        contentType: 'flashcards',
        itemCount: 42,
        lastStudied: '1 day ago',
    },
    {
        id: '6',
        title: 'Web Accessibility',
        createdAt: '2023-07-05',
        contentType: 'notes',
        itemCount: 27,
    },
    {
        id: '7',
        title: 'Node.js Fundamentals',
        createdAt: '2023-06-18',
        contentType: 'flashcards',
        itemCount: 36,
        lastStudied: '5 days ago',
    },
    {
        id: '8',
        title: 'Git & GitHub Workflow',
        createdAt: '2023-05-30',
        contentType: 'quiz',
        itemCount: 20,
        lastStudied: '2 weeks ago',
    },
];

type TopicFilteringAction = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'recently-studied' | 'flashcards-due-today'; 

const ContentLibrary: React.FC<ContentLibraryProps> = ({
    contentSets = sampleContentSets,
    onCreateContent = () => {},
    onStudyContent = () => {},
    onEditContent = () => {},
    onDeleteContent = () => {},
}) => {
    const router = useRouter();
    const t = useTranslations('home.contentLibrary');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');

    // topic states to manage Create New Content
    const topicCreatedTranslation = useTranslations('topic.createdForm');
    const {
        data: topics,
        setData: setTopics,
        error: topicsError,
        loading: topicsLoading,
    } = useFetch<ITopicsForUserReturned>('/topics');
    const [topicName, setTopicName] = useState<string>('');
    const [topicDescription, setTopicDescription] = useState<string>('');
    const [isTopicModalOpen, setIsTopicModalOpen] = useState<boolean>(false);

    const [topicsFiltered, setTopicsFiltered] = useState<ITopicsForUserReturned>();

    useEffect(() => {   
        if(!topics) {
            return;
        } 
        const topicsCopied = [...topics];
        const topicsFiltered = topicsCopied.sort((a, b) => {
            if(sortBy === 'title-asc') {
                return a.name.localeCompare(b.name, 'vi')
            } else if(sortBy === 'title-desc') {
                return b.name.localeCompare(a.name, 'vi')
            } else if(sortBy === 'newest') {
                if(a.createdAt === b.createdAt) return 0;
                return a.createdAt! > b.createdAt! ? 1 : -1
            } else if(sortBy === 'oldest') {
                if(a.createdAt === b.createdAt) return 0;
                return a.createdAt! < b.createdAt! ? 1 : -1
            } else if(sortBy === 'flashcards-due-today') {
                return b.flashcardsDueToday! - a.flashcardsDueToday!
            } else {
                return 0
            }
        })
        // console.log(topicsFiltered);
        setTopicsFiltered(topicsFiltered);
    }, [topics, sortBy]);

    const handleRenderTopicsSection = () => {
        if (topicsLoading || !topics || !topicsFiltered) {
            return <LoadingPage />;
        }
        if (topicsError) {
            return <div>Error: {topicsError} </div>;
        }
        if (topics?.length === 0) {
            return <div>No Topics available</div>;
        }
        return <TopicsList topics={topicsFiltered} setTopics={setTopics} />; // todo-ka: cân nhắc setTopicsFiltered ngay khi nhận response từ API thay vì useEffect topics
    };

    const handleCloseCreateModal = () => {
        setTopicName('');
        setTopicDescription('');
        setIsTopicModalOpen(false);
    };

    // todo-ka: check this function
    const addTopic = (topic: ITopicForUser) => {
        if (topics === null) return;
        setTopics([...topics, { ...topic, flashcardsCount: 0, flashcardsDueToday: 0, flashcardsNew: 0 }]);
    };

    // Filter content based on search query, active tab, and sort
    const filteredContent = contentSets
        .filter((content) => {
            // Filter by search query
            if (searchQuery && !content.title.toLowerCase().includes(searchQuery.toLowerCase())) {
                return false;
            }

            // Filter by content type tab
            if (activeTab === 'all') return true;
            if (activeTab === 'flashcards' && content.contentType === 'flashcards') return true;
            if (activeTab === 'notes' && content.contentType === 'notes') return true;
            if (activeTab === 'quizzes' && content.contentType === 'quiz') return true;

            return false;
        })
        .sort((a, b) => {
            // Sort content
            if (sortBy === 'newest') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            } else if (sortBy === 'title-asc') {
                return a.title.localeCompare(b.title);
            } else if (sortBy === 'title-desc') {
                return b.title.localeCompare(a.title);
            } else if (sortBy === 'recently-studied') {
                // If lastStudied is undefined, put it at the end
                if (!a.lastStudied && !b.lastStudied) return 0;
                if (!a.lastStudied) return 1;
                if (!b.lastStudied) return -1;

                // Simple string comparison for demo purposes
                // In a real app, you'd parse these dates properly
                return a.lastStudied.localeCompare(b.lastStudied);
            }
            return 0;
        });

    return (
        <div className="w-full max-w-[85%] mx-auto mb-12 p-6 rounded-lg bg-gray-100 shadow-md dark:bg-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-semibold">{t('title')}</h2>
                <TopicModal
                    trigger={
                        <Button className="bg-background text-foreground">
                            <Plus className="mr-2 h-4 w-4" />{t('createNewContent')}
                        </Button>
                    }
                    title={topicCreatedTranslation('title')}
                    body={
                        <TopicCreatedForm
                            name={topicName}
                            setName={setTopicName}
                            description={topicDescription}
                            setDescription={setTopicDescription}
                            handleCloseModal={handleCloseCreateModal}
                            addTopic={addTopic}
                        />
                    }
                    isOpen={isTopicModalOpen}
                    setIsOpen={setIsTopicModalOpen}
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
                            <SelectItem value="recently-studied">{t('sortOptions.recentlyStudied')}</SelectItem>
                            <SelectItem value="flashcards-due-today">Flashcards Due Today</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {handleRenderTopicsSection()}
            {/* TODO: UNKNOWN */}
            {/* <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList className="w-full md:w-auto bg-gray-200">
                    <TabsTrigger value="all" className="flex-1 md:flex-none">
                        {t('tabs.all')}
                    </TabsTrigger>
                    <TabsTrigger value="flashcards" className="flex-1 md:flex-none">
                        {t('tabs.flashcards')}
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="flex-1 md:flex-none">
                        {t('tabs.notes')}
                    </TabsTrigger>
                    <TabsTrigger value="quizzes" className="flex-1 md:flex-none">
                        {t('tabs.quizzes')}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-6">
                    {handleRenderTopicsSection()}
                </TabsContent>
                <TabsContent value="flashcards" className="mt-6">
                    {renderContentGrid(filteredContent)}
                </TabsContent>
                <TabsContent value="notes" className="mt-6">
                    {renderContentGrid(filteredContent)}
                </TabsContent>
                <TabsContent value="quizzes" className="mt-6">
                    {renderContentGrid(filteredContent)}
                </TabsContent>
            </Tabs> */}
            {filteredContent.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 rounded-lg border border-gray-200">
                    <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700 mb-2">{t('noContent.title')}</h3>
                    <p className="text-gray-500 text-center mb-6">
                        {searchQuery
                            ? t('noContent.searchMessage', { query: searchQuery })
                            : t('noContent.emptyMessage')}
                    </p>
                    <Button onClick={onCreateContent} className="bg-background text-foreground">
                        <Plus className="mr-2 h-4 w-4" /> {t('createNewContent')}
                    </Button>
                </div>
            )}
        </div>
    );

    function renderContentGrid(content: ContentSet[]) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {content.map((item) => (
                    <ContentCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        createdAt={item.createdAt}
                        contentType={item.contentType}
                        itemCount={item.itemCount}
                        lastStudied={item.lastStudied}
                        onStudy={onStudyContent}
                        onEdit={onEditContent}
                        onDelete={onDeleteContent}
                    />
                ))}
            </div>
        );
    }
};

export default ContentLibrary;
