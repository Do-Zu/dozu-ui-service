'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AtSign, Send, Bold, Italic, List, Link, Image, Smile, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface CommentInputProps {
    isReply?: boolean;
    parentId?: string;
    nodeId?: string;
    depth?: number;
    replyTo?: string;
    onSubmit?: (content: string, parentId?: string) => void;
    onCancel?: () => void;
    placeholder?: string;
    avatarUrl?: string;
    userName?: string;
    autoFocus?: boolean;
}

type ToolbarItem = {
    key: string;
    tooltip: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
    onClick: () => void;
};
export default function CommentInput({
    isReply = false,
    parentId,
    nodeId,
    depth = 0,
    replyTo,
    onSubmit,
    onCancel,
    placeholder = 'Share your thoughts...',
    avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default',
    userName = 'You',
    autoFocus = false,
}: CommentInputProps) {
    const tCommon = useTranslations('common.messages');
    const t = useTranslations('classBased.comment.input');
    const [comment, setComment] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
            setIsFocused(true);
            setIsExpanded(true);
        }
    }, [autoFocus]);

    const handleSubmit = () => {
        if (comment.trim()) {
            onSubmit?.(comment, parentId);
            setComment('');
            setIsFocused(false);
            setIsExpanded(false);
        }
    };

    const handleCancel = () => {
        setComment('');
        setIsFocused(false);
        setIsExpanded(false);
        onCancel?.();
    };

    const handleFocus = () => {
        setIsFocused(true);
        setIsExpanded(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === 'Escape') {
            handleCancel();
        }
    };

    // === Formatting helpers ===
    // TODO: Implement helper function for each item
    const toolbarItems: ToolbarItem[] = [
        {
            key: 'bold',
            tooltip: t('toolbar.bold'),
            icon: Bold,
            onClick: () => toast({ description: tCommon('featureInComing') }),
        },
        {
            key: 'italic',
            tooltip: t('toolbar.italic'),
            icon: Italic,
            onClick: () => toast({ description: tCommon('featureInComing') }),
        },
        {
            key: 'list',
            tooltip: t('toolbar.list'),
            icon: List,
            onClick: () => toast({ description: tCommon('featureInComing') }),
        },
        // {
        //     key: 'mention',
        //     tooltip: 'Mention someone',
        //     icon: AtSign,
        //     className: 'hover:bg-blue-100 text-blue-600',
        //     onClick: () => toast({ description: tCommon('featureInComing') }),
        // },
        {
            key: 'link',
            tooltip: t('toolbar.link'),
            icon: Link,
            onClick: () => toast({ description: tCommon('featureInComing') }),
        },
        // {
        //     key: 'image',
        //     tooltip: 'Add image',
        //     icon: Image,
        //     onClick: () => toast({ description: tCommon('featureInComing') }),
        // },
        // {
        //     key: 'emoji',
        //     tooltip: 'Add emoji',
        //     icon: Smile,
        //     className: 'hover:bg-yellow-100',
        //     onClick: () => toast({ description: tCommon('featureInComing') }),
        // },
    ];

    return (
        <div
            className={cn('transition-all duration-300 animate-in slide-in-from-top-2', isReply && 'mt-3')}
            style={{ marginLeft: `${depth * 24}px` }}
        >
            {/* Reply context */}
            {replyTo && (
                <div className="mb-3 p-3 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-blue-100 text-sm text-blue-800">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">{t('replyingToLabel')}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800"
                            onClick={handleCancel}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    </div>
                    <p className="mt-1 text-blue-700 italic">&quot;{replyTo.slice(0, 80)}...&quot;</p>
                </div>
            )}

            <div
                className={cn(
                    'bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-sm transition-all duration-300',
                    isFocused && 'shadow-lg shadow-blue-100/50 border-blue-200 bg-white',
                    isReply && 'bg-gradient-to-br from-blue-50/30 to-purple-50/20',
                )}
            >
                <div className="p-4">
                    <div className="flex gap-3">
                        <Avatar className="h-9 w-9 ring-2 ring-white shadow-sm">
                            <AvatarImage src={avatarUrl} alt={userName} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 font-medium text-sm">
                                {userName.charAt(0)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <Textarea
                                ref={textareaRef}
                                placeholder={placeholder}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                onFocus={handleFocus}
                                onKeyDown={handleKeyDown}
                                className={cn(
                                    'min-h-[44px] resize-none border-0 bg-transparent px-0 py-2 text-sm leading-relaxed placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0',
                                    isExpanded && 'min-h-[100px]',
                                )}
                                style={{ fontSize: '14px', lineHeight: '1.5' }}
                            />

                            {/* Expanded toolbar */}
                            {isExpanded && (
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex gap-1">
                                        {toolbarItems.map((item) => (
                                            <TooltipProvider key={item.key}>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={item.onClick}
                                                            className={cn(
                                                                'h-8 w-8 p-0 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-105',
                                                                item.className,
                                                            )}
                                                        >
                                                            <item.icon className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{item.tooltip}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        {(isReply || comment) && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancel}
                                                className="h-8 px-3 text-xs text-gray-600 hover:text-gray-800 rounded-full transition-all duration-200"
                                            >
                                                {t('buttons.cancel')}
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!comment.trim()}
                                            size="sm"
                                            className={cn(
                                                'h-8 px-4 text-xs gap-1.5 rounded-full transition-all duration-300 transform hover:scale-105 disabled:transform-none',
                                                comment.trim() ? 'bg-gradient-to-r' : 'bg-gray-100 ',
                                            )}
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                            {isReply ? t('buttons.reply') : t('buttons.comment')}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Compact mode hint */}
                            {!isExpanded && !isFocused && <div className="text-xs text-gray-400 mt-2">{t('hint')}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
