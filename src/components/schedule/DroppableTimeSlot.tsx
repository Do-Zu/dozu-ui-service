import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { HEIGHT_OF_EACH_SESSION_HOUR } from './constant';

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
                'border-t last:border-b relative transition-colors',
                isOver && 'bg-blue-50 border-blue-200 dark:bg-slate-600 dark:border-blue-900 rounded-sm',
                className,
            )}
            style={{ height: HEIGHT_OF_EACH_SESSION_HOUR }}
        >
            {children}
        </div>
    );
};

export default DroppableTimeSlot;
