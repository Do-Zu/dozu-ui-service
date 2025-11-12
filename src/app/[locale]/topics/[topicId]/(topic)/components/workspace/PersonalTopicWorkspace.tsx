import { useState } from 'react';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Maximize, Minimize } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TabConfig, TopicWorkspaceTabValue } from '../../types';
import { METHOD_LEARNING } from '@/utils/constants/method';
import OverViewTab from '../tabs/OverViewTab';
import MindMapTab from '../tabs/MindMapTab';
import FlashCardTab from '../tabs/FlashCardTab';
import QuizTab from '../tabs/QuizTab';
import LearningMaterial from '../material/LearningMaterial';
import NoteTab from '../tabs/NoteTab';

const TOPIC_WORKSPACE_TABS: TabConfig[] = [
    { value: 'overview', label: 'Overview', component: OverViewTab },
    { value: METHOD_LEARNING.MINDMAP, label: 'Mindmap', component: MindMapTab },
    { value: METHOD_LEARNING.FLASHCARD, label: 'Flashcards', component: FlashCardTab },
    { value: METHOD_LEARNING.QUIZ, label: 'Quiz', component: QuizTab },
    { value: 'note', label: 'Note', component: NoteTab },
];

export default function PersonalTopicWorkspace() {
    const { topic, isPdfViewerFullscreen, setTab } = useTopicWorkspace();

    const [isFullscreen, setIsFullscreen] = useState(false);

    function handleScreenModeToggle() {
        setIsFullscreen((prev) => !prev);
    }

    //... flashcard content

    function handleTabChange(value: string) {
        setTab(value as TopicWorkspaceTabValue);
    }

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
