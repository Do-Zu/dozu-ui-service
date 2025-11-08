'use client';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, ChevronDown, Edit, GraduationCap, LayoutGrid, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import BrowseFlashcard from './browse/BrowseFlashcard';
import LearningFlashcard from './learning/LearningFlashcard';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';
import flashcardUtils from '../../utils/flashcard.utils';
import FlashcardSettings from './settings/FlashcardSettings';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import EditingFlashcard from './edit/EditingFlashcard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type FlashcardLearningMode = 'browse' | 'learning' | 'edit' | 'settings';

interface PersonalProps {
    mode: MODE_ACCESS_PAGE_ROLE.personal;
    role?: undefined;
}

interface StudentProps {
    mode: MODE_ACCESS_PAGE_ROLE.classBased;
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    mode: MODE_ACCESS_PAGE_ROLE.classBased;
    role: UserRoleEnum.TEACHER;
}

type Props = PersonalProps | StudentProps | TeacherProps;

export default function FlashcardContent({ mode, role }: Props) {
    const selectableItems: FlashcardLearningMode[] = useMemo(() => {
        if (mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER)
            return ['browse', 'learning', 'edit', 'settings'];
        return ['browse', 'learning', 'settings'];
    }, [mode, role]);
    const itemIcons: { item: FlashcardLearningMode; icon: JSX.Element }[] = [
        { item: 'browse', icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
        { item: 'learning', icon: <GraduationCap className="mr-2 h-4 w-4" /> },
        { item: 'edit', icon: <Edit className="mr-2 h-4 w-4" /> },
        { item: 'settings', icon: <Settings className="mr-2 h-4 w-4" /> },
    ];

    const [flashcardMode, setFlashcardMode] = useState<FlashcardLearningMode>('browse');

    function handleModeSelect(mode: string) {
        if (!selectableItems.includes(mode as FlashcardLearningMode)) return;
        setFlashcardMode(mode as FlashcardLearningMode);
    }

    return (
        <div className="w-full h-[90%] flex flex-col">
            <Tabs value={flashcardMode} onValueChange={handleModeSelect} className="w-full flex justify-center">
                <TabsList className="w-[70%] grid grid-cols-4 rounded-lg bg-muted/30 p-1">
                    {selectableItems.map((item) => (
                        <TabsTrigger
                            key={item}
                            value={item}
                            className="flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md"
                        >
                            {itemIcons.find((e) => e.item === item)?.icon}
                            <span className="whitespace-nowrap">{flashcardUtils.getDisplayModeName(item)}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex-1 min-h-0">
                {flashcardMode === 'browse' && selectableItems.includes('browse') ? <BrowseFlashcard /> : null}

                {flashcardMode === 'learning' && selectableItems.includes('learning') ? (
                    <UserTrackingProvider
                        autoStartTracking={true}
                        enableAutoSend={true} // Disable auto-send to prevent duplicate API calls - handleSaveTrackingProgressLearning() handles this
                        minSessionTime={5000} // 5 seconds minimum session
                        apiEndpoint="/tracking/active-learning" // Behavioral tracking
                        learningApiEndpoint="/progress/learning-tracking" // Learning progress tracking
                    >
                        <LearningFlashcard />
                    </UserTrackingProvider>
                ) : null}

                {flashcardMode === 'edit' && selectableItems.includes('edit') && (
                    <div className="h-full overflow-y-scroll p-8">
                        <EditingFlashcard />
                    </div>
                )}

                {flashcardMode === 'settings' && selectableItems.includes('settings') ? (
                    <div className="h-full overflow-y-scroll">
                        <FlashcardSettings />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
