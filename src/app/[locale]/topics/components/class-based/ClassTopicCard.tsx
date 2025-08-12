import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
    BookOpen,
    ClipboardCheck,
    Edit,
    GitFork,
    GraduationCap,
    Layers,
    MoreVertical,
    Play,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';
import { format } from 'date-fns';
import { ITopic } from '../../types/topic.type';
import { ShowIf } from '@/components/ui/ShowIf';
import { useRoleChecker } from '@/hooks/useRoleChecker';
import topicService from '@/services/topic/topic.service';

interface Props {
    topic: ITopic;
}

export function ClassTopicCard({ topic }: Props) {
    const router = useRouter();

    const { topicId, name, description, imageUrl } = topic;
    const topicT = useTranslations('topic');

    function handleOnSelectBrowse() {
        router.push(ROUTES.FLASHCARDS_BROWSE(topicId));
    }

    async function handleOnSelectLearning() {
        const { hasProgress } = topic;
        if (hasProgress != undefined && !hasProgress) {
            await topicService.startLearningFlashcards(topicId);
        }
        router.push(ROUTES.FLASHCARDS_LEARNING(topicId));
    }

    function handleOnClickViewMindmap() {
        router.push(ROUTES.MINDMAP_VIEW(topicId));
    }

    function handleOnClickStartQuiz() {
        router.push(ROUTES.QUIZ_START(topicId));
    }
    
    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium truncate">{name}</CardTitle>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:pointer-events-auto">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" side="top">
                            {/* Flashard section */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <Layers className="mr-2 h-4 w-4" />
                                    <span>Flashcard</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={handleOnSelectBrowse}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        <span>{topicT('browse')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleOnSelectLearning}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        <span>{topicT('learning')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Mindmap section */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <GitFork className="mr-2 h-4 w-4" />
                                    <span>Mind Map</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={handleOnClickViewMindmap}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{topicT('view')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Quiz */}
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>
                                    <ClipboardCheck className="mr-2 h-4 w-4" />
                                    <span>Quiz</span>
                                </DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={handleOnClickStartQuiz}>
                                        <Play className="mr-2 h-4 w-4" />
                                        <span>{topicT('start-quiz')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>

            <CardContent>
                <div
                    className={`relative h-44 rounded-md mb-3 flex items-center justify-center ${
                        !imageUrl ? 'bg-gray-200 dark:bg-gray-400' : ''
                    }`}
                >
                    {imageUrl ? (
                        <Image fill className="object-contain" alt="Item Image" src={imageUrl} />
                    ) : (
                        <div className="text-gray-500 dark:text-slate-500 text-lg">Preview</div>
                    )}
                </div>
                <div className="flex flex-col text-xs text-foreground justify-between">
                    <div className="flex flex-row justify-between items-center">
                        <div>{/* Last studied: <span className="font-bold">1 day ago</span> */}</div>
                        <div>
                            <ShowIf when={topic.hasProgress != undefined && topic.hasProgress}>
                                <span className="font-bold">{topic.flashcardsDueToday}</span> flashcards due today
                            </ShowIf>

                            <ShowIf when={topic.hasProgress != undefined && !topic.hasProgress}>
                                <div>Not Studied Yet</div>
                            </ShowIf>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
