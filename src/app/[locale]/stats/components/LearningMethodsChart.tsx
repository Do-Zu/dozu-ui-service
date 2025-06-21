import { Card, CardContent } from '@/components/ui/card';
import { useLearningMethodsDistribution } from '@/hooks/useProgress';
import { Skeleton } from '@/components/ui/skeleton';

interface LearningMethods {
  [key: string]: number;
}

interface LearningMethodsChartProps {
  methods?: LearningMethods;
}

export function LearningMethodsChart({ methods }: LearningMethodsChartProps) {
  const { data: apiMethods, loading, error } = useLearningMethodsDistribution();
  
  // Use provided methods or fetch from API
  const chartMethods = methods || (apiMethods ? 
    apiMethods.reduce((acc, item) => {
      acc[item.method.toLowerCase()] = item.percentage;
      return acc;
    }, {} as Record<string, number>) : null);
  
  if (loading && !methods) {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="aspect-square" />
        <div className="flex flex-col justify-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="w-8 h-4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !methods) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-red-500 text-sm">Failed to load learning methods data</p>
      </div>
    );
  }

  if (!chartMethods || Object.keys(chartMethods).length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <p className="text-muted-foreground text-sm">No learning methods data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="relative aspect-square">
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            {Object.entries(chartMethods).map(([method, percentage], i) => {
              const offset = Object.entries(chartMethods)
                .slice(0, i)
                .reduce((acc, [_, val]) => acc + val, 0);
              return (
                <circle
                  key={method}
                  r="15.91549430918954"
                  cx="50"
                  cy="50"
                  strokeWidth="30"
                  stroke={`hsl(${i * 90}, 70%, 50%)`}
                  strokeDasharray={`${percentage} ${100 - percentage}`}
                  strokeDashoffset={`${-offset}`}
                  fill="none"
                  className="transition-all"
                />
              );
            })}
          </svg>
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2">
        {Object.entries(chartMethods).map(([method, percentage], i) => (
          <div key={method} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: `hsl(${i * 90}, 70%, 50%)` }}
            />
            <span className="text-sm capitalize">{method}</span>
            <span className="text-sm text-muted-foreground ml-auto">{percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
