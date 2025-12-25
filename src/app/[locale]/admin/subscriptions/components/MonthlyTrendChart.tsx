'use client';

import { useState } from 'react';

interface MonthlyTrendProps {
    data: { month: string; count: number }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendProps) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    if (data.length === 0) {
        return <div className="text-center text-muted-foreground py-8">No data available</div>;
    }

    const maxCount = Math.max(...data.map((d) => d.count), 0);
    const minCount = Math.min(...data.map((d) => d.count), 0);
    
    // Dynamic visualMax based on data spread
    // When data values are close together (spread <= 2), amplify the difference
    // When data values are far apart, keep the real proportion
    const visualMax = maxCount - minCount <= 2
        ? maxCount + 1
        : maxCount;
    
    // Generate Y-axis labels without duplicates
    const yLabels = Array.from({ length: 5 }, (_, i) =>
        Math.round((visualMax / 4) * (4 - i))
    );

    return (
        <div className="space-y-6">
            {/* Chart Container */}
            <div className="relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-dashed border-muted" />
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute -left-8 inset-y-0 flex flex-col justify-between text-xs text-muted-foreground">
                    {yLabels.map((value, i) => (
                        <span key={i}>{value}</span>
                    ))}
                </div>

                {/* Bar Chart */}
                <div className="flex items-end justify-between gap-3 h-64 pt-4 pl-2">
                    {data.map((item, index) => {
                        // Calculate height based on visualMax for better scaling
                        const height = (item.count / visualMax) * 100;
                        const monthLabel = new Date(item.month + '-01').toLocaleDateString('en-US', {
                            month: 'short',
                            year: '2-digit',
                        });
                        const isHovered = hoveredIndex === index;

                        return (
                            <div
                                key={item.month}
                                className="flex-1 flex flex-col items-center gap-3 group"
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="relative w-full flex flex-col items-center justify-end h-full">
                                    {/* Value Label - Show on hover */}
                                    {isHovered && (
                                        <div className="absolute -top-8 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded shadow-lg z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                            {item.count}
                                            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-primary" />
                                        </div>
                                    )}

                                    {/* Bar */}
                                    <div
                                        className={`w-full rounded-t-lg bg-gradient-to-t from-blue-600 via-blue-500 to-purple-500 shadow-lg transition-all duration-300 ${
                                            isHovered ? 'opacity-100 scale-105' : 'opacity-90'
                                        } ${item.count === 0 ? 'opacity-30' : ''}`}
                                        style={{
                                            height: `${height}%`,
                                            minHeight: item.count > 0 ? '32px' : '8px',
                                        }}
                                    >
                                        {/* Shine effect */}
                                        <div className="h-full w-full rounded-t-lg bg-gradient-to-t from-transparent via-white/10 to-white/30" />
                                    </div>
                                </div>

                                {/* Month Label */}
                                <div
                                    className={`text-xs font-medium transition-colors ${
                                        isHovered ? 'text-foreground' : 'text-muted-foreground'
                                    }`}
                                >
                                    {monthLabel}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Total new subscriptions</div>
                    <div className="text-2xl font-bold">{data.reduce((sum, d) => sum + d.count, 0)}</div>
                </div>
                <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average per month</div>
                    <div className="text-2xl font-bold">
                        {(data.reduce((sum, d) => sum + d.count, 0) / data.length).toFixed(1)}
                    </div>
                </div>
            </div>
        </div>
    );
}

