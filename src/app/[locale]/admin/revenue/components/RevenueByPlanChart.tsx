'use client';

import { Badge } from '@/components/ui/badge';

interface RevenueByPlanProps {
    data: { planType: string; planName: string; revenue: number; subscriberCount: number }[];
}

export function RevenueByPlanChart({ data }: RevenueByPlanProps) {
    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No plan data available</div>;
    }

    const totalRevenue = data.reduce((sum, plan) => sum + plan.revenue, 0);

    const planColors: Record<string, string> = {
        free: 'bg-gray-500',
        pro: 'bg-gradient-to-r from-blue-600 to-purple-600',
        team: 'bg-gradient-to-r from-green-600 to-teal-600',
        enterprise: 'bg-gradient-to-r from-orange-600 to-red-600',
    };

    return (
        <div className="space-y-4">
            {data.map((plan) => {
                const percentage = totalRevenue > 0 ? (plan.revenue / totalRevenue) * 100 : 0;
                const colorClass = planColors[plan.planType.toLowerCase()] || 'bg-gray-500';

                return (
                    <div key={`${plan.planType}-${plan.planName}`} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Badge className={`${colorClass} text-white`}>
                                    {plan.planType.toUpperCase()}
                                </Badge>
                                <span className="text-muted-foreground">{plan.planName}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">
                                    {plan.subscriberCount} subs
                                </span>
                                <span className="font-bold min-w-[5rem] text-right">
                                    ${plan.revenue.toLocaleString()}
                                </span>
                                <span className="text-muted-foreground min-w-[3rem] text-right">
                                    {percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full ${colorClass} transition-all duration-500`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Total */}
            <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-semibold">
                    <span>Total MRR</span>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {data.reduce((sum, p) => sum + p.subscriberCount, 0)} subs
                        </span>
                        <span className="min-w-[5rem] text-right">
                            ${totalRevenue.toLocaleString()}
                        </span>
                        <span className="min-w-[3rem] text-right">100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

