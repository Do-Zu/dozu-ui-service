import { Button } from '@/components/ui/button';
import { IClass } from '../../types/class.type';
import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';

export type ILeavingClass = Pick<IClass, 'classId' | 'name'>;

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    myClass?: ILeavingClass | null;
    handleLeaveClick: (classId: number) => void;
    loading?: boolean;
}

export default function LeaveClassModal({ isOpen, setIsOpen, myClass, handleLeaveClick, loading }: Props) {
    if(!myClass) {
        return null;
    }
    return (
        <DeleteConfirmationModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            title="Leave Class"
            description={`Are you sure you want to leave ${myClass.name}? 
                All your study progress in this class will be deleted.`}
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={() => handleLeaveClick(myClass.classId)} disabled={loading}>
                        {loading ? 'Saving...' : 'Leave'}
                    </Button>
                </div>
            }
        />
    );
}
