'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Meh, Smile, Laugh } from 'lucide-react';

type ConfidenceLevel = 1 | 2 | 3;

type Props = {
  value?: ConfidenceLevel;
  onSelect: (v: ConfidenceLevel) => void;
};

const CONFIDENCE_OPTIONS: Record<
  ConfidenceLevel,
  {
    label: string;
    description: string;
    icon: JSX.Element;
  }
> = {
  1: {
    label: 'Recognized',
    description: 'You recognize the concept, but still feel uncertain.',
    icon: <Meh className="w-5 h-5 text-orange-500" />,
  },
  2: {
    label: 'Understood',
    description: 'You understand the concept and answered confidently.',
    icon: <Smile className="w-5 h-5 text-blue-500" />,
  },
  3: {
    label: 'Mastered',
    description: 'You have fully mastered this concept.',
    icon: <Laugh className="w-5 h-5 text-green-500" />,
  },
};

export default function QuizConfidenceSelector({ value, onSelect }: Props) {
  const LEVELS: ConfidenceLevel[] = [1, 2, 3];

  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground mb-3">
        How confident are you?
      </p>

      <TooltipProvider>
        <div className="grid grid-cols-3 gap-3">
          {LEVELS.map((level) => {
            const option = CONFIDENCE_OPTIONS[level];
            const isActive = value === level;

            return (
              <Tooltip key={level}>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    onClick={() => onSelect(level)}
                    className={cn(
                      'h-auto flex flex-col items-center justify-center gap-2 py-4',
                      isActive && 'ring-2 ring-primary'
                    )}
                  >
                    {option.icon}
                    <span className="text-sm font-medium">
                      {option.label}
                    </span>
                  </Button>
                </TooltipTrigger>

                <TooltipContent side="top">
                  <p className="text-xs max-w-[220px] text-center">
                    {option.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
