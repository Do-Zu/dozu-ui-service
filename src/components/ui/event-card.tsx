import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useState } from 'react';
import EditDialog from '@/app/[locale]/schedule/components/EditDialog';
import { cn } from '@/lib/utils';

type EventCardProps = {
    event: {
        id: string;
        start: Date;
        end: Date;
        title: string;
        color?: string;
    };
};

const EventCard = ({ event }: EventCardProps) => {
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(event);
    const handleEditClick = () => {
        setEditingEvent(event);
        setEditDialogOpen(true);
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
                        <p className="text-xs">Event description</p>
                        <DialogFooter>
                            <Button onClick={handleEditClick} variant="outline" className="text-sm text-blue-600">
                                Edit
                            </Button>
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
                        console.log('Đã lưu sự kiện:', updatedEvent);
                        setEditDialogOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default EventCard;
