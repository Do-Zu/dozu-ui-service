'use client';

import { Gamepad2, Brain, MemoryStick, ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTopicWorkspace } from '../../context/TopicWorkspaceContext';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import { BrainChaseProvider } from '@/app/[locale]/games/brain-chase/context/brainChaseContext';
import { MemoryMatchProvider } from '@/app/[locale]/games/memory-match/context/MemoryMatchContext';
import BrainChaseGame from './BrainChaseGame';
import MemoryMatchGame from './MemoryMatchGame';

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

export default function GamesContent({ mode, role }: Props) {
    const { selectedGame, selectGame, resetGame, topicId } = useTopicWorkspace();

    const availableGames = useMemo(
        () => [
            {
                id: 'brain-chase' as const,
                name: 'Brain Chase',
                description: 'Catch the correct answers as they fall! Test your knowledge with this fast-paced quiz game.',
                icon: <Brain className="h-8 w-8" />,
            },
            {
                id: 'memory-match' as const,
                name: 'Memory Match',
                description: 'Match flashcards by finding pairs. Improve your memory and recall skills!',
                icon: <MemoryStick className="h-8 w-8" />,
            },
        ],
        [],
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
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Games</h2>
                <p className="text-muted-foreground">Choose a game to practice with your flashcards</p>
            </div>

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
                                Play Now
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

