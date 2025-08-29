import { Button } from '@/components/ui/button';
import { IClass } from '../../types/class.type';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { useTranslations } from 'next-intl';

export type ILeavingClass = Pick<IClass, 'classId' | 'name'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    myClass?: ILeavingClass | null;
    handleLeaveClick: (classId: number) => void;
    loading?: boolean;
}

export default function LeaveClassModal({ isOpen, setIsOpen, myClass, handleLeaveClick, loading }: Props) {
    if (!myClass) {
        return null;
    }
    const tCommon = useTranslations('common');
    const tLeaveClass = useTranslations('class.leave');
    return (
        <DeleteConfirmationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title={tLeaveClass('title')}
            description={tLeaveClass('description', { name: myClass.name })}
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleLeaveClick(myClass.classId)} disabled={loading}>
                        {loading ? tCommon('status.saving') : tLeaveClass('label')}
                    </Button>
                </div>
            }
        />
    );
}
