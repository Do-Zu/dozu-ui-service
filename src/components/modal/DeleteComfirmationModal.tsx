import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ReactElement } from 'react';

interface Props {
    trigger?: ReactElement;
    title: string;
    description?: ReactElement | string;
    body: ReactElement;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
}

// todo-ka: change this to a more correct reuseable component
export const DeleteConfirmationModal = ({ trigger, title, description, body, isOpen, setIsOpen }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
            <DialogPortal>
                <DialogOverlay className="bg-background/60 fixed inset-0" />
                <DialogContent className="bg-background rounded-[6px] shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[500px] max-h-[85vh] p-[25px] z-[1001] overflow-y-auto focus:outline-none">
                    <DialogTitle className="mb-[10px] font-medium text-red-400 text-[17px]">{title}</DialogTitle>
                    {description ? (
                        <DialogDescription className="mb-5 text-lg leading-[1.5]">{description}</DialogDescription>
                    ) : null}
                    {body}
                    <DialogClose asChild />
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
