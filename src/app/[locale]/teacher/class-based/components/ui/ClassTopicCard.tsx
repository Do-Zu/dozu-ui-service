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
import { ITopic } from '@/app/[locale]/topics/types/topic.type';
import topicService from '@/services/topic/topic.service';

interface Props {
    topic: ITopic;
    handleOpenUpdateModal: ({
        topicId,
        name,
        description,
        imageUrl,
    }: {
        topicId: number;
        name: string;
        description: string;
        imageUrl?: string | null;
    }) => void;
    handleOpenDeleteModal: ({ topicId, name }: { topicId: number; name: string }) => void;
    handleNameClick: (topic: ITopic) => void;
}

export function ClassTopicCard({ topic, handleOpenUpdateModal, handleOpenDeleteModal, handleNameClick }: Props) {
    const router = useRouter();

    const { topicId, name, description, imageUrl } = topic;
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');

    function handleOnSelectEditFlashcard() {
        router.push(ROUTES.FLASHCARDS_EDIT(topicId));
    }

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

    function handleOnClickEditMindmap() {
        router.push(ROUTES.MINDMAP_EDIT(topicId));
    }

    function handleOnClickStartQuiz() {
        router.push(ROUTES.QUIZ_START(topicId));
    }

    function handleOnClickEditQuestion() {
        router.push(ROUTES.QUIZ_EDIT(topicId));
    }

    return (
        <Card className="overflow-hidden transition-all duration-200 hover:shadow-md hover:cursor-pointer bg-gray-50 dark:bg-gray-600">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle
                        className="text-lg font-medium truncate hover:underline hover:text-blue-400 transition"
                        onClick={() => handleNameClick(topic)}
                    >
                        {name}
                    </CardTitle>
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
                                    <DropdownMenuItem onSelect={handleOnSelectEditFlashcard}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleOnSelectBrowse}>
                                        <BookOpen className="mr-2 h-4 w-4" />
                                        <span>{tTopic('browse')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleOnSelectLearning}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        <span>{tTopic('learning')}</span>
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
                                    <DropdownMenuItem onSelect={handleOnClickEditMindmap}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
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
                                        <span>{tTopic('start-quiz')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleOnClickEditQuestion}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.edit')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>{tCommon('actions.delete')}</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Topic itself */}
                            <DropdownMenuItem
                                onSelect={() => handleOpenUpdateModal({ topicId, name, description, imageUrl })}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.edit')}</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem onSelect={() => handleOpenDeleteModal({ topicId, name })}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{tCommon('actions.delete')}</span>
                            </DropdownMenuItem>
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
                <div className="text-xs text-foreground">
                    Created At: <span className="font-bold">{format(topic.createdAt!, 'yyyy-MM-dd')}</span>
                </div>
            </CardContent>
        </Card>
    );
}
