import { Button } from '@/components/ui/button';
import type { FeedbackStatus } from '@/types/feedback-admin/feedback';

type Props = {
    onSetStatus: (status: FeedbackStatus) => void;
};

export function FeedbackRowActions({ onSetStatus }: Props) {
    return (
        <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" onClick={() => onSetStatus('reviewed')}>
                Mark reviewed
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSetStatus('ignored')}>
                Ignore
            </Button>
            <Button size="sm" variant="outline" onClick={() => onSetStatus('resolved')}>
                Resolved
            </Button>
        </div>
    );
}
