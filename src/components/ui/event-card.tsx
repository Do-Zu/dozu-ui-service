import EditDialog from '@/app/[locale]/schedule/components/EditDialog';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';
import { CalendarEvent } from './full-calendar';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/constants/routes';

type EventCardProps = {
    event: CalendarEvent;
};

const EventCard = ({ event }: EventCardProps) => {
    const router = useRouter();
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(event);
    const handleEditClick = () => {
        setEditingEvent(event);
        setEditDialogOpen(true);
    };

    const handleRedirectLearningPage = () => {
        const { type } = event;
        if (type === 'flashcard') {
            router.push(ROUTES.FLASHCARDS_LEARNING(event?.topicId.toString()));
        }
    };

    return (
        <div>
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Button variant="link" className={cn('absolute top-[-10px] text-xs')}>
                        {event.title}
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                    <div className="space-y-1">
                        <h4 className="text-sm font-semibold">{event.title}</h4>
                        <p className="text-xs">
                            {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </p>
                        {/* <p className="text-xs">Event description</p> */}
                        <DialogFooter>
                            <Button onClick={handleRedirectLearningPage} variant="outline" className="text-sm">
                                Learn
                            </Button>
                            {/* <Button onClick={handleEditClick} variant="outline" className="text-sm text-blue-600">
                                Edit
                            </Button> */}
                        </DialogFooter>
                    </div>
                </HoverCardContent>
            </HoverCard>

            {/* Show Dialog edit */}
            {editDialogOpen && (
                <EditDialog
                    isOpen={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    event={editingEvent}
                    onSave={(updatedEvent) => {
                        setEditDialogOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default EventCard;
