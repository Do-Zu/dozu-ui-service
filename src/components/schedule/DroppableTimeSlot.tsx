import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DroppableTimeSlotProps {
    hour: Date;
    children?: React.ReactNode;
    className?: string;
}

const DroppableTimeSlot = ({ hour, children, className }: DroppableTimeSlotProps) => {
    const { isOver, setNodeRef } = useDroppable({
        id: `timeslot-${format(hour, 'yyyy-MM-dd-HH')}`,
        data: {
            type: 'timeslot',
            hour,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'h-20 border-t last:border-b relative transition-colors',
                isOver && 'bg-blue-50 border-blue-200 dark:bg-slate-600 dark:border-blue-900 rounded-sm',
                className,
            )}
        >
            {children}
        </div>
    );
};

export default DroppableTimeSlot;
