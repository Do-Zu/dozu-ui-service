'use client';

import { CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/full-calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import CalendarView from '@/app/[locale]/schedule/components/CalendarView';

// interface ScheduleDialogProps {
//     open: boolean;
//     onOpenChange: (open: boolean) => void;
// }

export default function ScheduleDialog({ className }: { className?: string } = {}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'size-9 rounded-full border backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:hover:bg-slate-800/70',
                        className,
                    )}
                    aria-label="Open schedule"
                >
                    <CalendarDays className="size-4 text-muted-foreground" />
                </Button>
            </DialogTrigger>
            <DialogContent className="flex h-[90vh] max-h-[90vh] max-w-[90vw] flex-col overflow-scroll">
                <Calendar>
                    <CalendarView />
                </Calendar>
            </DialogContent>
        </Dialog>
    );
}
