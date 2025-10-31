import LoadingPage from '@/app/loading';
import { useEffect, useMemo, useState } from 'react';
import { ITopic } from '../../../topics/types/topic.type';
import TopicDetailsModal, { ITopicDetails } from '../../../topics/components/modals/TopicDetailsModal';
import { IClassFeed } from '@/app/[locale]/class-based/types/classFeed.type';
import useFetch from '@/hooks/useFetch';
import classFeedService from '@/services/class-based-learning/classFeed.service';
import studentClassService from '@/services/class-based-learning/student/studentClass.service';
import { IClass } from '@/app/[locale]/class-based/types/class.type';
import { useTranslations } from 'next-intl';
import LearningSpace from '../../../topics/components/common/LearningSpace';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
    BookOpen,
    ClipboardCheck,
    Edit,
    Filter,
    GitFork,
    GraduationCap,
    Layers,
    Play,
    Search,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StudentProfileModal from '../../../topics/components/modals/StudentProfileModal';
import { ROUTES } from '@/utils/constants/routes';
import topicService from '@/services/topic/topic.service';
import { useRouter } from 'next/navigation';
import { ShowIf } from '@/components/ui/ShowIf';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TopicCard from '../../../topics/components/common/TopicCard';
import studentTopicService from '@/services/class-based-learning/student/studentTopic.service';
import { useTopics } from '../../../topics/hooks/useTopics';
import { useClassBased } from '@/contexts/class-based';
import ClassFeedCard from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedCard';
import ClassFeedGroupedByTime from '@/app/[locale]/class-based/components/ui/classFeed/ClassFeedGroupByTime';
import { IFeedGroup, ISubtractedDate } from '@/utils/feeds/feed.helper';
import { IAssignment } from '../../(assignment)/types/assignment.type';
import assignmentService from '../../(assignment)/service/assignment.service';
import ClassworkList from '../../(classwork)/components/ClassworkList';
import { USER_ROLES } from '@/utils/constants/roles';
import { ILearningMaterial } from '../../(learning-material)/types/learningMaterial.type';
import learningMaterialService from '../../(learning-material)/service/learningMaterial.service';

type TopicFilteringAction =
    | 'newest'
    | 'oldest'
    | 'title-asc'
    | 'title-desc'
    | 'recently-studied'
    | 'flashcards-due-today';

