'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { withAuth } from '@/hoc/withAuth';
import { getRequest, patchRequest, postRequest } from '@/api/api';
import type { ApiResponse } from '@/api/type';
import { ROUTES } from '@/utils/constants/routes';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { toast } from '@/hooks/use-toast';
import type {
    AdminFeedbackItem,
    AdminFeedbackListResponse,
    FeedbackCategory,
    GetAdminFeedbackQuery,
} from '@/types/feedback-admin/feedback';
import type { FeedbackStatus } from '@/types/feedback-admin/feedback';
import { RefreshCw } from 'lucide-react';

import { FeedbackFilterBar } from '@/app/[locale]/admin/feedback/components/filter-bar';
import { getFeedbackColumns } from '@/app/[locale]/admin/feedback/components/Columns';

function AdminFeedbackPage() {
    const [filters, setFilters] = useState<GetAdminFeedbackQuery>({ importantOnly: true, page: 1, limit: 50 });
    const [items, setItems] = useState<AdminFeedbackItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searchDraft, setSearchDraft] = useState('');

    const queryString = useMemo(() => {
        const params: Record<string, string> = {};
        Object.entries(filters).forEach(([k, v]) => {
            if (v === undefined || v === null || v === '') return;
            params[k] = String(v);
        });
        return new URLSearchParams(params).toString();
    }, [filters]);

    const fetchFeedback = useCallback(async () => {
        try {
            setLoading(true);
            const res: ApiResponse<AdminFeedbackListResponse> = await getRequest<unknown, AdminFeedbackListResponse>(
                ROUTES.ADMIN_FEEDBACK_LIST(queryString),
            );
            setItems(res.data?.items || []);
            setTotal(res.data?.total || 0);
        } catch (err: any) {
            toast({ description: err?.message || 'Failed to load feedback', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    }, [queryString]);

    useEffect(() => {
        fetchFeedback();
    }, [fetchFeedback]);

    const updateFeedback = async (feedbackId: number, payload: { status?: FeedbackStatus; category?: FeedbackCategory | null }) => {
        try {
            await patchRequest<typeof payload, unknown>(ROUTES.ADMIN_FEEDBACK_UPDATE(feedbackId), payload);
            toast({ description: 'Updated feedback' });
            fetchFeedback();
        } catch (err: any) {
            toast({ description: err?.message || 'Failed to update feedback', variant: 'destructive' });
        }
    };

    const runAutoIgnore = async () => {
        try {
            await postRequest<void, unknown>(ROUTES.ADMIN_FEEDBACK_AUTO_IGNORE, undefined);
            toast({ description: 'Auto-ignore executed' });
            fetchFeedback();
        } catch (err: any) {
            toast({ description: err?.message || 'Failed to run auto-ignore', variant: 'destructive' });
        }
    };

    const applySearch = () => {
        setFilters((p) => ({ ...p, search: searchDraft.trim() || undefined, page: 1 }));
    };

    const resetFilters = () => {
        setSearchDraft('');
        setFilters({ importantOnly: true, page: 1, limit: 50 });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Feedback Dashboard</h2>
                    <p className="text-muted-foreground">Default hides spam (score ≥ 3). Filter + act fast.</p>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchFeedback} disabled={loading}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh
                    </Button>
                    <Button variant="secondary" onClick={runAutoIgnore}>
                        Auto-ignore (7d)
                    </Button>
                </div>
            </div>

            <FeedbackFilterBar
                filters={filters}
                setFilters={(updater) => setFilters(updater)}
                searchDraft={searchDraft}
                setSearchDraft={setSearchDraft}
                total={total}
                onApplySearch={applySearch}
                onReset={resetFilters}
            />

            <DataTable
                columns={getFeedbackColumns({ onUpdate: updateFeedback })}
                data={items}
                loading={loading}
                title={`Feedback (${total})`}
            />
        </div>
    );
}

export default withAuth(AdminFeedbackPage, {
    requiredRole: 'admin',
});
