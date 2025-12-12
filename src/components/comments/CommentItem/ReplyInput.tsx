'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, X } from 'lucide-react';
import { useAuth } from '@/contexts/auth/AuthContext';
import { getInitials } from '../utils/format';
import { useTranslations } from 'next-intl';

interface ReplyInputProps {
    onReply: (content: string) => Promise<void>;
    onCancel: () => void;
}

export default function ReplyInput({ onReply, onCancel }: ReplyInputProps) {
    const t = useTranslations('classBased.comment');
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
        <div className="mt-2 w-full">
            <div className="flex items-start gap-2 w-full">
                <Avatar className="h-6 w-6 flex-shrink-0">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.username || 'User'} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                        {getInitials(user?.fullName || null, user?.username || '')}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 relative w-full min-w-0">
                    <Textarea
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder={t('placeholders.writeReply')}
                        className="min-h-[60px] text-sm pr-12 w-full"
                        disabled={replying}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                    />
                    <div className="absolute bottom-2 right-2 flex items-center gap-1">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={handleSubmit}
                            disabled={!replyContent.trim() || replying}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
