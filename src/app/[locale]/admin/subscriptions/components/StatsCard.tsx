'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
    icon?: ReactNode;
    trend?: string;
}

export function StatsCard({ title, value, description, icon, trend }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
                {trend && <p className="text-xs text-muted-foreground mt-1">{trend}</p>}
            </CardContent>
        </Card>
    );
}

