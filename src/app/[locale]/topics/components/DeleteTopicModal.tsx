import { useTranslations } from 'next-intl';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    topicId: number | null | undefined;
    name: string;
    handleDeleteClick: (topicId: number) => void;

    loading?: boolean;
}

export function DeleteTopicModal({ isOpen, setIsOpen, topicId, name, handleDeleteClick, loading }: Props) {
    const t = useTranslations('topic.deletedForm');
    return (
        <DeleteConfirmationModal
            title={t('title', { name })}
            description={t('description')}
            body={
                topicId ? (
                    <div className="flex justify-end">
                        <Button variant="destructive" onClick={() => handleDeleteClick(topicId)} disabled={loading}>
                            {loading ? 'Saving...' : t('deleteButton')}
                        </Button>
                    </div>
                ) : (
                    <div>TopicId is empty</div>
                )
            }
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
}
