'use client';

import { Edit, Gamepad2, GraduationCap, LayoutGrid, Settings } from 'lucide-react';
import { useMemo } from 'react';
import LearningFlashcards from './learning/LearningFlashcards';
import { UserTrackingProvider } from '@/contexts/tracking/UserTrackingContext';
import flashcardUtils from '../../utils/flashcard.utils';
import FlashcardSettings from './settings/FlashcardSettings';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import TopicFlashcardsEdit from './edit/TopicFlashcardsEdit';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GamesContent from '../games/GamesContent';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import TopicFlashcardsBrowse from './browse/TopicFlashcardsBrowse';

export type FlashcardTab = 'browse' | 'learning' | 'edit' | 'settings' | 'games';
export enum FlashcardTabEnum {
    BROWSE = 'browse',
    LEARNING = 'learning',
    EDIT = 'edit',
    SETTINGS = 'settings',
    GAMES = 'games',
}

interface Props {
    mode: ILearningMode;
    role: UserRoleEnum;
}

export default function FlashcardContent({ mode, role }: Props) {
    const availableFlashcardTabs: FlashcardTab[] = useMemo(() => {
        if (mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER)
            return ['browse', 'learning', 'edit', 'settings', 'games'];
        if (role === UserRoleEnum.USER) return ['browse', 'learning', 'settings', 'games'];
        return [];
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
        if (!availableFlashcardTabs.includes(mode as FlashcardTab)) return;
        setFlashcardTab(mode as FlashcardTab);
    }

    return (
        <div className="w-full h-full flex flex-col">
            <Tabs value={flashcardTab} onValueChange={handleModeSelect} className="w-full h-full flex flex-col">
                {/* Tabs header */}
                <div className="flex justify-center">
                    <TabsList
                        className="w-[70%] rounded-2xl p-1 grid"
                        style={{
                            gridTemplateColumns: `repeat(${availableFlashcardTabs.length}, minmax(0, 1fr))`,
                        }}
                    >
                        {availableFlashcardTabs.map((item) => (
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
                </div>

                {/* Content wrapper */}
                <div className="flex-1 min-h-0">
                    <TabsContent value={FlashcardTabEnum.BROWSE} className="h-full">
                        <TopicFlashcardsBrowse
                            canGenerate={mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER}
                        />
                    </TabsContent>

                    <TabsContent value={FlashcardTabEnum.LEARNING} className="h-full">
                        <UserTrackingProvider
                            autoStartTracking={true}
                            enableAutoSend={true} // Disable auto-send to prevent duplicate API calls - handleSaveTrackingProgressLearning() handles this
                            minSessionTime={5000} // 5 seconds minimum session// Behavioral tracking
                            learningApiEndpoint="/progress/learning-tracking" // Learning progress tracking
                        >
                            <LearningFlashcards />
                        </UserTrackingProvider>
                    </TabsContent>

                    <TabsContent value={FlashcardTabEnum.EDIT} className="h-full">
                        <TopicFlashcardsEdit />
                    </TabsContent>

                    <TabsContent value={FlashcardTabEnum.SETTINGS} className="h-full overflow-y-auto">
                        <FlashcardSettings />
                    </TabsContent>

                    <TabsContent value={FlashcardTabEnum.GAMES} className="h-full">
                        <GamesContent />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
