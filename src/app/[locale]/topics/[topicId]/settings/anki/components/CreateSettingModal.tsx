import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent, useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onSubmit: ({ name }: { name: string }) => void;
    loading?: boolean;
}

export default function CreateSettingModal({ isOpen, setIsOpen, onSubmit, loading }: Props) {
    const tCommon = useTranslations('common');
    const [name, setName] = useState<string>('');

    useEffect(() => {
        setName('');
    }, [isOpen]);

    function handleNameChange(event: ChangeEvent<HTMLInputElement>) {
        setName(event.target.value);
    }

    function handleSubmit() {
        onSubmit({ name });
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Create new setting"
            description="This allows you to create a new setting profile for this topic or your personal study style."
            body={
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">{tCommon('labels.name')}</div>
                        <Input value={name} onChange={handleNameChange} />
                    </div>

                    <div>
                        <Button className="text-base" onClick={handleSubmit} disabled={loading}>
                            {loading ? tCommon('status.saving') : tCommon('actions.create')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
