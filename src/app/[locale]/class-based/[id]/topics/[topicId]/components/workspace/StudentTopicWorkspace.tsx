import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize, Minimize } from 'lucide-react';
import { useEffect, useState } from 'react';
import LearningMaterial from '../../../../../../topics/[topicId]/(topic)/components/material/LearningMaterial';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import TopicOverview from '../../../../../../topics/[topicId]/(topic)/components/overview/TopicOverview';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import useFetch from '@/hooks/useFetch';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import topicService from '@/services/topic/topic.service';
import flashcardContentService, {
    IFlashcardContent,
} from '../../../../../../topics/[topicId]/(topic)/service/flashcardContent.service';
import LoadingPage from '@/app/loading';
import { useTopicWorkspace } from '../../../../../../topics/[topicId]/(topic)/context/TopicWorkspaceContext';
import FlashcardContent from '../../../../../../topics/[topicId]/(topic)/components/flashcard/FlashcardContent';
import flashcardUtils from '../../../../../../topics/[topicId]/(topic)/utils/flashcard.utils';
import { UserRoleEnum } from '@/utils/constants/roles';

interface Props {
    topicId: number;
}

export default function StudentTopicWorkspace({ topicId }: Props) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    function handleScreenModeToogle() {
        setIsFullscreen((prev) => !prev);
    }

    const {
        topic,
        flashcards,
        learningFlashcards,
        setTopic,
        setFlashcards,
        setLearningFlashcards,
        ankiSettings,
        setAnkiSettings,
    } = useTopicWorkspace();

    const {
        data: topicContent,
        loading: topicContentLoading,
        error: topicContentError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    useEffect(() => {
        setTopic(topicContent);
    }, [topicContent]);

    //... flashcard content
    const [shouldFetchFlashcardContent, setShouldFetchFlashcardContent] = useState(false);
    const {
        data: flashcardContent,
        loading: flashcardContentLoading,
        error: flashcardContentError,
    } = useFetch<IFlashcardContent>(() => flashcardContentService.getFlashcardContent({ topicId }), {
        shouldRun: shouldFetchFlashcardContent,
    });

    useEffect(() => {
        if (flashcardContent) {
            setFlashcards(flashcardContent.flashcards);
            setLearningFlashcards(flashcardContent.learningFlashcards);
            setAnkiSettings(flashcardContent.ankiSettings);
        }
    }, [flashcardContent]);

    function handleTabChange(value: string) {
        if (value === 'flashcards' && !shouldFetchFlashcardContent) {
            setShouldFetchFlashcardContent(true);
        }
    }

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

    return (
        <div className="relative w-full h-[90vh] border rounded-lg overflow-hidden bg-background">
            <div className="absolute top-4 right-4 z-50">
                <Button variant="ghost" size="icon" onClick={handleScreenModeToogle}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="sr-only">Toggle Fullscreen</span>
                </Button>
            </div>

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={25} className={isFullscreen ? 'hidden' : ''}>
                    <div className="flex flex-col h-full p-4">
                        <LearningMaterial topicId={topicId} />
                    </div>
                </ResizablePanel>

                <ResizableHandle className={isFullscreen ? 'hidden' : ''} />

                <ResizablePanel defaultSize={75} minSize={25}>
                    <div className="flex flex-col h-full">
                        <Tabs
                            defaultValue="overview"
                            className="flex flex-col flex-1 h-full"
                            onValueChange={handleTabChange}
                        >
                            {!isFullscreen && (
                                <div className="p-6 pb-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">{topic?.name ?? ''}</h3>
                                    </div>
                                </div>
                            )}

                            <div className={cn('flex-1 h-full', !isFullscreen ? 'px-6' : '')}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="h-full p-4 border rounded-md">
                                    {topicContentError ? <div>{topicContentError}</div> : null}
                                    {topicContentLoading ? <LoadingPage /> : null}
                                    {topic ? (
                                        <TopicOverview
                                            mode={MODE_ACCESS_PAGE_ROLE.classBased}
                                            role={UserRoleEnum.USER}
                                        />
                                    ) : null}
                                </TabsContent>
                                <TabsContent value="mindmap" className="h-full p-4 border rounded-md">
                                    <p>Mindmap content goes here.</p>
                                </TabsContent>
                                <TabsContent value="flashcards" className="h-full p-4 border rounded-md">
                                    <>
                                        {topicContentError || flashcardContentError ? (
                                            <div className="p-8">{topicContentError || flashcardContentError}</div>
                                        ) : null}
                                        {topicContentLoading || flashcardContentLoading ? <LoadingPage /> : null}
                                        {topic &&
                                        flashcardContent &&
                                        flashcards &&
                                        learningFlashcards &&
                                        ankiSettings ? (
                                            <FlashcardContent
                                                mode={MODE_ACCESS_PAGE_ROLE.classBased}
                                                role={UserRoleEnum.USER}
                                            />
                                        ) : null}
                                    </>
                                </TabsContent>
                                <TabsContent value="quiz" className="h-full p-4 border rounded-md">
                                    <p>Quiz content goes here.</p>
                                </TabsContent>
                            </div>
                        </Tabs>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
