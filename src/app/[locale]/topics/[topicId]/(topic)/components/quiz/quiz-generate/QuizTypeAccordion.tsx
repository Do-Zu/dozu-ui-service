'use client';

import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const QUIZ_TYPES = [
  {
    key: 'initial',
    label: 'Initial',
    color: 'bg-blue-600',
    summary: 'All available questions',
    detail: (
      <>
        Includes all questions in this topic, regardless of learning history.
        <br />
        <br />
        <b>Use when:</b>
        <ul className="mt-1 list-disc pl-5">
          <li>Starting a topic for the first time</li>
          <li>Practicing freely without restrictions</li>
        </ul>
      </>
    ),
  },
  {
    key: 'new',
    label: 'New',
    color: 'bg-purple-600',
    summary: 'Not practiced yet',
    detail: (
      <>
        Questions without any spaced-repetition record.
        <br />
        <br />
        <b>Use when:</b>
        <ul className="mt-1 list-disc pl-5">
          <li>You just added new questions</li>
          <li>You want first exposure before review</li>
        </ul>
      </>
    ),
  },
  {
    key: 'learning',
    label: 'Learning',
    color: 'bg-indigo-600',
    summary: 'In progress',
    detail: (
      <>
        Questions currently in the learning phase of the SM-2 algorithm.
        <br />
        <br />
        <b>Use when:</b>
        <ul className="mt-1 list-disc pl-5">
          <li>Building memory</li>
          <li>Your confidence is still unstable</li>
        </ul>
      </>
    ),
  },
  {
    key: 'review',
    label: 'Review',
    color: 'bg-green-600',
    summary: 'Due for review',
    detail: (
      <>
        Questions scheduled for review based on SM-2 intervals.
        <br />
        <br />
        Best for long-term retention and memory reinforcement.
      </>
    ),
  },
  {
    key: 'weak',
    label: 'Weak',
    color: 'bg-yellow-600',
    summary: 'Need more practice',
    detail: (
      <>
        Questions with a low easiness factor.
        <br />
        <br />
        Focuses on concepts you repeatedly struggle with and helps stabilize them.
      </>
    ),
  },
  {
    key: 'wrong',
    label: 'Wrong',
    color: 'bg-red-600',
    summary: 'Answered incorrectly',
    detail: (
      <>
        Questions you answered incorrectly and are currently in the relearning state.
        <br />
        <br />
        Ideal for fixing mistakes early and preventing repeated errors.
      </>
    ),
  },
];

export default function QuizTypeAccordion() {
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {QUIZ_TYPES.map((item) => {
        const open = openKey === item.key;

        return (
          <div
            key={item.key}
            className="rounded-lg border bg-background"
          >
            <button
              onClick={() => setOpenKey(open ? null : item.key)}
              className="flex w-full items-center justify-between px-4 py-3 text-left"
            >
              <div className="flex items-center gap-3">
                {/* Fixed-size badge */}
                <span
                  className={cn(
                    'flex h-7 w-24 items-center justify-center rounded-md text-xs font-semibold text-white',
                    item.color
                  )}
                >
                  {item.label}
                </span>

                <span className="text-sm text-muted-foreground">
                  {item.summary}
                </span>
              </div>

              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform text-muted-foreground',
                  open && 'rotate-180'
                )}
              />
            </button>

            {open && (
              <div className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
