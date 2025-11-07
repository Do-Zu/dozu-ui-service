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

    function handleModeSelect(mode: FlashcardLearningMode) {
        setFlashcardMode(mode);
    }

    return (
        <div className="w-full h-[90%]">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                        <span>{flashcardUtils.getDisplayModeName(flashcardMode)}</span>
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    {selectableItems.map((item) => (
                        <DropdownMenuItem onSelect={() => handleModeSelect(item)}>
                            {itemIcons.find((e) => e.item === item)?.icon}
                            <span>{flashcardUtils.getDisplayModeName(item)}</span>
                            {flashcardMode === item && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

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
    );
}
