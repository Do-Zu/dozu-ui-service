import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    learningMaterialId: number | null;
    onSubmit: ({ learningMaterialId }: { learningMaterialId: number }) => Promise<void>;
    loading: boolean;
}

export default function DeleteLearningMaterialModal({
    isOpen,
    setIsOpen,
    learningMaterialId,
    onSubmit,
    loading,
}: Props) {
    const tCommon = useTranslations('common');
    // const tAssignment = useTranslations('assignment');

    if (!learningMaterialId) {
        return null;
    }

    async function handleSubmit() {
        if (learningMaterialId) {
            await onSubmit({ learningMaterialId: learningMaterialId });
        }
    }

    return (
        <DeleteConfirmationModal
            title={tCommon('titles.deleteItem', { name: 'Learning material' })}
            description={'This will also delete all related attachments. Continue?'}
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                        {loading ? tCommon('status.saving') : tCommon('actions.delete')}
                    </Button>
                </div>
            }
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
}
