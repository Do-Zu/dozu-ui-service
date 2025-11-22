'use client';

import { useState } from 'react';
import { formatDate } from '@/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BookCopy, CheckCircle, Clock, Sparkles, SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { IUpdatingTopic, UpdateTopicModal } from '@/app/[locale]/topics/components/modals/UpdateTopicModal';
import usePost from '@/hooks/usePost';
import topicService, { IUpdateTopicPayload } from '@/services/topic/topic.service';
import { IUpdateTopicResponse } from '@/app/[locale]/topics/types/topic.type';
import toastHelper from '@/utils/toast.helper';
import { useValidateTopic } from '@/app/[locale]/topics/hooks/useTopics';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import { useRequireTopic } from '../../context/useRequireTopic';

interface StatCardProps {
    icon: React.ReactNode;
    value: number;
    label: string;
    description: string;
    bgColorClass: string;
    dotColorClass: string;
}

const StatCard = ({ icon, value, label, description, bgColorClass, dotColorClass }: StatCardProps) => (
    <div className={cn('rounded-lg p-4 text-white flex flex-col justify-between h-full', bgColorClass)}>
        <div className="flex items-center justify-between">
            <div className={cn('w-3 h-3 rounded-full', dotColorClass)} />
            <div className="text-2xl font-bold">{value}</div>
        </div>
        <div>
            <div className="font-semibold">{label}</div>
            <div className="text-xs opacity-80">{description}</div>
        </div>
    </div>
);

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

export default function TopicOverview({ mode, role }: Props) {
    const tCommon = useTranslations('common');
    const tTopic = useTranslations('topic');
    const topicLabel = tTopic('topic');

    const { topic, setTopic } = useRequireTopic();

    const validateTopic = useValidateTopic();
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [editingTopic, setEditingTopic] = useState<IUpdatingTopic>();

    const { loading: updateTopicLoading, execute: updateTopicAsync } = usePost<
        IUpdateTopicPayload,
        IUpdateTopicResponse
    >(topicService.updateTopic, 'PUT', {
        onError: toastHelper.showErrorMessage,
        onSuccess: (data) => {
            toastHelper.showSuccessMessage(tCommon('messages.updateSuccess', { name: topicLabel }));
            setIsEditOpen(false);
            const { name, description, imageUrl } = data;
            setTopic({ ...topic, name, description, imageUrl });
        },
    });

    function handleUpdateModalOpen() {
        setIsEditOpen(true);
        const { topicId, name, description, imageUrl } = topic;
        setEditingTopic({ topicId, name, description, imageUrl });
    }

    async function handleUpdateSubmit(topic: IUpdateTopicPayload) {
        if (validateTopic(topic)) {
            await updateTopicAsync(topic);
        }
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl space-y-8">
            {/* --- GROUP 1: HEADER --- */}
            <div>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-extrabold tracking-tight lg:text-4xl">{topic.name}</h1>
                    {mode === MODE_ACCESS_PAGE_ROLE.personal || role === 'teacher' ? (
                        <>
                            <Button variant="ghost" size="icon" onClick={handleUpdateModalOpen}>
                                <SquarePen className="h-6 w-6 text-muted-foreground" />
                                <span className="sr-only">Edit Topic</span>
                            </Button>

                            <UpdateTopicModal
                                isOpen={isEditOpen}
                                setIsOpen={setIsEditOpen}
                                topic={editingTopic}
                                onSubmit={handleUpdateSubmit}
                                loading={updateTopicLoading}
                            />
                        </>
                    ) : null}
                </div>

                <p className="text-lg text-muted-foreground mt-2">
                    {topic.description || tCommon('labels.noDescription')}
                </p>
                <p className="text-sm text-muted-foreground mt-4">Created on {formatDate(topic.createdAt)}</p>
            </div>

            <Separator />

            {/* --- GROUP 2: STATS OVERVIEW --- */}
            <Card>
                <CardHeader>
                    <CardTitle>Flashcard Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-32">
                        <StatCard
                            icon={<Sparkles size={20} />}
                            value={topic.flashcardCounts?.new || 0}
                            label="New"
                            description="Cards to learn"
                            bgColorClass="bg-blue-500"
                            dotColorClass="bg-blue-300"
                        />
                        <StatCard
                            icon={<Clock size={20} />}
                            value={topic.flashcardCounts?.learning || 0}
                            label="Learning"
                            description="Currently studying"
                            bgColorClass="bg-red-500"
                            dotColorClass="bg-red-300"
                        />
                        <StatCard
                            icon={<CheckCircle size={20} />}
                            value={topic.flashcardCounts?.review || 0}
                            label="Review"
                            description="Ready to review"
                            bgColorClass="bg-green-500"
                            dotColorClass="bg-green-300"
                        />
                        <StatCard
                            icon={<BookCopy size={20} />}
                            value={topic.flashcardCounts?.total || 0}
                            label="Total"
                            description="All cards in topic"
                            bgColorClass="bg-gray-700 dark:bg-gray-600"
                            dotColorClass="bg-gray-400"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
