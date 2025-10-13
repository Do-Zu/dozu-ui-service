import { useTranslations } from 'next-intl';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';

export type IDeletingSetting = Pick<IAnkiSetting, 'ankiSettingId' | 'name'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;

    setting?: IDeletingSetting | null;
    onSubmit: ({ ankiSettingId }: { ankiSettingId: number }) => void;

    loading?: boolean;
}

export function DeleteSettingModal({ isOpen, setIsOpen, setting, onSubmit, loading }: Props) {
    if (!setting) {
        return null;
    }
    const tCommon = useTranslations('common');
    const tAnkiSetting = useTranslations('ankiSetting');
    const { ankiSettingId, name } = setting;

    function handleSubmit() {
        onSubmit({ ankiSettingId });
    }

    return (
        <DeleteConfirmationModal
            title={tCommon('titles.deleteItem', { name })}
            description={tAnkiSetting('deleteConfirmation', { name })}
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
