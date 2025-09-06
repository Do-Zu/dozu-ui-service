import { useTranslations } from 'next-intl';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    classFeedId?: number | null;
    onSubmit: (classFeedId: number) => void;

    loading?: boolean;
}

export function DeleteFeedModal({ isOpen, setIsOpen, classFeedId, onSubmit, loading }: Props) {
    if (!classFeedId) {
        return null;
    }
    const tCommon = useTranslations('common');

    return (
        <DeleteConfirmationModal
            title="Do you want to delete this feed"
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => onSubmit(classFeedId)} disabled={loading}>
                        {loading ? tCommon('status.saving') : tCommon('actions.delete')}
                    </Button>
                </div>
            }
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
}
