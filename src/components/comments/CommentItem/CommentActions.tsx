'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Reply } from 'lucide-react';

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
                    Phản hồi
                </Button>
            )}
            {onEdit && isOwner && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-gray-600 dark:text-gray-400"
                    onClick={onEdit}
                >
                    Chỉnh sửa
                </Button>
            )}
            {onDelete && isOwner && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-red-600 dark:text-red-400"
                    onClick={onDelete}
                >
                    Xóa
                </Button>
            )}
        </div>
    );
}
