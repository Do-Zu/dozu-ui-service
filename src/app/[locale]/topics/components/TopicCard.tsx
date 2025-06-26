import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ITopicForUser } from '../topic.type';
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
    Repeat,
    Trash2,
} from 'lucide-react';
import Image from 'next/image';
import { TopicModal } from './TopicModal';
import { TopicUpdatedForm } from './TopicUpdatedForm';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { DeleteAlertingModal } from './DeleteAlertingDialog';
import { useRouter } from 'next/navigation';

interface FlashcardsProp {
    handleOnClickEdit: (name: string, description: string) => void;
    handleOnClickStudy: (topicId: number) => void;
    handleOnClickPractice: (topicId: number) => void;
}

interface Props {
    topic: ITopicForUser;
    updateTopics: (topic: ITopicForUser) => void;
    handleOnClickTitle?: (topicId: number) => void;
    handleOnClickEdit?: (name: string, description: string) => void;
    handleOnClickDelete: (topicId: number) => void;
    flashcards?: FlashcardsProp;

    isTopicUpdatedModalOpen: boolean;
    setIsTopicUpdatedModalOpen: (value: boolean) => void;

    isTopicDeletedModalOpen: boolean;
    setIsTopicDeletedModalOpen: (value: boolean) => void;
}
const lastStudied = '1 day ago';

export function TopicCard({
    topic,
    handleOnClickTitle,
    handleOnClickEdit,
    handleOnClickDelete,
    updateTopics,
    isTopicUpdatedModalOpen,
    setIsTopicUpdatedModalOpen,
    isTopicDeletedModalOpen,
    setIsTopicDeletedModalOpen,
}: Props) {
    const router = useRouter();

    const { topicId, name, description, imageUrl } = topic;
    const topicT = useTranslations('topic');
    const updatedFormT = useTranslations('topic.updatedForm');
    const deletedFormT = useTranslations('topic.deletedForm');

    // update topic states
    const [topicEditedName, setTopicEditedName] = useState<string>('');
    const [topicEditedDescription, setTopicEditedDescription] = useState<string>('');

    function handleOnSelectEditTopic() {
        setTopicEditedName(name);
        setTopicEditedDescription(description);
        setTimeout(() => {
            setIsTopicUpdatedModalOpen(true);
        }, 50);
    }

    function handleOnSelectDeleteTopic() {
        setTimeout(() => {
            setIsTopicDeletedModalOpen(true);
        }, 50);
    }

    function handleOnSelectEditFlashcard() {
        router.push(`flashcards/edit?topicId=${topicId}`);
    }

    function handleOnSelectStudy() {
        router.push(`/flashcards/study?topicId=${topicId}`);
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
                                    <DropdownMenuItem onSelect={handleOnSelectEditFlashcard}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={handleOnSelectStudy}>
                                        <GraduationCap className="mr-2 h-4 w-4" />
                                        <span>Study</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Repeat className="mr-2 h-4 w-4" />
                                        <span>Practice</span>
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
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
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
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        <span>Edit</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        <span>Delete</span>
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>

                            {/* Topic itself */}
                            <DropdownMenuItem onSelect={handleOnSelectEditTopic}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>{topicT('edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleOnSelectDeleteTopic}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>{topicT('delete')}</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <TopicModal
                        title={updatedFormT('title')}
                        body={
                            <TopicUpdatedForm
                                topicId={topicId}
                                name={topicEditedName}
                                description={topicEditedDescription}
                                setName={setTopicEditedName}
                                setDescription={setTopicEditedDescription}
                                handleCloseModal={() => setIsTopicUpdatedModalOpen(false)}
                                updateTopics={updateTopics}
                            />
                        }
                        isOpen={isTopicUpdatedModalOpen}
                        setIsOpen={setIsTopicUpdatedModalOpen}
                    />

                    <DeleteAlertingModal
                        title={deletedFormT('title', { name })}
                        description={deletedFormT('description')}
                        body={
                            <div className="flex justify-end">
                                <Button variant="destructive" onClick={() => handleOnClickDelete(topicId)}>
                                    {deletedFormT('deleteButton')}
                                </Button>
                            </div>
                        }
                        isOpen={isTopicDeletedModalOpen}
                        setIsOpen={setIsTopicDeletedModalOpen}
                    />
                </div>
            </CardHeader>

            <CardContent>
                <div className="relative h-44 bg-gray-200 dark:bg-gray-400 rounded-md mb-3 flex items-center justify-center">
                    {imageUrl ? (
                        <Image fill className="object-contain" alt="Item Image" src={imageUrl} />
                    ) : (
                        <div className="text-gray-500 dark:text-slate-500 text-lg">Preview</div>
                    )}
                </div>
                <div className="flex justify-between text-xs text-foreground">
                    <div className="text-xs">{lastStudied ? `Last studied: ${lastStudied}` : 'Not studied yet'}</div>
                    <span>{5} items</span>
                </div>
            </CardContent>
        </Card>
    );
}
