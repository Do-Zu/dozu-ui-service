import { postRequest } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChangeEvent } from 'react';
import { ITopicForUser } from '../topic.type';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export async function handleCreateTopic({
    name,
    description,
    inputSetId,
}: {
    name: string;
    description: string;
    inputSetId?: number;
}): Promise<ITopicForUser | null> {
    if (!name) {
        toast({
            title: 'Name must not be blank',
            variant: 'destructive',
        });
        return null;
    }

    const dataSubmitted = {
        topicName: name,
        topicDescription: description,
        inputSetId: inputSetId, //to update inputSet's topicId - DuyND
    };
    let data;
    try {
        data = await postRequest<any, ITopicForUser>('/topics', dataSubmitted);
        data.data['flashcardsCount'] = 0;
    } catch (err) {
        // toast...
        // err.message err.response.data
        toast({
            title: 'Create Topic failed, please try again',
            variant: 'destructive',
        });
        throw err;
    }
    return data.data;
}

interface Props {
    name: string;
    setName: (name: string) => void;
    description: string;
    setDescription: (description: string) => void;
    handleCloseModal?: () => void;
    addTopic?: (topic: ITopicForUser) => void;
    handleOnClickCreate?: (...args: any) => void;
}

export const TopicCreatedForm = ({
    name,
    setName,
    description,
    setDescription,
    handleCloseModal,
    addTopic,
    handleOnClickCreate,
}: Props) => {
    const topicT = useTranslations('topic');
    const t = useTranslations('topic.createdForm');

    function handleOnChangeName(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleOnChangeDescription(event: ChangeEvent<HTMLInputElement>) {
        setDescription(event.target.value);
    }

    async function handleDefaultOnClickCreate() {
        let topic: ITopicForUser | null;
        try {
            topic = await handleCreateTopic({ name, description });
        } catch (err) {
            console.log(err);
            return;
        }

        if (topic) {
            toast({
                title: 'Create New Content successfully',
                variant: 'default',
            });
            addTopic?.(topic);
        }
        handleCloseModal?.();
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
                <Button
                    className="text-base"
                    onClick={handleOnClickCreate ? handleOnClickCreate : handleDefaultOnClickCreate}
                >
                    {t('createButton')}
                </Button>
            </div>
        </div>
    );
};
