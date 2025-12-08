'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getInitials } from '../utils/format';

interface ReplyInputProps {
    onReply: (content: string) => Promise<void>;
    onCancel: () => void;
}

export default function ReplyInput({ onReply, onCancel }: ReplyInputProps) {
    const { user } = useAuth();
    const [replyContent, setReplyContent] = useState('');
    const [replying, setReplying] = useState(false);

    const handleSubmit = async () => {
        if (!replyContent.trim() || replying) return;

        try {
            setReplying(true);
            await onReply(replyContent.trim());
            setReplyContent('');
        } catch (error) {
            console.error('Failed to reply:', error);
            throw error;
        } finally {
            setReplying(false);
        }
    };

    return (
        <div className="mt-3 space-y-2">
            <div className="flex items-start gap-2">
                <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || 'User'} />
                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-[10px]">
                        {getInitials(user?.fullName || null, user?.username || '')}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex items-end gap-2">
                    <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Viết phản hồi..."
                        className="min-h-[60px] text-sm"
                        disabled={replying}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={!replyContent.trim() || replying}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setReplyContent('');
                            onCancel();
                        }}
                        disabled={replying}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
