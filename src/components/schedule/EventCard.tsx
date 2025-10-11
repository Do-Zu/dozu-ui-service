import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { CalendarEvent } from '../ui/full-calendar';
import EditDialog from '@/app/[locale]/schedule/components/EditDialog';
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

const EventCard = ({ event, isDragging = false, onEventChange }: EventCardProps) => {
    const router = useRouter();
    const t = useTranslations('schedule.eventCard.actions');
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(event);

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

    const handleEditClick = () => {
        setEditingEvent(event);
        setEditDialogOpen(true);
    };

    const handleRedirectLearningPage = () => {
        const { type } = event;

        if (type === 'flashcard') {
            router.push(ROUTES.FLASHCARDS_LEARNING(event?.topicId));
        } else if (type === 'question') {
            router.push(ROUTES.QUIZ_START(event?.topicId));
        }
    };

    const handleSaveEvent = (updatedEvent: CalendarEvent) => {
        setEditingEvent(updatedEvent);
        setEditDialogOpen(false);
        if (onEventChange) {
            onEventChange(updatedEvent);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('group relative', isSortableDragging && 'z-50', isDragging && 'cursor-grabbing')}
        >
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className="flex items-center gap-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab hover:bg-gray-100 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <GripVertical size={12} />
                        </div>
                        <span className={cn('flex-1 min-w-0 text-xs text-left truncate')}>
                            {event?.title}
                        </span>
                        </Button>
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <p className="text-xs">
                            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </p>
                        <DialogFooter>
                            <Button onClick={handleRedirectLearningPage} variant="outline" className="text-sm">
                                {t('learn')}
                            </Button>
                            <Button onClick={handleEditClick} variant="outline" className="text-sm text-blue-600">
                                {t('edit')}
                            </Button>
                        </DialogFooter>
                    </div>
                </HoverCardContent>
            </HoverCard>

            {editDialogOpen && (
                <EditDialog
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    event={editingEvent}
                    onSave={handleSaveEvent}
                />
            )}
        </div>
    );
};

export default EventCard;
