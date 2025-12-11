'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Edit, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface CommentActionsProps {
    isOwner: boolean;
    isEditing: boolean;
    onReply?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function CommentActions({
    isOwner,
    isEditing,
    onReply,
    onEdit,
    onDelete,
}: CommentActionsProps) {
    const t = useTranslations('classBased.comment');
    if (isEditing) return null;

    return (
        <div className="flex items-center gap-3 mt-2">
            {onReply && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-gray-600 dark:text-gray-400"
                    onClick={onReply}
                >
                    <Reply className="h-3 w-3 mr-1" />
                </Button>
            )}
            {onEdit && isOwner && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={onEdit}
                    title={t('actions.edit')}
                >
                    <Edit className="h-3.5 w-3.5" />
                </Button>
            )}
            {onDelete && isOwner && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                    onClick={onDelete}
                    title={t('actions.delete')}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </Button>
            )}
        </div>
    );
}
