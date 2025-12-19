import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { FeedbackCategory, FeedbackStatus, GetAdminFeedbackQuery } from '@/types/feedback-admin/feedback';
import { Filter } from 'lucide-react';

const statusOptions: FeedbackStatus[] = ['new', 'reviewed', 'ignored', 'resolved'];
const categoryOptions: FeedbackCategory[] = ['bug', 'feature', 'praise', 'other'];

type Props = {
    filters: GetAdminFeedbackQuery;
    setFilters: (updater: (prev: GetAdminFeedbackQuery) => GetAdminFeedbackQuery) => void;

    searchDraft: string;
    setSearchDraft: (v: string) => void;

    total: number;

    onApplySearch: () => void;
    onReset: () => void;
};

export function FeedbackFilterBar({
    filters,
    setFilters,
    searchDraft,
    setSearchDraft,
    total,
    onApplySearch,
    onReset,
}: Props) {
    return (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filters</span>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={Boolean(filters.importantOnly)}
                        onCheckedChange={(v) => setFilters((p) => ({ ...p, importantOnly: Boolean(v), page: 1 }))}
                        id="importantOnly"
                    />
                    <label htmlFor="importantOnly" className="text-sm text-muted-foreground">
                        Hide spam (score ≥ 3)
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={Boolean(filters.hasImage)}
                        onCheckedChange={(v) => setFilters((p) => ({ ...p, hasImage: v === true ? true : undefined, page: 1 }))}
                        id="hasImage"
                    />
                    <label htmlFor="hasImage" className="text-sm text-muted-foreground">
                        Has image
                    </label>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, minScore: 4, maxScore: undefined, page: 1 }))}>
                        ⭐ score ≥ 4
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, minScore: 2, maxScore: 3, page: 1 }))}>
                        ⚠️ 2–3
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setFilters((p) => ({ ...p, minScore: undefined, maxScore: 1, page: 1 }))}>
                        💤 ≤ 1
                    </Button>
                    <Button variant="ghost" size="sm" onClick={onReset}>
                        Reset
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                    <Input
                        className="w-[320px]"
                        placeholder="Search: bug, login, payment, email…"
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onApplySearch();
                        }}
                    />
                    <Button variant="secondary" onClick={onApplySearch}>
                        Apply
                    </Button>
                </div>

                <Select
                    value={filters.status ?? 'all'}
                    onValueChange={(v) => setFilters((p) => ({ ...p, status: v === 'all' ? undefined : (v as FeedbackStatus), page: 1 }))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All status</SelectItem>
                        {statusOptions.map((s) => (
                            <SelectItem key={s} value={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={filters.category ?? 'all'}
                    onValueChange={(v) => setFilters((p) => ({ ...p, category: v === 'all' ? undefined : (v as FeedbackCategory), page: 1 }))}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categoryOptions.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="text-sm text-muted-foreground">Total: {total}</div>
            </div>
        </div>
    );
}
