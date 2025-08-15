import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { CalendarEvent } from '@/components/ui/full-calendar';

type EditDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    event: CalendarEvent;
    onSave: (updatedEvent: CalendarEvent) => void;
};

const EditDialog = ({ isOpen, onClose, event, onSave }: EditDialogProps) => {
    const [editedEvent, setEditedEvent] = useState(event);
    const t = useTranslations('schedule.dialog.edit');
    const handleSave = () => {
        onSave(editedEvent);
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
        >
            <DialogContent>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm">
                            {t('title')}
                        </label>
                        <input
                            id="title"
                            value={editedEvent.title}
                            onChange={(e) => setEditedEvent((prev) => ({ ...prev, title: e.target.value }))}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="start" className="block text-sm">
                            {t('startTime')}
                        </label>
                        <input
                            id="start"
                            type="time"
                            value={format(editedEvent.start, 'HH:mm')}
                            onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newStart = new Date(editedEvent.start);
                                newStart.setHours(hours, minutes);
                                setEditedEvent((prev) => ({ ...prev, start: newStart }));
                            }}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="end" className="block text-sm">
                            {t('endTime')}
                        </label>
                        <input
                            id="end"
                            type="time"
                            value={format(editedEvent.end, 'HH:mm')}
                            onChange={(e) => {
                                const [hours, minutes] = e.target.value.split(':').map(Number);
                                const newEnd = new Date(editedEvent.end);
                                newEnd.setHours(hours, minutes);
                                setEditedEvent((prev) => ({ ...prev, end: newEnd }));
                            }}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="destructive" onClick={onClose}>
                        {t('cancel')}
                    </Button>
                    <Button variant="default" onClick={handleSave}>
                        {t('save')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditDialog;
