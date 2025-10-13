import { DeleteConfirmationModal } from '@/components/modal/DeleteComfirmationModal';
import { Button } from '@/components/ui/button';

interface Props {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    onSubmit: () => void;
}

export default function ResetToDefaultModal({ isOpen, setIsOpen, onSubmit }: Props) {
    function handleSubmit() {
        onSubmit();
    }

    return (
        <DeleteConfirmationModal
            title="Are you sure you want to reset to default settings?"
            description="This action cannot be undone and your current settings will be lost."
            body={
                <div className="flex justify-end">
                    <Button variant="destructive" onClick={handleSubmit}>
                        Reset
                    </Button>
                </div>
            }
            isOpen={isOpen}
            setIsOpen={setIsOpen}
        />
    );
}
