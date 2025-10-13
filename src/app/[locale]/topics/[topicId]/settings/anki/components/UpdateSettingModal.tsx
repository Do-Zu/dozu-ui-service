import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IAnkiSetting } from '@/types/anki-setting/ankiSetting.type';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

export type IUpdatingSetting = Pick<IAnkiSetting, 'ankiSettingId' | 'name'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    setting?: IUpdatingSetting | null;
    onSubmit: ({ ankiSettingId, name }: IUpdatingSetting) => void;
    loading?: boolean;
}

export default function UpdateSettingModal({ isOpen, setIsOpen, setting, onSubmit, loading }: Props) {
    if (!setting) {
        return null;
    }
    const tCommon = useTranslations('common');
    const { ankiSettingId, name: nameSelected } = setting;

    const [name, setName] = useState<string>('');

    useEffect(() => {
        if (!isOpen) {
            setName('');
        } else {
            setName(nameSelected);
        }
    }, [isOpen, nameSelected]);

    function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ ankiSettingId, name });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Update setting"
            body={
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">{tCommon('labels.name')}</div>
                        <Input value={name} onChange={handleNameChange} />
                    </div>

                    <div>
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading ? tCommon('status.saving') : tCommon('actions.update')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
