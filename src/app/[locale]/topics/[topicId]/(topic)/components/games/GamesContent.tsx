'use client';

import { Gamepad2, Brain, MemoryStick, ArrowLeft, Grid3x3, List } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import { BrainChaseProvider } from '@/app/[locale]/games/brain-chase/context/brainChaseContext';
import { MemoryMatchProvider } from '@/app/[locale]/games/memory-match/context/MemoryMatchContext';
import BrainChaseGame from './BrainChaseGame';
import MemoryMatchGame from './MemoryMatchGame';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

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

type ViewMode = 'card' | 'column';

export default function GamesContent({ mode, role }: Props) {
    const { selectedGame, selectGame, resetGame, topicId } = useTopicWorkspace();
    const t = useTranslations('games.common');
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    const availableGames = useMemo(
        () => [
            {
                id: 'brain-chase' as const,
                name: t('brainChase'),
                description: t('brainChaseDescription'),
                icon: <Brain className="h-8 w-8" />,
            },
            {
                id: 'memory-match' as const,
                name: t('memoryMatch'),
                description: t('memoryMatchDescription'),
                icon: <MemoryStick className="h-8 w-8" />,
            },
        ],
        [t],
    );

    if (selectedGame) {
        return (
            <div className="w-full h-full flex flex-col">
                <div className="flex items-center gap-4 p-4 border-b">
                    <Button variant="ghost" size="icon" onClick={resetGame}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                        {availableGames.find((g) => g.id === selectedGame)?.name}
                    </h2>
                </div>
                <div className="flex-1 min-h-0">
                    {selectedGame === 'brain-chase' && (
                        <BrainChaseProvider topicId={topicId?.toString() || null}>
                            <BrainChaseGame />
                        </BrainChaseProvider>
                    )}
                    {selectedGame === 'memory-match' && (
                        <MemoryMatchProvider topicId={topicId?.toString() || null}>
                            <MemoryMatchGame />
                        </MemoryMatchProvider>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold mb-2">{t('gamesTitle')}</h2>
                    <p className="text-muted-foreground">{t('gamesDescription')}</p>
                </div>
                <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', viewMode === 'card' && 'bg-primary text-primary-foreground')}
                        onClick={() => setViewMode('card')}
                        title={t('cardView')}
                    >
                        <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn('h-8 w-8', viewMode === 'column' && 'bg-primary text-primary-foreground')}
                        onClick={() => setViewMode('column')}
                        title={t('columnView')}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {viewMode === 'card' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                    {availableGames.map((game) => (
                        <Card
                            key={game.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow h-64 flex flex-col"
                            onClick={() => selectGame(game.id)}
                        >
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">{game.icon}</div>
                                    <CardTitle>{game.name}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col flex-1">
                                <CardDescription className="text-base">{game.description}</CardDescription>
                                <Button className="w-full mt-auto" onClick={() => selectGame(game.id)}>
                                    <Gamepad2 className="mr-2 h-4 w-4" />
                                    {t('playNow')}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                    {availableGames.map((game) => (
                        <Card
                            key={game.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => selectGame(game.id)}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                                        {game.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="mb-1">{game.name}</CardTitle>
                                        <CardDescription className="text-sm mb-3">{game.description}</CardDescription>
                                    </div>
                                    <Button
                                        className="flex-shrink-0"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            selectGame(game.id);
                                        }}
                                    >
                                        <Gamepad2 className="mr-2 h-4 w-4" />
                                        {t('playNow')}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

