import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedbackCategory } from '@/types/feedback-admin/feedback';

const categoryOptions: FeedbackCategory[] = ['bug', 'feature', 'praise', 'other'];

type Props = {
    value?: FeedbackCategory | null;
    onChange: (category: FeedbackCategory | null) => void;
};

export function CategorySelect({ value, onChange }: Props) {
    return (
        <Select
            value={value ?? 'unset'}
            onValueChange={(v) => {
                onChange(v === 'unset' ? null : (v as FeedbackCategory));
            }}
        >
            <SelectTrigger>
                <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="unset">(unset)</SelectItem>
                {categoryOptions.map((c) => (
                    <SelectItem key={c} value={c}>
                        {c}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
