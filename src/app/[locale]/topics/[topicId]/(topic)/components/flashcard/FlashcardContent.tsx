'use client';

import { Edit, Gamepad2, GraduationCap, LayoutGrid, Settings } from 'lucide-react';
import { useMemo, useState } from 'react';
import BrowseFlashcards from './browse/BrowseFlashcards';
import LearningFlashcards from './learning/LearningFlashcards';
import { useRequireFlashcards } from '../../context/useRequireFlashcardContent';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';
import flashcardUtils from '../../utils/flashcard.utils';
import FlashcardSettings from './settings/FlashcardSettings';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import EditingFlashcards from './edit/EditingFlashcards';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GamesContent from '../games/GamesContent';
import FlashcardsEmptyState from './browse/FlashcardsEmptyState';
import { isEmpty } from '@/utils';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';

export type FlashcardTab = 'browse' | 'learning' | 'edit' | 'settings' | 'games';
export enum FlashcardTabEnum {
    BROWSE = 'browse',
    LEARNING = 'learning',
    EDIT = 'edit',
    SETTINGS = 'settings',
    GAMES = 'games',
}

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
    const selectableItems: FlashcardTab[] = useMemo(() => {
        if (mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER)
            return ['browse', 'learning', 'edit', 'settings', 'games'];
        return ['browse', 'learning', 'settings', 'games'];
    }, [mode, role]);

    const itemIcons: { item: FlashcardTab; icon: JSX.Element }[] = [
        { item: 'browse', icon: <LayoutGrid className="mr-2 h-4 w-4" /> },
        { item: 'learning', icon: <GraduationCap className="mr-2 h-4 w-4" /> },
        { item: 'edit', icon: <Edit className="mr-2 h-4 w-4" /> },
        { item: 'settings', icon: <Settings className="mr-2 h-4 w-4" /> },
        { item: 'games', icon: <Gamepad2 className="mr-2 h-4 w-4" /> },
    ];

    const { flashcardTab, setFlashcardTab } = useTopicWorkspace();

    function handleModeSelect(mode: string) {
        if (!selectableItems.includes(mode as FlashcardTab)) return;
        setFlashcardTab(mode as FlashcardTab);
    }

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs value={flashcardTab} onValueChange={handleModeSelect} className="w-full flex justify-center">
                <TabsList className="w-[70%] grid grid-cols-5 rounded-2xl p-1">
                    {selectableItems.map((item) => (
                        <TabsTrigger
                            key={item}
                            value={item}
                            className="flex items-center justify-center gap-2 rounded-2xl"
                        >
                            {itemIcons.find((e) => e.item === item)?.icon}
                            <span className="whitespace-nowrap">{flashcardUtils.getDisplayModeName(item)}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex-1 min-h-0">
                {flashcardTab === FlashcardTabEnum.BROWSE && selectableItems.includes(FlashcardTabEnum.BROWSE) ? (
                    <BrowseFlashcards />
                ) : null}

                {flashcardTab === FlashcardTabEnum.LEARNING && selectableItems.includes(FlashcardTabEnum.LEARNING) ? (
                    <UserTrackingProvider
                        autoStartTracking={true}
                        enableAutoSend={true} // Disable auto-send to prevent duplicate API calls - handleSaveTrackingProgressLearning() handles this
                        minSessionTime={5000} // 5 seconds minimum session
                        apiEndpoint="/tracking/active-learning" // Behavioral tracking
                        learningApiEndpoint="/progress/learning-tracking" // Learning progress tracking
                    >
                        <LearningFlashcards />
                    </UserTrackingProvider>
                ) : null}

                {flashcardTab === FlashcardTabEnum.EDIT && selectableItems.includes(FlashcardTabEnum.EDIT) && (
                    <div className="h-full">
                        <EditingFlashcards />
                    </div>
                )}

                {flashcardTab === FlashcardTabEnum.SETTINGS && selectableItems.includes(FlashcardTabEnum.SETTINGS) ? (
                    <div className="h-full overflow-y-scroll">
                        <FlashcardSettings />
                    </div>
                ) : null}

                {flashcardTab === FlashcardTabEnum.GAMES && selectableItems.includes(FlashcardTabEnum.GAMES) ? (
                    mode === MODE_ACCESS_PAGE_ROLE.personal ? (
                        <GamesContent mode={MODE_ACCESS_PAGE_ROLE.personal} />
                    ) : (
                        <GamesContent mode={MODE_ACCESS_PAGE_ROLE.classBased} role={role!} />
                    )
                ) : null}
            </div>
        </div>
    );
}
