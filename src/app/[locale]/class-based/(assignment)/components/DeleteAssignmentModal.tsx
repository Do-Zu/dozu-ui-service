import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    assignmentId: number | null;
    onSubmit: ({ assignmentId }: { assignmentId: number }) => Promise<void>;
    loading: boolean;
}

export default function DeleteAssignmentModal({ isOpen, setIsOpen, assignmentId, onSubmit, loading }: Props) {
    const tCommon = useTranslations('common');
    const tAssignment = useTranslations('assignment');

    if (!assignmentId) {
        return null;
    }

    async function handleSubmit() {
        if (assignmentId) {
            await onSubmit({ assignmentId });
        }
    }

    return (
        <DeleteConfirmationModal
            title={tCommon('titles.deleteItem', { name: tAssignment('assignment') })}
            description={tAssignment('deleteConfirmation')}
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
