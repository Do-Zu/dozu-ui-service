import { putRequest } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';
import { ITopicForUser } from '../topic.type';
import { useTranslations } from 'next-intl';
import { toast } from '@/hooks/use-toast';

interface Props {
    topicId: number;
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    handleCloseModal?: () => void;
    updateTopics: (topic: ITopicForUser) => void;
}

export const TopicUpdatedForm = ({
    topicId,
    name,
    setName,
    description,
    setDescription,
    handleCloseModal,
    updateTopics,
}: Props) => {
    const topicT = useTranslations('topic');
    const t = useTranslations('topic.updatedForm');

    function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
        setDescription(event.target.value);
    }

    // todo-ka: cân nhắc đẩy sang parent component
    async function handleOnClickSave() {
        if (!name) {
            toast({
                title: topicT('blankNameAlert'),
                variant: 'destructive'
            })
            return;
        }
        try {
            const topicName = name,
                topicDescription = description ? description : '';
            const dataSubmitted = { topicName, topicDescription };
            const data = await putRequest<any, ITopicForUser>(`/topics/${topicId}`, dataSubmitted);
            updateTopics(data.data);
            handleCloseModal?.();
            toast({
                title: 'Update Topic successfully!',
                variant: 'default'
            })
        } catch (err) {
            toast({
                title: 'Update Topic failed, please try again',
                variant: 'destructive'
            })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">{topicT('name')}</div>
                <Input value={name} onChange={handleOnChangeName} />
            </div>

            <div className="flex flex-col gap-2">
                <div className="text-primary text-base font-normal">{topicT('description')}</div>
                <Input value={description ? description : ''} onChange={handleOnChangeDescription} />
            </div>

            <div>
                <Button className="text-base" onClick={handleOnClickSave}>
                    {t('updateButton')}
                </Button>
            </div>
        </div>
    );
};