export default function ClassDashboard() {
    const { classId } = useClassBased();
    const router = useRouter();
    const t = useTranslations('home.contentLibrary');
    const tTopic = useTranslations('topic');
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<TopicFilteringAction>('newest');
    const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

    const {
        data: myClass,
        error: myClassError,
        loading: myClassLoading,
    } = useFetch<IClass>(() => studentClassService.getClassById(classId));

    const [topicsFiltered, setTopicsFiltered] = useState<ITopic[]>();

    // topics
    const { fetchTopics, showTopicDetails } = useTopics({
        mode: 'class-based',
        role: 'student',
        classId,
    });
    const { topics, topicsError, topicsLoading } = fetchTopics;

    const {
        isOpen: isTopicDetailsModalOpen,
        setIsOpen: setIsTopicDetailsModalOpen,
        open: handleTopicDetailsModalOpen,
        selectingTopic,
    } = showTopicDetails;

    // feeds
    const {
        data: feeds,
        error: feedsError,
        loading: feedsLoading,
    } = useFetch<IClassFeed[]>(() => classFeedService.getFeedsInClass({ classId }));

    // assignments
    const {
        data: assignments,
        setData: setAssignments,
        loading: assignmentsLoading,
        error: assignmentsError,
    } = useFetch<IAssignment[]>(() => assignmentService.getAssignmentsForClass({ classId }));

    //learningMaterials
    const {
        data: learningMaterials,
        setData: setLearningMaterials,
        loading: learningMaterialsLoading,
        error: learningMaterialsError,
    } = useFetch<ILearningMaterial[]>(() => learningMaterialService.getLearningMaterialsForClass({ classId }));

    const isLoading = assignmentsLoading || learningMaterialsLoading;

    const classworkContent = useMemo(() => {
        if (!myClass || !topics) return null;
        const value = topics.map(({ topicId, name }) => ({ topicId, name }));
        return (
            <>
                {assignmentsError ? <div>Error: {assignmentsError}</div> : null}
                {learningMaterialsError ? <div>Error: {learningMaterialsError}</div> : null}
                {isLoading ? <LoadingPage /> : null}
                {assignments && learningMaterials ? (
                    <ClassworkList
                        role={USER_ROLES.USER}
                        myClass={myClass}
                        topics={value}
                        assignments={assignments}
                        setAssignments={setAssignments}
                        learningMaterials={learningMaterials}
                        setLearningMaterials={setLearningMaterials}
                    />
                ) : null}
                {/* {learningMaterials ? (
                    <ClassworkList
                        role={USER_ROLES.USER}
                        myClass={myClass}
                        topics={value}
                        assignments={assignments}
                        setAssignments={setAssignments}
                    />
                ) : null} */}
            </>
        );
    }, [myClass, topics, assignments, assignmentsError, isLoading, learningMaterials, learningMaterialsError]);

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

    function handleOnClickViewMindmap(topicId: number) {
        //Q&A: Find suit logic for check class-based mode and check class ID pass
        if (Number.isFinite(classId)) {
            router.push(ROUTES.CLASS_MINDMAP_VIEW(classId, topicId));
        } else {
            router.push(ROUTES.MINDMAP_VIEW(topicId));
        }
    }

    function handleOnClickStartQuiz(topicId: number) {
        router.push(ROUTES.QUIZ_START(topicId));
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

    const handleViewMyProgress = () => {
        setIsStudentProfileModalOpen(true);
    };

    const mainActionButtons = (
        <div className="flex flex-col gap-4">
            <Button className="bg-background text-foreground" onClick={handleViewMyProgress}>
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>{tClass('viewMyProgress')}</span>
            </Button>
        </div>
    );

    const renderFeedCard = (feedGroup: IFeedGroup) => {
        const { feed, group } = feedGroup;
        return <ClassFeedCard key={feed.classFeedId} role="student" feed={feed} group={group} />;
    };

    const feedContent = (
        <>
            {feedsError ? <div>Error: {feedsError}</div> : null}
            {feedsLoading ? <LoadingPage /> : null}
            {feeds ? (
                <div className="mt-5">
                    <div className="w-full h-full">
                        <ClassFeedGroupedByTime feeds={feeds} renderFeedCard={renderFeedCard} />
                    </div>
                </div>
            ) : null}
        </>
    );

    const menuContentInCard = (topic: ITopic) => {
        const { topicId } = topic;
        return (
            <DropdownMenuContent align="start" side="top">
                {/* Flashard section */}
                <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                        <Layers className="mr-2 h-4 w-4" />
                        <span>Flashcard</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
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
                        <DropdownMenuItem onSelect={() => handleOnClickViewMindmap(topicId)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>{tCommon('actions.view')}</span>
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
                    </DropdownMenuSubContent>
                </DropdownMenuSub>
            </DropdownMenuContent>
        );
    };

    const cardFooter = (topic: ITopic) => (
        <div className="flex flex-col text-xs text-foreground justify-between">
            <div className="flex flex-row justify-between items-center">
                <div></div>
                <div>
                    <ShowIf when={topic.hasProgress != undefined && topic.hasProgress}>
                        <span className="font-bold">{topic.flashcardCounts?.review}</span> flashcards due today
                    </ShowIf>

                    <ShowIf when={topic.hasProgress != undefined && !topic.hasProgress}>
                        <div>Not Studied Yet</div>
                    </ShowIf>
                </div>
            </div>
        </div>
    );

    const topicContent = (
        <>
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

            <TopicDetailsModal
                isOpen={isTopicDetailsModalOpen}
                setIsOpen={setIsTopicDetailsModalOpen}
                topic={selectingTopic}
            />
        </>
    );

    return (
        <>
            <LearningSpace
                mode="class-based"
                myClass={myClass}
                mainActionButtons={mainActionButtons}
                feedContent={feedContent}
                topicContent={topicContent}
                classworkContent={classworkContent}
            />
            <StudentProfileModal
                isOpen={isStudentProfileModalOpen}
                onClose={() => setIsStudentProfileModalOpen(false)}
                classId={classId}
            />
        </>
    );
}
