import { Dialog, DialogTitle, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import { format } from 'date-fns';

type EditDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  event: { id: string; start: Date; end: Date; title: string };
  onSave: (updatedEvent: { id: string; start: Date; end: Date; title: string }) => void;
};

const EditDialog = ({ isOpen, onClose, event, onSave }: EditDialogProps) => {
  const [editedEvent, setEditedEvent] = useState(event);

  const handleSave = () => {
    onSave(editedEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm">Tên môn học</label>
            <input
              id="title"
              value={editedEvent.title}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="start" className="block text-sm">Thời gian bắt đầu</label>
            <input
              id="start"
              type="time" 
              value={format(editedEvent.start, 'HH:mm')}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="end" className="block text-sm">Thời gian kết thúc</label>
            <input
              id="end"
              type="time"
              value={format(editedEvent.end, 'HH:mm')}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      <DialogFooter>
        <Button variant="destructive" onClick={onClose}>Hủy</Button>
        <Button variant="default" onClick={handleSave}>Lưu</Button>
      </DialogFooter>
      
      </DialogContent>
    </Dialog>
  );
};

export default EditDialog;
