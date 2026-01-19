import { useEffect, useMemo } from 'react';
import useFetch from '@/hooks/useFetch';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize, Minimize } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicWorkspaceTabValue } from '../../types';
import LearningMaterial from '../material/LearningMaterial';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import topicService from '@/services/topic/topic.service';
import { isEmpty } from '@/utils';
import flashcardUtils from '../../utils/flashcard.utils';
import { ActiveDot } from '../ui/ActiveDot';
import { useDispatch } from 'react-redux';
import {
    clearHiddenNodes,
    clearNodeSelection,
    clearSelectedNodeData,
    closeSheet,
    turnOffMultiSelectMode,
} from '@/stores/features/mindmap/selectedNodeSlice';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { UserRoleEnum } from '@/utils/constants/roles';
import topicWorkspaceUtils from '../../utils/topicWorkspace.utils';
import Pomodoro from '@/components/pomodoro/Pomodoro';

export default function TopicWorkspace(): JSX.Element {
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isStudent, isTeacher } = useRoleChecker();

    const tabs = useMemo(() => {
        const getRole = () => {
            if (isStudent) return UserRoleEnum.USER;
            if (isTeacher) return UserRoleEnum.TEACHER;
            return UserRoleEnum.ADMIN;
        };
        const role = getRole();
        return topicWorkspaceUtils.getWorkspaceTabs(learningMode ?? MODE_ACCESS_PAGE_ROLE.personal, role);
    }, [learningMode, isStudent, isTeacher]);

    const {
        topic,
        topicId,
        setTopic,
        isPdfViewerFullscreen,
        setTab,
        tab,
        flashcards,
        learningFlashcards,
        isLearningContentFullscreen,
        setIsLearningContentFullscreen,
    } = useTopicWorkspace();

    function handleScreenModeToggle(): void {
        setIsLearningContentFullscreen((prev) => !prev);
    }

    function handleTabChange(value: string): void {
        setTab(value as TopicWorkspaceTabValue);
    }

    const {
        data: topicContent,
        loading: topicContentLoading,
        error: topicContentError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(clearNodeSelection());
            dispatch(turnOffMultiSelectMode());
            dispatch(closeSheet());
            dispatch(clearSelectedNodeData());
            dispatch(clearHiddenNodes());
        };
    }, []);

    useEffect(() => {
        setTopic(topicContent);
    }, [topicContent]);

    useEffect(() => {
        if (!flashcards || !learningFlashcards) return;
        // recalculate flashcard counts
        setTopic((prev) => {
            if (!prev) return prev;
            const updatedFlashcardCounts = flashcardUtils.recalculateFlashcardCounts({
                flashcards,
                learningFlashcards,
            });
            return { ...prev, flashcardCounts: updatedFlashcardCounts };
        });
    }, [flashcards, learningFlashcards]);

    if (topicContentLoading) return <LoadingPage />;

    if (topicContentError) return <DataStatus variant="error" title={topicContentError} />;

    if (isEmpty(topic)) return <DataStatus variant="empty" />;

    return (
        <div className="h-screen w-full overflow-hidden rounded-lg border bg-background">
            <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
                <ResizablePanel defaultSize={35} minSize={35} className={isLearningContentFullscreen ? 'hidden' : ''}>
                    <div className="flex h-full flex-col p-4">
                        <LearningMaterial />
                    </div>
                </ResizablePanel>

                <ResizableHandle
                    withHandle
                    className={isLearningContentFullscreen || isPdfViewerFullscreen ? 'hidden' : ''}
                />

                <ResizablePanel defaultSize={65} minSize={35} className={isPdfViewerFullscreen ? 'hidden' : ''}>
                    <div className="flex h-full min-h-0 flex-col overflow-hidden">
                        <Tabs value={tab} onValueChange={handleTabChange} className="flex min-h-0 flex-1 flex-col">
                            <div className="flex shrink-0 items-center justify-between px-6 py-4">
                                <div className="flex flex-1 justify-center">
                                    <Pomodoro position="top-center" />
                                    <TabsList
                                        className="w-4/5 rounded-2xl"
                                        style={{
                                            display: 'grid',
                                            gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`,
                                        }}
                                    >
                                        {tabs.map((t) => (
                                            <TabsTrigger
                                                key={t.value}
                                                value={t.value}
                                                className="flex items-center gap-2 rounded-2xl text-sm"
                                            >
                                                {tab === t.value && <ActiveDot isActive />}
                                                {t.icon}
                                                <span className="whitespace-nowrap">{t.label}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <Button variant="ghost" size="icon" onClick={handleScreenModeToggle}>
                                    {isLearningContentFullscreen ? (
                                        <Minimize className="size-4" />
                                    ) : (
                                        <Maximize className="size-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
                                {tabs.map((t) => (
                                    <TabsContent
                                        key={t.value}
                                        value={t.value}
                                        className="m-0 h-full focus-visible:ring-0"
                                    >
                                        <t.component />
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
