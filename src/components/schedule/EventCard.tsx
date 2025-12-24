import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarEvent } from '../ui/full-calendar';
import { ROUTES } from '@/utils/constants/routes';
import { useTranslations } from 'next-intl';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

type EventCardProps = {
    event: CalendarEvent;
    isDragging?: boolean;
    onEventChange?: (event: CalendarEvent) => void;
};

const EventCard = ({ event, isDragging = false }: EventCardProps) => {
    const router = useRouter();
    const t = useTranslations('schedule.eventCard.actions');

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({
        id: event.id,
        data: {
            type: 'event',
            event,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    const handleRedirectLearningPage = () => {
        const { type } = event;

        if (type === 'flashcard') {
            router.push(ROUTES.TOPIC_WORKSPACE({ topicId: event?.topicId, tab: 'flashcard' }));
        } else if (type === 'question') {
            router.push(ROUTES.QUIZ_START(event?.topicId));
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('group relative top-[-0.5em]', isSortableDragging && 'z-50', isDragging && 'cursor-grabbing')}
        >
            <Popover>
                <div className="flex items-center gap-1">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab rounded  opacity-0 transition-opacity hover:bg-gray-100 group-hover:opacity-100"
                    >
                        <GripVertical size={12} />
                    </div>

                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                'flex-1 min-w-0 text-xs text-left truncate text-slate-800 dark:text-slate-50',
                            )}
                        >
                            {event?.title}
                        </button>
                    </PopoverTrigger>
                </div>

                <PopoverContent className="w-80">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{event?.title}</h4>
                        <p className="text-xs">
                            {format(event?.start, 'HH:mm')} - {format(event?.end, 'HH:mm')}
                        </p>
                        <DialogFooter>
                            <Button
                                onClick={handleRedirectLearningPage}
                                className="rounded-2xl text-sm hover:opacity-70"
                            >
                                {t('learn')}
                            </Button>
                        </DialogFooter>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default EventCard;
