import { useTranslations } from 'next-intl';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';
import { ITopic } from '../types/topic.type';

export type IDeletingTopic = Pick<ITopic, 'topicId' | 'name'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    topic?: IDeletingTopic | null;
    handleDeleteClick: (topicId: number) => void;

    loading?: boolean;
}

export function DeleteTopicModal({ isOpen, setIsOpen, topic, handleDeleteClick, loading }: Props) {
    if (!topic) {
        return null;
    }
    const t = useTranslations('topic.deletedForm');
    const { topicId, name } = topic;
    return (
        <DeleteConfirmationModal
            title={t('title', { name })}
            description={t('description')}
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleDeleteClick(topicId)} disabled={loading}>
                        {loading ? 'Saving...' : t('deleteButton')}
                    </Button>
                </div>
            }
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
}
