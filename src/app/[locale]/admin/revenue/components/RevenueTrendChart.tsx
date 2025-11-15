'use client';

import { useState } from 'react';
import { Period } from '@/types/revenue';
import { formatVND } from '@/utils/formatters';

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
            <div className="relative pl-20">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pl-20">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="border-t border-dashed border-muted" />
                    ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-muted-foreground w-16 pr-2 text-right">
                    {[
                        formatVND(maxRevenue),
                        formatVND(Math.floor(maxRevenue * 0.75)),
                        formatVND(Math.floor(maxRevenue * 0.5)),
                        formatVND(Math.floor(maxRevenue * 0.25)),
                        '0 VND',
                    ].map((value, i) => (
                        <span key={i} className="whitespace-nowrap">{value}</span>
                    ))}
                </div>

                {/* Chart Container */}
                <div className="relative h-80">
                    {/* SVG Area Chart */}
                    <svg 
                        className="w-full h-full" 
                        viewBox="0 0 1000 320"
                        preserveAspectRatio="none"
                    >
                        {/* Generate area path */}
                        <defs>
                            <linearGradient id="revenueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        {data.length > 0 && (() => {
                            const width = 1000;
                            const height = 320;
                            const stepX = data.length > 1 ? width / (data.length - 1) : width;
                            
                            let pathData = '';
                            
                            // Start from first point
                            const firstY = height - (data[0].revenue / maxRevenue) * height;
                            pathData += `M 0 ${firstY} `;
                            
                            // Draw line to each point
                            data.forEach((item, i) => {
                                const x = data.length > 1 ? i * stepX : width / 2;
                                const y = height - (item.revenue / maxRevenue) * height;
                                pathData += `L ${x} ${y} `;
                            });
                            
                            // Close the area
                            pathData += `L ${width} ${height} L 0 ${height} Z`;
                            
                            return <path d={pathData} fill="url(#revenueGradient)" />;
                        })()}

                        {/* Line */}
                        {data.length > 0 && (() => {
                            const width = 1000;
                            const height = 320;
                            const stepX = data.length > 1 ? width / (data.length - 1) : width;
                            
                            let pathData = '';
                            
                            // Start from first point
                            const firstY = height - (data[0].revenue / maxRevenue) * height;
                            pathData += `M 0 ${firstY} `;
                            
                            // Draw line to each point
                            data.forEach((item, i) => {
                                const x = data.length > 1 ? i * stepX : width / 2;
                                const y = height - (item.revenue / maxRevenue) * height;
                                pathData += `L ${x} ${y} `;
                            });
                            
                            return <path d={pathData} fill="none" stroke="rgb(59, 130, 246)" strokeWidth="2" />;
                        })()}

                        {/* Data points */}
                        {data.map((item, i) => {
                            const width = 1000;
                            const height = 320;
                            const stepX = data.length > 1 ? width / (data.length - 1) : width / 2;
                            const x = i * stepX;
                            const y = height - (item.revenue / maxRevenue) * height;
                            const isHovered = hoveredIndex === i;

                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
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
                                left: `${data.length > 1 ? (hoveredIndex / (data.length - 1)) * 100 : 50}%`,
                                top: `${100 - (data[hoveredIndex].revenue / maxRevenue) * 100}%`,
                                transform: 'translate(-50%, -120%)',
                            }}
                        >
                            <div className="text-xs text-muted-foreground">
                                {formatPeriodLabel(data[hoveredIndex].period)}
                            </div>
                            <div className="text-lg font-bold">
                                {formatVND(data[hoveredIndex].revenue)}
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
                        {formatVND(data.reduce((sum, d) => sum + d.revenue, 0))}
                    </div>
                </div>
                <div>
                    <div className="text-sm text-muted-foreground">Average</div>
                    <div className="text-xl font-bold">
                        {formatVND(Math.round(data.reduce((sum, d) => sum + d.revenue, 0) / data.length))}
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

