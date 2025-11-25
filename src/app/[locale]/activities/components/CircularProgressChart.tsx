'use client';

import { useTranslations } from 'next-intl';
import { PerformanceBreakdown as PerformanceBreakdownType } from '@/types/activity';

interface CircularProgressChartProps {
  performance: PerformanceBreakdownType;
}

export default function CircularProgressChart({ performance }: CircularProgressChartProps) {
  const t = useTranslations('activities');
  const { totalTerms, thuongSai, doiLucSai, itKhiSai, chuaBatDau } = performance;

  const accuracyLevels = [
    {
      name: t('termProgress.thuongSai'),
      count: thuongSai,
      percentage: (thuongSai / totalTerms) * 100,
      color: '#ef4444', // red-500
    },
    {
      name: t('termProgress.doiLucSai'),
      count: doiLucSai,
      percentage: (doiLucSai / totalTerms) * 100,
      color: '#eab308', // yellow-500
    },
    {
      name: t('termProgress.itKhiSai'),
      count: itKhiSai,
      percentage: (itKhiSai / totalTerms) * 100,
      color: '#10b981', // emerald-500
    },
    {
      name: t('termProgress.chuaBatDau'),
      count: chuaBatDau,
      percentage: (chuaBatDau / totalTerms) * 100,
      color: '#9ca3af', // gray-400
    }
  ];

  // Calculate cumulative angles for the donut chart
  let cumulativeAngle = 0;
  const segments = accuracyLevels.map(level => {
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + (level.percentage / 100) * 360;
    cumulativeAngle = endAngle;
    
    return {
      ...level,
      startAngle,
      endAngle
    };
  });

  return (
    <div className="flex items-center justify-center space-x-8">
      {/* Circular Chart */}
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {/* Progress segments */}
          {segments.map((segment, index) => {
            if (segment.percentage === 0) return null;
            
            const startAngle = segment.startAngle - 90; // Start from top
            const endAngle = segment.endAngle - 90;
            
            const radius = 40;
            const innerRadius = 30;
            
            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;
            
            const x1 = 50 + radius * Math.cos(startAngleRad);
            const y1 = 50 + radius * Math.sin(startAngleRad);
            const x2 = 50 + radius * Math.cos(endAngleRad);
            const y2 = 50 + radius * Math.sin(endAngleRad);
            
            const x3 = 50 + innerRadius * Math.cos(endAngleRad);
            const y3 = 50 + innerRadius * Math.sin(endAngleRad);
            const x4 = 50 + innerRadius * Math.cos(startAngleRad);
            const y4 = 50 + innerRadius * Math.sin(startAngleRad);
            
            const largeArcFlag = segment.percentage > 50 ? 1 : 0;
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `L ${x3} ${y3}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
              'Z'
            ].join(' ');

            return (
              <path
                key={segment.name}
                d={pathData}
                fill={segment.color}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{totalTerms}</span>
          <span className="text-sm text-gray-600">{t('termProgress.terms')}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-4">
        {accuracyLevels.map((level) => (
          <div key={level.name} className="flex items-center space-x-3">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: level.color }}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {level.count} {level.name}
                </span>
                <span className="text-sm text-gray-500">
                  ({level.percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full"
                  style={{ 
                    width: `${level.percentage}%`,
                    backgroundColor: level.color
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
