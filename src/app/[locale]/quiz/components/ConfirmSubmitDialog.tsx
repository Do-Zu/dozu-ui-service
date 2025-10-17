'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

interface ConfirmSubmitDialogProps {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

const ConfirmSubmitDialog = ({
  open,
  answeredCount,
  totalQuestions,
  loading = false,
  onCancel,
  onConfirm,
}: ConfirmSubmitDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You haven’t completed all questions</DialogTitle>
          <DialogDescription>
            You’ve only answered {answeredCount}/{totalQuestions} questions.  
            Are you sure you want to submit your quiz now?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Anyway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmSubmitDialog;
