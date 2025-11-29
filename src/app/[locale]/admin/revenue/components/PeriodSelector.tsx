'use client';

import { Button } from '@/components/ui/button';
import { Period } from '@/types/revenue';

interface PeriodSelectorProps {
    selected: Period;
    onChange: (period: Period) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
    const periods: { value: Period; label: string }[] = [
        { value: 'day', label: 'Daily' },
        { value: 'week', label: 'Weekly' },
        { value: 'month', label: 'Monthly' },
        { value: 'year', label: 'Yearly' },
    ];

    return (
        <div className="flex gap-2 bg-muted p-1 rounded-lg">
            {periods.map((period) => (
                <Button
                    key={period.value}
                    variant={selected === period.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onChange(period.value)}
                    className="transition-all"
                >
                    {period.label}
                </Button>
            ))}
        </div>
    );
}

