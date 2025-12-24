'use client';

import { LayoutGrid, History as HistoryIcon, Edit as EditIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMemo, useEffect } from 'react';

import { QuizWorkspaceProvider, useQuizWorkspace } from '../quiz/context/QuizWorkspaceContext';
import { QuizMode } from '../../hooks/useQuizWorkspace';

import QuizGenerateTab from '../quiz/quiz-generate/QuizGenerateTab';
import QuizHistoryTab from '../quiz/quiz-history/QuizHistoryTab';
import QuizEditTab from '../quiz/quiz-edit/QuizEditTab';

import QuizDoingPanel from '../quiz/quiz-generate/quiz-doing/QuizDoingPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import { UserRoleEnum } from '@/utils/constants/roles';

function QuizTabContent() {
    const [learningMode] = useLocalStorage<ILearningMode>('learningMode', MODE_ACCESS_PAGE_ROLE.personal);
    const { isStudent, isTeacher } = useRoleChecker();

    const role = isTeacher ? UserRoleEnum.TEACHER : isStudent ? UserRoleEnum.USER : UserRoleEnum.ADMIN;

    const availableQuizTabs: QuizMode[] = useMemo(() => {
        // Teacher & personal user → full permission (generate + history + edit)
        if (learningMode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER) {
            return ['generate', 'history', 'edit'];
        }

        // Student user → cannot see Edit
        if (role === UserRoleEnum.USER) {
            return ['generate', 'history'];
        }

        return ['generate', 'history', 'edit'];
    }, [learningMode, role]);

    const { quizMode, setQuizMode, doingMode } = useQuizWorkspace();

    useEffect(() => {
        if (!availableQuizTabs.includes(quizMode)) {
            setQuizMode(availableQuizTabs[0]);
        }
    }, [availableQuizTabs, quizMode]);

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
            <Tabs value={quizMode} onValueChange={handleModeChange} className="w-full flex justify-center mb-4">
                <TabsList
                    className="w-[70%] rounded-2xl p-1"
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${availableQuizTabs.length}, minmax(0, 1fr))`,
                    }}
                >
                    {availableQuizTabs.includes('generate') && (
                        <TabsTrigger value="generate" className="flex items-center justify-center gap-2 rounded-2xl">
                            <LayoutGrid className="h-4 w-4" />
                            <span>Generate Quiz</span>
                        </TabsTrigger>
                    )}

                    {availableQuizTabs.includes('history') && (
                        <TabsTrigger value="history" className="flex items-center justify-center gap-2 rounded-2xl">
                            <HistoryIcon className="h-4 w-4" />
                            <span>History</span>
                        </TabsTrigger>
                    )}

                    {availableQuizTabs.includes('edit') && (
                        <TabsTrigger value="edit" className="flex items-center justify-center gap-2 rounded-2xl">
                            <EditIcon className="h-4 w-4" />
                            <span>Edit Questions</span>
                        </TabsTrigger>
                    )}
                </TabsList>
            </Tabs>

            {/* CONTENT */}
            <div className="flex-1 min-h-0 px-6 pb-4">
                {quizMode === 'generate' && <QuizGenerateTab />}
                {quizMode === 'history' && <QuizHistoryTab />}
                {quizMode === 'edit' && availableQuizTabs.includes('edit') && <QuizEditTab />}
            </div>
        </div>
    );
}

export default function QuizTab() {
    return (
        <QuizWorkspaceProvider>
            <div className="h-full">
                <QuizTabContent />
            </div>
        </QuizWorkspaceProvider>
    );
}
