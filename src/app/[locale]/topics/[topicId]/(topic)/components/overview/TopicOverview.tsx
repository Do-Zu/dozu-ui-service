'use client';

import { useState } from 'react';
import { formatDate } from '@/utils';
import { Separator } from '@/components/ui/separator';
import { SquarePen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { IUpdatingTopic, UpdateTopicModal } from '@/app/[locale]/topics/components/modals/UpdateTopicModal';
import usePost from '@/hooks/usePost';
import topicService, { IUpdateTopicPayload } from '@/services/topic/topic.service';
import { IUpdateTopicResponse } from '@/app/[locale]/topics/types/topic.type';
import toastHelper from '@/utils/toast.helper';
import { useValidateTopic } from '@/app/[locale]/topics/hooks/useTopics';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { UserRoleEnum } from '@/utils/constants/roles';
import { useRequireTopic } from '../../context/useRequireTopic';
import TopicStatistic from './TopicStatistic';

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
        <div className="container mx-auto max-w-6xl space-y-8 py-10">
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                            {tTopic('overview.title')}
                        </p>
                        <h1 className="text-2xl font-extrabold tracking-tight text-foreground lg:text-4xl">
                            {topic.name}
                        </h1>
                        <p className="text-base text-muted-foreground">
                            {topic.description || tCommon('labels.noDescription')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {tCommon('labels.createdAt')}: {formatDate(topic.createdAt)}
                        </p>
                    </div>

                    {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleUpdateModalOpen}>
                                <SquarePen className="mr-2 size-4" />
                                {tTopic('overview.editTopic')}
                            </Button>
                            <UpdateTopicModal
                                isOpen={isEditOpen}
                                setIsOpen={setIsEditOpen}
                                topic={editingTopic}
                                onSubmit={handleUpdateSubmit}
                                loading={updateTopicLoading}
                            />
                        </div>
                    ) : null}
                </div>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground">{tTopic('overview.subtitle')}</p>
            </div>

            <TopicStatistic />
        </div>
    );
}
