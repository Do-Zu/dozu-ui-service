import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedbackStatus } from '@/types/feedback-admin/feedback';
import { cn } from '@/lib/utils';

const statusOptions: FeedbackStatus[] = ['new', 'reviewed', 'ignored', 'resolved'];

const statusColors: Record<FeedbackStatus, string> = {
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    reviewed: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    ignored: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
    resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

type Props = {
    value: FeedbackStatus;
    onChange: (status: FeedbackStatus) => void;
};

export function StatusSelect({ value, onChange }: Props) {
    return (
        <Select value={value} onValueChange={(v) => onChange(v as FeedbackStatus)}>
            <SelectTrigger className="w-[130px] border-0 bg-transparent p-0 h-auto focus:ring-0">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium capitalize', statusColors[value])}>
                    {value}
                </span>
            </SelectTrigger>
            <SelectContent>
                {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', statusColors[s])}>
                            {s}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
