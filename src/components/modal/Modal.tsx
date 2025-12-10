import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogOverlay,
    DialogPortal,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import React, { ReactElement } from 'react';

interface Props {
    trigger?: ReactElement;
    title?: string;
    description?: ReactElement | string | null;
    body: ReactElement;
    footer?: ReactElement;
    cancel?: ReactElement;
    isOpen?: boolean;
    setIsOpen?: (isOpen: boolean) => void;
    className?: string;
}

export const Modal = ({ isOpen, setIsOpen, trigger, title, description, body, footer, cancel, className }: Props) => {
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogPortal>
                <DialogOverlay className="bg-background/60 fixed inset-0" />
                <DialogContent
                    className={cn(
                        'bg-background rounded-lg shadow-[0_10px_38px_-10px_rgba(22,23,24,0.35),0_10px_20px_-15px_rgba(22,23,24,0.2)] fixed top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[550px] max-h-[85vh] p-[25px] z-[1001] overflow-y-auto focus:outline-none',
                        className,
                    )}
                >
                    {title && <DialogTitle className="font-medium text-xl">{title}</DialogTitle>}
                    {description ? (
                        <DialogDescription className="text-lg leading-[1.5]">{description}</DialogDescription>
                    ) : null}
                    {body}

                    <DialogFooter>
                        <DialogClose asChild>{cancel}</DialogClose>
                        {footer}
                    </DialogFooter>
                </DialogContent>
            </DialogPortal>
        </Dialog>
    );
};
