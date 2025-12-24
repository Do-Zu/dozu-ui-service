import { useEffect, useState } from 'react';
import useFetch from '@/hooks/useFetch';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize, Minimize } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopicWorkspaceTabValue } from '../../types';
import LearningMaterial from '../material/LearningMaterial';
import { TOPIC_WORKSPACE_TABS } from '../../layout/config.layout';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import LoadingPage from '@/app/loading';
import DataStatus from '@/components/errors/DataStatus';
import topicService from '@/services/topic/topic.service';
import { isEmpty } from '@/utils';
import { cn } from '@/lib/utils';
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

export default function TopicWorkspace() {
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

    function handleScreenModeToggle() {
        setIsLearningContentFullscreen((prev) => !prev);
    }

    function handleTabChange(value: string) {
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
        <div className="relative w-full h-[100vh] border rounded-lg overflow-hidden bg-background">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} className={isLearningContentFullscreen ? 'hidden' : ''} minSize={35}>
                    <div className="flex flex-col h-full p-4">
                        <LearningMaterial />
                    </div>
                </ResizablePanel>

                <ResizableHandle
                    withHandle
                    className={isLearningContentFullscreen || isPdfViewerFullscreen ? 'hidden' : ''}
                />

                <ResizablePanel defaultSize={65} minSize={35} className={isPdfViewerFullscreen ? 'hidden' : ''}>
                    <div className="flex flex-col h-full">
                        <Tabs value={tab} className="flex flex-col flex-1 h-full" onValueChange={handleTabChange}>
                            <div className="flex items-center justify-between mt-6 w-full px-6">
                                <div className="flex-1 flex justify-center">
                                    <TabsList className="grid grid-cols-5 w-[95%] rounded-2xl">
                                        {TOPIC_WORKSPACE_TABS.map((t) => (
                                            <TabsTrigger
                                                className="rounded-2xl flex items-center justify-center gap-2 text-sm"
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {tab === t.value ? <ActiveDot isActive={true} /> : null}
                                                {t.icon}
                                                <span className="whitespace-nowrap">{t.label}</span>
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </div>

                                <div>
                                    <Button variant="ghost" size="icon" onClick={handleScreenModeToggle}>
                                        {isLearningContentFullscreen ? (
                                            <Minimize className="h-4 w-4" />
                                        ) : (
                                            <Maximize className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Toggle Fullscreen</span>
                                    </Button>
                                </div>
                            </div>

                            <div className={cn('flex-1 h-full px-6 py-3')}>
                                {TOPIC_WORKSPACE_TABS.map((t) => (
                                    <TabsContent key={t.value} value={t.value} className="h-full">
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
