'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronsUpDown, StickyNote, Maximize, Minimize } from 'lucide-react';
import { cn } from '@/lib/utils';
import FlashcardContent from './components/flashcard/FlashcardContent';
import TopicOverview from './components/overview/TopicOverview';

export default function TopicPage() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    function handleScreenModeToogle() {
        setIsFullscreen((prev) => !prev);
    }

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
                        <h2 className="text-lg font-semibold mb-4">Learning Materials</h2>
                    </div>
                </ResizablePanel>

                <ResizableHandle className={isFullscreen ? 'hidden' : ''}/>

                <ResizablePanel defaultSize={75} minSize={25}>
                    <div className="flex flex-col h-full">
                        <Tabs defaultValue="overview" className="flex flex-col flex-1">
                            {!isFullscreen && (
                                <div className="p-6 pb-2">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold">Topic content</h3>
                                    </div>

                                    <TabsList className="grid w-full grid-cols-4">
                                        <TabsTrigger value="overview">Overview</TabsTrigger>
                                        <TabsTrigger value="mindmap">Mindmap</TabsTrigger>
                                        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                                        <TabsTrigger value="quiz">Quiz</TabsTrigger>
                                    </TabsList>
                                </div>
                            )}

                            <div className={cn('flex-1', !isFullscreen ? 'px-6' : '')}>
                                <TabsContent value="overview" className="h-full p-4 border rounded-md">
                                    <TopicOverview />
                                </TabsContent>
                                <TabsContent value="mindmap" className="h-full p-4 border rounded-md">
                                    <p>Mindmap content goes here.</p>
                                </TabsContent>
                                <TabsContent value="flashcards" className="h-full p-4 border rounded-md">
                                    <FlashcardContent />
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
