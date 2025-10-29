'use client';

interface RevenueByGatewayProps {
    data: { gateway: string; revenue: number; count: number; percentage: number }[];
}

export function RevenueByGatewayChart({ data }: RevenueByGatewayProps) {
    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No gateway data available</div>;
    }

    const gatewayColors: Record<string, string> = {
        stripe: 'bg-purple-500',
        paypal: 'bg-blue-500',
        momo: 'bg-pink-500',
        payos: 'bg-green-500',
        sepay: 'bg-orange-500',
    };

    return (
        <div className="space-y-4">
            {data.map((gateway, index) => {
                const color = gatewayColors[gateway.gateway.toLowerCase()] || 'bg-gray-500';
                
                return (
                    <div key={gateway.gateway} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${color}`} />
                                <span className="font-medium capitalize">{gateway.gateway}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-muted-foreground">{gateway.count} txns</span>
                                <span className="font-bold">${gateway.revenue.toLocaleString()}</span>
                                <span className="text-muted-foreground min-w-[3rem] text-right">
                                    {gateway.percentage.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        
                        {/* Progress bar */}
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className={`h-full ${color} transition-all duration-500`}
                                style={{ width: `${gateway.percentage}%` }}
                            />
                        </div>
                    </div>
                );
            })}

            {/* Total */}
            <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-semibold">
                    <span>Total</span>
                    <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                            {data.reduce((sum, g) => sum + g.count, 0)} txns
                        </span>
                        <span>${data.reduce((sum, g) => sum + g.revenue, 0).toLocaleString()}</span>
                        <span className="min-w-[3rem] text-right">100%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

