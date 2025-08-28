'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, ChevronDown, ChevronUp, ReplyIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar';
import { TooltipProvider, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { Tooltip } from '@/components/ui/tooltip';

interface CommentCardProps {
    id: string;
    author: {
        name: string;
        avatar: string;
    };
    content: string;
    timestamp: string;
    likes: number;
    hearts?: number;
    laughs?: number;
    angry?: number;
    isLiked?: boolean;
    replyCount?: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    isReply?: boolean;
    depth?: number;
    replyTo?: string;
    onFetchReply: (id: string) => void;
    onReply?: (id: string) => void;
    onReaction?: (id: string, type: 'like' | 'heart' | 'laugh' | 'angry') => void;
}

const CommentCard = ({
    id,
    author,
    content,
    timestamp,
    likes,
    isLiked = false,
    replyCount = 0,
    sentiment,
    isReply = false,
    depth = 0,
    replyTo,
    onFetchReply,

    onReply = () => {},
    onReaction = () => {},
}: CommentCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showReactions, setShowReactions] = useState(false);

    // Determine if content should be truncated
    const shouldTruncate = content?.length > 200;
    const displayContent = shouldTruncate && !isExpanded ? content.slice(0, 200) + '...' : content;

    // Determine sentiment styling
    const sentimentStyles = {
        positive: 'border-l-green-400 dark:border-l-green-500 bg-green-50/50 dark:bg-green-900/20',
        neutral: 'border-l-gray-300 dark:border-l-gray-600 bg-gray-50/30 dark:bg-gray-800/30',
        negative: 'border-l-red-400 dark:border-l-red-500 bg-red-50/50 dark:bg-red-900/20',
    }[sentiment ?? 'neutral'];

    // Role styling
    // const roleStyles = {
    //     Teacher:
    //         'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700',
    //     Student:
    //         'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
    //     Moderator:
    //         'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-700',
    //     Author: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700',
    // }[author.role];

    // Get initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    };

    // Format reactions
    const totalReactions = likes ?? 0;

    return (
        <div
            className={cn(
                'group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 mb-4 transition-all duration-300 hover:shadow-lg dark:hover:shadow-gray-900/30 border border-gray-100/50 dark:border-gray-700/50 border-[1px]',
                sentimentStyles,
            )}
            style={{ marginLeft: `${depth * 24}px` }}
        >
            {/* Reply context */}
            {replyTo && (
                <div className="mb-3 p-2 bg-gray-50/80 dark:bg-gray-700/50 rounded-lg border-l-2 border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Replying to:</span> {replyTo.slice(0, 60)}...
                </div>
            )}

            <div className="flex items-start gap-3">
                <div className="relative group/avatar">
                    <Avatar className="ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/avatar:scale-105">
                        <AvatarImage className="h-8 w-8 ring-2 rounded-full" src={author.avatar} alt={author.name} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-700 dark:text-gray-300 font-medium">
                            {getInitials(author.name)}
                        </AvatarFallback>
                    </Avatar>
                    {/* {author?.isVerified && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 dark:bg-blue-400 rounded-full flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )} */}
                </div>

                <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h4 className="font-semibold text-xs text-gray-900 dark:text-slate-500  hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                            {author.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto font-medium">
                            {timestamp}
                        </span>
                    </div>

                    {/* Content */}
                    <div className="mb-3">
                        <p className="text-gray-800 dark:text-gray-200 text-sm leading-relaxed font-normal">
                            {displayContent}
                        </p>
                        {shouldTruncate && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-xs font-medium mt-1 transition-colors flex items-center gap-1"
                            >
                                {isExpanded ? (
                                    <>
                                        Show less <ChevronUp className="h-3 w-3" />
                                    </>
                                ) : (
                                    <>
                                        Read more <ChevronDown className="h-3 w-3" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Sentiment indicator */}
                    {/* {sentiment !== 'neutral' && (
                        <div className="mb-3">
                            <span
                                className={cn(
                                    'inline-flex items-center text-xs px-2 py-1 rounded-full font-medium',
                                    sentiment === 'positive'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700',
                                )}
                            >
                                {sentiment === 'positive' ? '😊' : '😔'} {sentiment} sentiment
                            </span>
                        </div>
                    )} */}

                    {/* Actions */}
                    <div className="flex items-center gap-1 relative">
                        <TooltipProvider>
                            {/* Like button with reactions */}
                            <div className="relative">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={cn(
                                                'h-8 px-2 text-xs gap-1.5 rounded-full transition-all duration-200 hover:scale-105',
                                                isLiked
                                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                                            )}
                                            onClick={() => onReaction(id, 'like')}
                                            onMouseEnter={() => setShowReactions(true)}
                                            onMouseLeave={() => setShowReactions(false)}
                                        >
                                            <ThumbsUp className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
                                            {totalReactions > 0 && (
                                                <span className="font-medium">{totalReactions}</span>
                                            )}
                                        </Button>
                                    </TooltipTrigger>
                                </Tooltip>
                            </div>
                            {/* See replyCount button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all duration-200 hover:scale-105"
                                        onClick={() => onReply(id)}
                                    >
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {<span className="font-medium">{replyCount}</span>}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    {/* <span className="text-xs">Reply to this comment</span> */}
                                </TooltipContent>
                            </Tooltip>

                            {/* Reply button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-xs gap-1.5 text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-all duration-200 hover:scale-105"
                                        onClick={() => onFetchReply(id)}
                                    >
                                        <ReplyIcon className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">
                                    {/* <span className="text-xs">Reply to this comment</span> */}
                                </TooltipContent>
                            </Tooltip>

                            {/* More options */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-full transition-all duration-200 ml-auto opacity-0 group-hover:opacity-100"
                                    >
                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>More options</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentCard;
