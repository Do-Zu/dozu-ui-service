'use client';

import { CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/full-calendar';

import CalendarView from '@/app/[locale]/schedule/components/CalendarView';

// interface ScheduleDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }

export default function ScheduleDialog() {
    // const [isOpen, setIsOpen] = useState<boolean>(false);
    return (
        <Dialog>
            <DialogTrigger asChild>
                <CalendarDays />
            </DialogTrigger>
            <DialogContent className="flex h-[90vh] max-h-[90vh] max-w-[90vw] flex-col">
                <Calendar>
                    <CalendarView />
                </Calendar>
            </DialogContent>
        </Dialog>
    );
}
