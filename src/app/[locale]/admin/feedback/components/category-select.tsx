import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedbackCategory } from '@/types/feedback-admin/feedback';
import { cn } from '@/lib/utils';

const categoryOptions: FeedbackCategory[] = ['bug', 'feature', 'praise', 'other'];

const categoryColors: Record<FeedbackCategory | 'unset', string> = {
    bug: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    feature: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    praise: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    other: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    unset: 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500',
};

type Props = {
    value?: FeedbackCategory | null;
    onChange: (category: FeedbackCategory | null) => void;
};

export function CategorySelect({ value, onChange }: Props) {
    const currentValue = value ?? 'unset';

    return (
        <Select
            value={currentValue}
            onValueChange={(v) => {
                onChange(v === 'unset' ? null : (v as FeedbackCategory));
            }}
        >
            <SelectTrigger className="w-[120px] border-0 bg-transparent p-0 h-auto focus:ring-0">
                <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium capitalize', categoryColors[currentValue])}>
                    {currentValue === 'unset' ? '—' : currentValue}
                </span>
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="unset">
                    <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', categoryColors.unset)}>
                        (unset)
                    </span>
                </SelectItem>
                {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium capitalize', categoryColors[c])}>
                            {c}
                        </span>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
