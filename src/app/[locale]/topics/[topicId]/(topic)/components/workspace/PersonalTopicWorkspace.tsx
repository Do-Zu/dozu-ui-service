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

export default function PersonalTopicWorkspace() {
    const { topic, topicId, setTopic, isPdfViewerFullscreen, setTab, tab } = useTopicWorkspace();

    const [isFullscreen, setIsFullscreen] = useState(false);

    function handleScreenModeToggle() {
        setIsFullscreen((prev) => !prev);
    }

    function handleTabChange(value: string) {
        setTab(value as TopicWorkspaceTabValue);
    }

    const {
        data: topicContent,
        loading: topicContentLoading,
        error: topicContentError,
    } = useFetch<ITopic>(() => topicService.getTopicById(topicId));

    useEffect(() => {
        setTopic(topicContent);
    }, [topicContent]);

    if (topicContentLoading) return <LoadingPage />;

    if (topicContentError) return <DataStatus variant="error" title={topicContentError} />;

    if (isEmpty(topic)) return <DataStatus variant="empty" />;

    return (
        <div className="relative w-full h-[90vh] border rounded-lg overflow-hidden bg-background m-2">
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
                        <Tabs value={tab} className="flex flex-col flex-1 h-full" onValueChange={handleTabChange}>
                            {!isFullscreen && (
                                <div className="p-6 pb-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">{topic?.name ?? ''}</h3>
                                    </div>
                                </div>
                            )}

                            <div className={cn('flex-1 h-full', isFullscreen ? 'px-6 py-3' : 'px-3')}>
                                <TabsList className="grid w-full grid-cols-5">
                                    {TOPIC_WORKSPACE_TABS.map((t) => (
                                        <TabsTrigger key={t.value} value={t.value}>
                                            {t.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>

                                {TOPIC_WORKSPACE_TABS.map((t) => (
                                    <TabsContent key={t.value} value={t.value} className="h-full p-4 border rounded-md">
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
