'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import HealthBadge from './HealthBadge';
import { HEALTH_ICON } from './health.utils';
import { ChevronDown } from 'lucide-react';
import { QuestionHealthDTO } from '../types/questionHealth.type';

type Props = {
  item: QuestionHealthDTO;
};

export default function QuestionHealthCard({ item }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border bg-background p-4 transition hover:shadow-sm">
      {/* HEADER */}
      <div
        className="flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="flex gap-3">
          <div className="text-xl">{HEALTH_ICON[item.healthLevel]}</div>

          <div>
            <div className="font-semibold line-clamp-2">
              {item.questionText}
            </div>

            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <HealthBadge level={item.healthLevel} />
              <span>Status: {item.status}</span>
              <span>Score: {item.healthScore}</span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={cn(
            'h-4 w-4 mt-1 transition-transform',
            open && 'rotate-180'
          )}
        />
      </div>


      {/* EXPAND */}
      {open && (
        <div className="mt-4 space-y-3 text-sm">
          {/* METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-muted-foreground">
            <div>EF: {item.metrics.easinessFactor ?? '—'}</div>
            <div>Reps: {item.metrics.repetitionNumber ?? '—'}</div>
            <div>Next review: {item.metrics.nextReview ?? '—'}</div>
          </div>

          {/* REASONS */}
          <div>
            <b>Why this health?</b>
            <ul className="mt-1 list-disc pl-5 text-muted-foreground">
              {item.reasons.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

        </div>
      )}
    </div>
  );
}
