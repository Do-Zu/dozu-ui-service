'use client';

import { LayoutGrid, History as HistoryIcon, Edit as EditIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { QuizWorkspaceProvider, useQuizWorkspace } from '../quiz/context/QuizWorkspaceContext';
import { QuizMode } from '../../hooks/useQuizWorkspace';

import QuizGenerateTab from '../quiz/quiz-generate/QuizGenerateTab';
import QuizHistoryTab from '../quiz/quiz-history/QuizHistoryTab';
import QuizEditTab from '../quiz/quiz-edit/QuizEditTab';

import QuizDoingPanel from '../quiz/quiz-generate/quiz-doing/QuizDoingPanel';

function QuizTabContent() {
    const {
        quizMode,
        setQuizMode,
        doingMode,        
    } = useQuizWorkspace();

    if (doingMode) {
        return (
            <div className="relative w-full h-full flex flex-col px-4">
                <QuizDoingPanel />
            </div>
        );
    }

    const handleModeChange = (value: string) => {
        setQuizMode(value as QuizMode);
    };

    return (
        <div className="relative w-full h-full flex flex-col min-h-0">

            {/* TABS */}
            <Tabs
                value={quizMode}
                onValueChange={handleModeChange}
                className="w-full flex justify-center mb-4"
            >
                <TabsList className="w-[70%] grid grid-cols-3 rounded-2xl p-1">
                    <TabsTrigger
                        value="generate"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="whitespace-nowrap">Generate Quiz</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="history"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <HistoryIcon className="h-4 w-4" />
                        <span className="whitespace-nowrap">History</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="edit"
                        className="flex items-center justify-center gap-2 rounded-2xl"
                    >
                        <EditIcon className="h-4 w-4" />
                        <span className="whitespace-nowrap">Edit Questions</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>

            {/* CONTENT */}
            <div className="flex-1 min-h-0 px-6 pb-4">
                {quizMode === 'generate' && <QuizGenerateTab />}
                {quizMode === 'history' && <QuizHistoryTab />}
                {quizMode === 'edit' && <QuizEditTab />}
            </div>
        </div>
    );
}

export default function QuizTab() {
    return (
        <QuizWorkspaceProvider>
            <QuizTabContent />
        </QuizWorkspaceProvider>
    );
}
