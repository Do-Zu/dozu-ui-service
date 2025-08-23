import { Modal } from '@/components/modal/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { ChangeEvent } from 'react';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    code: string;
    setCode: (value: string) => void;

    handleJoinClick: (classId: string) => void;

    loading?: boolean;
}

export function JoinClassModal({ isOpen, setIsOpen, code, setCode, handleJoinClick, loading }: Props) {
    const tCommon = useTranslations('common');
    const tClass = useTranslations('class');
    const tJoinClass = useTranslations('class.join');
    function handleCodeChange(event: ChangeEvent<HTMLInputElement>) {
        setCode(event.target.value);
    }

    return (
        <Modal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={tJoinClass('title')}
            description={tJoinClass('description')}
            body={
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <div className="text-primary text-base font-normal">{tClass('invitationCode')}</div>
                        <Input value={code} onChange={handleCodeChange} />
                    </div>

                    <div className="flex justify-end mt-2">
                        <Button className="text-base" onClick={() => handleJoinClick(code)} disabled={loading}>
                            {loading ? tCommon('status.saving') : tJoinClass('label')}
                        </Button>
                    </div>
                </div>
            }
        />
    );
}
