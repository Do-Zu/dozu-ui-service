'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { ReactNode } from 'react';

interface KPICardProps {
    title: string;
    value: string | number;
    description: string;
    icon?: ReactNode;
    trend?: string;
    trendUp?: boolean;
    subtitle?: string;
}

export function KPICard({ title, value, description, icon, trend, trendUp, subtitle }: KPICardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                
                {trend && (
                    <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                        trendUp ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {trendUp ? (
                            <TrendingUp className="h-4 w-4" />
                        ) : (
                            <TrendingDown className="h-4 w-4" />
                        )}
                        <span>{trend}</span>
                        <span className="text-muted-foreground text-xs">vs last period</span>
                    </div>
                )}
                
                {subtitle && !trend && (
                    <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                )}
            </CardContent>
        </Card>
    );
}

