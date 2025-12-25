'use client';

import { cn } from '@/lib/utils';
import { HEALTH_COLOR } from './health.utils';
import { HealthLevel } from '@/app/[locale]/topics/[topicId]/(topic)/components/quiz/types/questionHealth.type';

export default function HealthBadge({ level }: { level: HealthLevel }) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-xs font-semibold capitalize',
        HEALTH_COLOR[level]
      )}
    >
      {level}
    </span>
  );
}
