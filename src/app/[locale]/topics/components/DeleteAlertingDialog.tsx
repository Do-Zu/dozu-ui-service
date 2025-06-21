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
    trigger: ReactElement;
    title: string;
    description: ReactElement | string;
    body: ReactElement;
}

// todo-ka: change this to a more correct reuseable component
export const DeleteAlertingModal = ({ trigger, title, description, body }: Props) => {
    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="bg-black/60 fixed inset-0" />
                <DialogContent className="bg-[#fcfcfc] rounded-[6px] shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[500px] max-h-[85vh] p-[25px] z-[1001] overflow-y-auto focus:outline-none">
                    <DialogTitle className="mb-[10px] font-medium text-red-400 text-[17px]">{title}</DialogTitle>
                    <DialogDescription className="mb-5 text-[15px] leading-[1.5]">{description}</DialogDescription>
                    {body}
                    <DialogClose asChild></DialogClose>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
