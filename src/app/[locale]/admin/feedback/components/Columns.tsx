'use client';

import { ColumnDef } from '@tanstack/react-table';
import type { AdminFeedbackItem, FeedbackCategory, FeedbackStatus } from '@/types/feedback-admin/feedback';
import { ScoreCell } from '@/app/[locale]/admin/feedback/components/score-cell';
import { FeedbackContentCell } from '@/app/[locale]/admin/feedback/components/feedback-content-cell';
import { StatusSelect } from '@/app/[locale]/admin/feedback/components/status-select';
import { CategorySelect } from '@/app/[locale]/admin/feedback/components/category-select';
import { FeedbackRowActions } from '@/app/[locale]/admin/feedback/components/row-actions';

export function getFeedbackColumns(opts: {
  onUpdate: (feedbackId: number, payload: { status?: FeedbackStatus; category?: FeedbackCategory | null }) => void;
}): ColumnDef<AdminFeedbackItem>[] {
  return [
    {
      id: 'score',
      header: 'Score',
      cell: ({ row }) => <ScoreCell score={row.original.score} hasImage={row.original.hasImage} />,
    },
    {
      accessorKey: 'message',
      header: 'Feedback',
      cell: ({ row }) => (
        <FeedbackContentCell
          message={row.original.message}
          createdAt={row.original.createdAt}
          userEmail={row.original.userEmail}
          userName={row.original.userName}
          userId={row.original.userId}
          imageUrl={row.original.imageUrl}
          reasons={row.original.reasons}
        />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <StatusSelect
          value={row.original.status}
          onChange={(status) => opts.onUpdate(row.original.feedbackId, { status })}
        />
      ),
    },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => (
        <CategorySelect
          value={row.original.category}
          onChange={(category) => opts.onUpdate(row.original.feedbackId, { category })}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <FeedbackRowActions
          onSetStatus={(status) => opts.onUpdate(row.original.feedbackId, { status })}
        />
      ),
    },
  ];
}
