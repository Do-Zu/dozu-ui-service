import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface KeyMetricCardProps {
  title: string;
  value: number;
  unit: string;
  change?: string;
  icon: LucideIcon;
  topText?: string;
}

export function KeyMetricCard({ title, value, unit, change, icon: Icon, topText }: KeyMetricCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2">
          <div className="text-sm text-muted-foreground">{title}</div>
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-semibold">{value}</div>
            <div className="text-sm text-muted-foreground">{unit}</div>
          </div>
          {change && (
            <div className="text-xs text-green-600">{change}</div>
          )}
          {topText && (
            <div className="text-xs text-muted-foreground">{topText}</div>
          )}
          <Icon className="h-8 w-8 text-muted-foreground/50 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
