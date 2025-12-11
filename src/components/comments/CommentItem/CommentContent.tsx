'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X as XIcon } from 'lucide-react';
import { renderMarkdown } from '../utils/markdown';

interface CommentContentProps {
    content: string;
    isEditing: boolean;
    updatedAt: Date | string | null;
    createdAt: Date | string;
    onSaveEdit: (content: string) => Promise<void>;
    onCancelEdit: () => void;
    updating: boolean;
}

export default function CommentContent({
    content,
    isEditing,
    updatedAt,
    createdAt,
    onSaveEdit,
    onCancelEdit,
    updating,
}: CommentContentProps) {
    const [editContent, setEditContent] = useState(content);
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto focus and resize textarea when entering edit mode
    useEffect(() => {
        if (isEditing && editTextareaRef.current) {
            editTextareaRef.current.focus();
            editTextareaRef.current.style.height = 'auto';
            editTextareaRef.current.style.height = `${editTextareaRef.current.scrollHeight}px`;
        }
    }, [isEditing]);

    // Update editContent when comment content changes
    useEffect(() => {
        if (!isEditing) {
            setEditContent(content);
        }
    }, [content, isEditing]);

    const handleSave = async () => {
        if (!editContent.trim() || updating || editContent === content) return;
        await onSaveEdit(editContent.trim());
    };

    if (isEditing) {
        return (
            <div className="space-y-2">
                <Textarea
                    ref={editTextareaRef}
                    value={editContent}
                    onChange={(e) => {
                        setEditContent(e.target.value);
                        // Auto resize
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            onCancelEdit();
                        } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                            e.preventDefault();
                            handleSave();
                        }
                    }}
                    className="min-h-[100px] text-sm"
                    disabled={updating}
                />
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!editContent.trim() || updating || editContent === content}
                    >
                        <Check className="h-4 w-4 mr-1" />
                        Lưu
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onCancelEdit}
                        disabled={updating}
                    >
                        <XIcon className="h-4 w-4 mr-1" />
                        Hủy
                    </Button>
                </div>
            </div>
        );
    }

    const isEdited = updatedAt && updatedAt !== createdAt;

    return (
        <div className="mb-2">
            <div
                className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert"
                style={{ 
                    resize: 'none',
                    overflow: 'visible',
                    display: 'block',
                    minHeight: 'auto',
                    height: 'auto'
                }}
                dangerouslySetInnerHTML={{
                    __html: renderMarkdown(content),
                }}
            />
            {isEdited && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 italic">
                    (Đã chỉnh sửa)
                </p>
            )}
        </div>
    );
}
