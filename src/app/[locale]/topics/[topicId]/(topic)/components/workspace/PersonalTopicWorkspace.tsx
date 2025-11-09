import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize, Minimize } from 'lucide-react';
import { useEffect, useState } from 'react';
import LearningMaterial from '../material/LearningMaterial';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import TopicOverview from '../overview/TopicOverview';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import useFetch from '@/hooks/useFetch';
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import topicService from '@/services/topic/topic.service';
import flashcardContentService, { IFlashcardContent } from '../../service/flashcardContent.service';
import LoadingPage from '@/app/loading';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import FlashcardContent from '../flashcard/FlashcardContent';
import flashcardUtils from '../../utils/flashcard.utils';

export default function PersonalTopicWorkspace() {
    const { topicId } = useTopicWorkspace();

    const [isFullscreen, setIsFullscreen] = useState(false);

    function handleScreenModeToggle() {
        setIsFullscreen((prev) => !prev);
    }

    const { isPdfViewerFullscreen } = useTopicWorkspace();

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
            <div className={cn('absolute top-4 right-4 z-50', isPdfViewerFullscreen ? 'hidden' : '')}>
                <Button variant="ghost" size="icon" onClick={handleScreenModeToggle}>
                    {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                    <span className="sr-only">Toggle Fullscreen</span>
                </Button>
            </div>

            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={35} className={isFullscreen ? 'hidden' : ''} minSize={35}>
                    <div className="flex flex-col h-full p-4">
                        <LearningMaterial />
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className={isFullscreen || isPdfViewerFullscreen ? 'hidden' : ''} />

                <ResizablePanel defaultSize={65} minSize={35} className={isPdfViewerFullscreen ? 'hidden' : ''}>
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

                            <div className={cn('flex-1 h-full', isFullscreen ? 'px-6 py-3' : 'px-3')}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                                </TabsList>
                                <TabsContent value="overview" className="h-full p-4 border rounded-md">
                                    {topicContentError ? <div>{topicContentError}</div> : null}
                                    {topicContentLoading ? <LoadingPage /> : null}
                                    {topic ? <TopicOverview mode={MODE_ACCESS_PAGE_ROLE.personal} /> : null}
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
                                            <FlashcardContent mode={MODE_ACCESS_PAGE_ROLE.personal} />
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
