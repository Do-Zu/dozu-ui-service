import { Card, CardContent } from '@/components/ui/card';
// import { useDailyStudyRecords } from '@/hooks/useProgress';
// import { Skeleton } from '@/components/ui/skeleton';

interface DailyStats {
  day: string;
  hours: number;
  date: string;
}

interface DailyStudyChartProps {
  stats?: DailyStats[];
}

const dayAbbreviations = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DailyStudyChart({ stats }: DailyStudyChartProps) {
  // const { data: apiStats, loading, error } = useDailyStudyRecords(7);
  
  // Use provided stats or fetch from API
  const chartStats = stats;
  
  /*
  if (loading && !stats) {
    return (
      <div className="flex items-end gap-2 h-[200px]">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <Skeleton className="w-full h-20" />
            <Skeleton className="w-8 h-4" />
            <Skeleton className="w-6 h-3" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-red-500 text-sm">Failed to load daily study data</p>
      </div>
    );
  }
  */

  if (!chartStats || chartStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <p className="text-muted-foreground text-sm">No study data available</p>
      </div>
    );
  }

  const maxBarHeight = Math.max(...chartStats.map(stat => stat.hours));
  
  return (
    <div className="flex items-end gap-2 h-[200px]">
      {chartStats.map((stat, i) => (
        <div key={stat.day} className="flex-1 flex flex-col items-center gap-2">
          <div 
            className="w-full bg-blue-500 rounded-sm transition-all hover:bg-blue-600" 
            style={{ 
              height: `${(stat.hours / maxBarHeight) * 160}px`,
            }}
            title={`${stat.day}: ${stat.hours} hours`}
          />
          <div className="text-sm text-muted-foreground">{dayAbbreviations[new Date(stat.date).getDay()]}</div>
          <div className="text-xs text-muted-foreground">{stat.hours}h</div>
        </div>
      ))}
    </div>
  );
}
