'use client';

import { Badge } from '@/components/ui/badge';

interface StatusBreakdownProps {
    data: { status: string; count: number }[];
}

export function StatusBreakdownChart({ data }: StatusBreakdownProps) {
    const total = data.reduce((sum, item) => sum + item.count, 0);

    const statusColors: Record<string, string> = {
        active: 'bg-green-500',
        trialing: 'bg-blue-500',
        cancelled: 'bg-red-500',
        expired: 'bg-gray-500',
        pending: 'bg-yellow-500',
        suspended: 'bg-orange-500',
    };

    const statusLabels: Record<string, string> = {
        active: 'Active',
        trialing: 'Trial',
        cancelled: 'Cancelled',
        expired: 'Expired',
        pending: 'Pending',
        suspended: 'Suspended',
    };

    if (total === 0) {
        return <div className="text-center text-muted-foreground py-8">No data available</div>;
    }

    return (
        <div className="space-y-4">
            {/* Bar Chart */}
            <div className="space-y-2">
                {data.map((item) => {
                    const percentage = ((item.count / total) * 100).toFixed(1);
                    return (
                        <div key={item.status} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                                <span className="capitalize">{statusLabels[item.status] || item.status}</span>
                                <span className="font-medium">
                                    {item.count} ({percentage}%)
                                </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${statusColors[item.status] || 'bg-gray-400'}`}
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Total */}
            <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <span>{total}</span>
                </div>
            </div>
        </div>
    );
}

