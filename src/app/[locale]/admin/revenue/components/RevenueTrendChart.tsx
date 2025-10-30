'use client';

import { useState } from 'react';
import { Period } from '@/types/revenue';

interface RevenueTrendProps {
    data: { period: string; revenue: number; count: number }[];
    period: Period;
}

export function RevenueTrendChart({ data, period }: RevenueTrendProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No revenue data available</div>;
    }

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    const formatPeriodLabel = (periodStr: string) => {
        try {
            switch (period) {
                case 'day':
                    return new Date(periodStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                case 'week':
                    return `W${periodStr.split('-')[1]}`;
                case 'month':
                    return new Date(periodStr + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                case 'year':
                    return periodStr;
                default:
                    return periodStr;
            }
        } catch {
            return periodStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Area Chart */}
            <div className="relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-dashed border-muted" />
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute -left-16 inset-y-0 flex flex-col justify-between text-xs text-muted-foreground">
                    {[
                        `$${maxRevenue.toLocaleString()}`,
                        `$${Math.floor(maxRevenue * 0.75).toLocaleString()}`,
                        `$${Math.floor(maxRevenue * 0.5).toLocaleString()}`,
                        `$${Math.floor(maxRevenue * 0.25).toLocaleString()}`,
                        '$0',
                    ].map((value, i) => (
                        <span key={i}>{value}</span>
                    ))}
                </div>

                {/* Chart Container */}
                <div className="relative h-80 pl-2">
                    {/* SVG Area Chart */}
                    <svg className="w-full h-full" preserveAspectRatio="none">
                        {/* Generate area path */}
                        <defs>
                            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <path
                            d={
                                data.length > 0
                                    ? `M 0 ${100 - (data[0].revenue / maxRevenue) * 100}% ${data
                                          .map(
                                              (item, i) =>
                                                  `L ${(i / (data.length - 1 || 1)) * 100}% ${
                                                      100 - (item.revenue / maxRevenue) * 100
                                                  }%`
                                          )
                                          .join(' ')} L 100% 100% L 0 100% Z`
                                    : ''
                            }
                            fill="url(#revenueGradient)"
                        />

                        {/* Line */}
                        <path
                            d={
                                data.length > 0
                                    ? `M 0 ${100 - (data[0].revenue / maxRevenue) * 100}% ${data
                                          .map(
                                              (item, i) =>
                                                  `L ${(i / (data.length - 1 || 1)) * 100}% ${
                                                      100 - (item.revenue / maxRevenue) * 100
                                                  }%`
                                          )
                                          .join(' ')}`
                                    : ''
                            }
                            fill="none"
                            stroke="rgb(59, 130, 246)"
                            strokeWidth="2"
                        />

                        {/* Data points */}
                        {data.map((item, i) => {
                            const x = (i / (data.length - 1 || 1)) * 100;
                            const y = 100 - (item.revenue / maxRevenue) * 100;
                            const isHovered = hoveredIndex === i;

                            return (
                                <circle
                                    key={i}
                                    cx={`${x}%`}
                                    cy={`${y}%`}
                                    r={isHovered ? 6 : 4}
                                    fill="rgb(59, 130, 246)"
                                    stroke="white"
                                    strokeWidth="2"
                                    className="cursor-pointer transition-all"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                />
                            );
                        })}
                    </svg>

                    {/* Hover tooltip */}
                    {hoveredIndex !== null && data[hoveredIndex] && (
                        <div
                            className="absolute bg-popover text-popover-foreground border rounded-lg shadow-lg p-3 z-10 pointer-events-none"
                            style={{
                                left: `${(hoveredIndex / (data.length - 1 || 1)) * 100}%`,
                                top: `${100 - (data[hoveredIndex].revenue / maxRevenue) * 100}%`,
                                transform: 'translate(-50%, -120%)',
                            }}
                        >
                            <div className="text-xs text-muted-foreground">
                                {formatPeriodLabel(data[hoveredIndex].period)}
                            </div>
                            <div className="text-lg font-bold">
                                ${data[hoveredIndex].revenue.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {data[hoveredIndex].count} transactions
                            </div>
                        </div>
                    )}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between mt-2 px-2">
                    {data.map((item, i) => {
                        // Show fewer labels if too many data points
                        const showLabel = data.length <= 12 || i % Math.ceil(data.length / 12) === 0;
                        return showLabel ? (
                            <div key={i} className="text-xs text-muted-foreground">
                                {formatPeriodLabel(item.period)}
                            </div>
                        ) : null;
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-xl font-bold">
                        ${data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-xl font-bold">
                        ${(data.reduce((sum, d) => sum + d.revenue, 0) / data.length).toFixed(2)}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Total Transactions</div>
                    <div className="text-xl font-bold">{data.reduce((sum, d) => sum + d.count, 0)}</div>
                </div>
            </div>
        </div>
    );
}

