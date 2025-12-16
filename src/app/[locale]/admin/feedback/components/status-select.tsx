import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedbackStatus } from '@/types/feedback-admin/feedback';

const statusOptions: FeedbackStatus[] = ['new', 'reviewed', 'ignored', 'resolved'];

type Props = {
    value: FeedbackStatus;
    onChange: (status: FeedbackStatus) => void;
};

export function StatusSelect({ value, onChange }: Props) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as FeedbackStatus)}>
            <SelectTrigger>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                        {s}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
