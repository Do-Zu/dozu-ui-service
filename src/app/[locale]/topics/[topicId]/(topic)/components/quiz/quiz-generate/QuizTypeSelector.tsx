'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type QuizType = 'initial' | 'new' | 'learning' | 'review' | 'wrong' | 'weak';

interface QuizTypeSelectorProps {
  onSelectQuizType: (type: QuizType) => void;
  disabledMap?: Partial<Record<QuizType, boolean>>;
  counts?: Partial<Record<QuizType, number>>;
  loading?: boolean;
}

const LABEL_MAP: Record<QuizType, string> = {
  initial: 'Initial',
  new: 'New',
  learning: 'Learning',
  review: 'Review',
  weak: 'Weak',
  wrong: 'Wrong',
};

const TYPE_META: Record<
  QuizType,
  { description: string; accent: string }
> = {
  initial: {
    description: 'All available questions',
    accent: 'bg-blue-500',
  },
  new: {
    description: 'Not practiced yet',
    accent: 'bg-purple-500',
  },
  learning: {
    description: 'In progress',
    accent: 'bg-indigo-500',
  },
  review: {
    description: 'Due for review',
    accent: 'bg-green-500',
  },
  weak: {
    description: 'Need more practice',
    accent: 'bg-yellow-500',
  },
  wrong: {
    description: 'Answered incorrectly',
    accent: 'bg-red-500',
  },
};

export default function QuizTypeSelector({
  onSelectQuizType,
  disabledMap = {},
  counts = {},
  loading = false,
}: QuizTypeSelectorProps) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.06,
          },
        },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {(Object.keys(LABEL_MAP) as QuizType[]).map((type) => {
        const disabled = Boolean(disabledMap[type]) || loading;
        const count = counts[type] ?? 0;
        const meta = TYPE_META[type];

        return (
          <motion.button
            key={type}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0 },
            }}
            whileHover={!disabled ? { y: -4 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            onClick={() => !disabled && onSelectQuizType(type)}
            disabled={disabled}
            className={cn(
              'relative rounded-xl border bg-background p-4 text-left transition-all',
              'hover:shadow-md focus:outline-none',
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            )}
          >
            {/* accent bar */}
            <div className={cn('absolute left-0 top-0 h-full w-1 rounded-l-xl', meta.accent)} />

            <div className="pl-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-base">
                  {LABEL_MAP[type]}
                </div>
                <div className="text-sm text-muted-foreground">
                  {loading ? '…' : count}
                </div>
              </div>

              <div className="mt-1 text-sm text-muted-foreground">
                {meta.description}
              </div>
            </div>
          </motion.button>
        );
      })}
    </motion.div>
  );
}
