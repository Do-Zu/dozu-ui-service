'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth/AuthContext';
import { toast } from '@/hooks/use-toast';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    useGetCommentsByNode,
    useCreateComment,
    IClassTopicComment,
    useGetCommentReplies,
} from '@/services/class-based-learning/comment';
import { TypeNodeComment } from '@/app/[locale]/class-based/types/class.type';
import CommentThreadSkeleton from './SkeletonCard';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userRole: 'Teacher' | 'Student' | 'Moderator' | 'Author';
    userAvatar: string;
    content: string;
    timestamp: string | Date;
    likes: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    isTopComment?: boolean;
    isVerified?: boolean;
    replyCount?: number;
    replies?: Comment[];
    parentId?: string;
    depth?: number;
    page: number;
}

interface CommentThreadProps {
    comments?: Comment[];
    nodeId: string;
    nodeTitle?: string;
    classId: string | number;
    topicId: string | number;
    filterType?: 'all' | 'top' | 'recent';
    typeNode: TypeNodeComment;
    triggerText?: string;
    showTrigger?: boolean;
    triggerComponent?: React.ReactNode;
    className?: string;
}

const CommentThread = ({
    comments: initialComments = [],
    className,
    nodeId,
    nodeTitle,
    typeNode,
    classId,
    topicId,
    filterType = 'all',
    triggerText,
    showTrigger = true,
    triggerComponent,
}: CommentThreadProps) => {
    const t = useTranslations('classBased.comment');
    const { user, isAuthenticated } = useAuth();

    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);
    const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

    // Infinite scroll pagination state
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 20; // page size constant
    const [hasMore, setHasMore] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const isLoadingRef = useRef(false); // prevents overlapping fetches

    const {
        execute: fetchComments,
        data: apiCommentsData,
        loading: fetchingComments,
        error: fetchCommentsError,
    } = useGetCommentsByNode(classId || '', topicId || '');

    const {
        execute: fetchReplyComments,
        data: apiReplyCommentsData,
        loading: isFetchingReplyComment,
        error: fetchReplyCommentsError,
    } = useGetCommentReplies(classId || '', topicId || '');

    const {
        execute: createNewComment,
        loading: creatingComment,
        error: createCommentError,
    } = useCreateComment(classId || '', topicId || '', {
        onSuccess: ({ data: newComment }: { data: IClassTopicComment }) => {
            const formattedComment = handleFormatComment(newComment);

            if (newComment.parentCmtId) {
                // Handle adding reply to existing comment
                const updatedComments = addReplyToComment(comments, newComment.parentCmtId as string, formattedComment);

                setComments(updatedComments);
            } else {
                // Handle adding new top-level comment
                setComments((prev) => [...prev, formattedComment]);
            }

            setIsAddCommentDialogOpen(false);
        },
        onMessageSuccess: () => {
            toast({ description: t('toast.sent') });
        },
        onError: () => {
            toast({ description: t('toast.failedCreate') });
        },
    });

    const handleAddComment = async (content: string) => {
        if (!classId || !topicId || !nodeId) {
            toast({ description: t('toast.missingParams') });
            return;
        }

        if (!isAuthenticated || !user) {
            toast({ description: t('toast.mustLogin') });
            return;
        }

        try {
            await createNewComment({
                nodeId,
                typeNode,
                content,
                topicId,
                author: {
                    user_id: parseInt(user.userId as string),
                    name: user.fullName || user.username,
                    avatar: user.avatarUrl,
                },
            });
        } catch (error) {
            toast({ description: t('toast.failedCreate') });
        }
    };

    const compareIgnoreDigit = (a: string | number, b: string | number) => {
        try {
            return a.toString().trim() === b.toString().trim();
        } catch (error) {
            return false;
        }
    };

    // Helper function to add reply at any depth
    const addReplyToComment = (
        comments: Comment[],
        targetId: string,
        newReply: Comment | Comment[],
        isReplace = false,
    ): Comment[] => {
        return comments.map((comment) => {
            if (compareIgnoreDigit(comment.id, targetId)) {
                if (Array.isArray(newReply)) {
                    return {
                        ...comment,
                        replies: isReplace ? [...newReply] : [...(comment.replies || []), ...newReply],
                        replyCount: isReplace ? comment.replyCount || 0 : (comment.replyCount || 0) + newReply.length,
                    };
                }

                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
                    replyCount: (comment.replyCount || 0) + 1,
                };
            }

            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: addReplyToComment(comment.replies, targetId, newReply),
                };
            }
            return comment;
        });
    };

    // Helper function to find comment depth
    const findCommentDepth = (comments: Comment[], targetId: string, currentDepth = 0): number => {
        for (const comment of comments) {
            if (comment.id === targetId) {
                return currentDepth;
            }
            if (comment.replies && comment.replies.length > 0) {
                const depth = findCommentDepth(comment.replies, targetId, currentDepth + 1);
                if (depth !== -1) return depth;
            }
        }
        return -1;
    };

    // Helper function to find parent comment content for context
    const findCommentContent = (comments: Comment[], targetId: string): string => {
        for (const comment of comments) {
            if (comment.id === targetId) {
                return comment.content;
            }
            if (comment.replies && comment.replies.length > 0) {
                const content = findCommentContent(comment.replies, targetId);
                if (content) return content;
            }
        }
        return '';
    };

    const handleAddReply = async (commentId: string, content: string) => {
        if (!isAuthenticated || !user) {
            toast({ description: t('toast.mustLogin') });
            return;
        }

        try {
            await createNewComment({
                nodeId: nodeId,
                typeNode,
                content,
                topicId,
                parentCmtId: commentId,
                author: {
                    user_id: parseInt(user.userId as string),
                    name: user.fullName || user.username,
                    avatar: user.avatarUrl,
                },
            });
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to create reply:', error);
        }
    };

    // Helper function to update reactions at any depth
    const updateReactionInComments = (
        comments: Comment[],
        targetId: string,
        reactionType: 'like' | 'heart' | 'laugh' | 'angry',
    ): Comment[] => {
        return comments.map((comment) => {
            if (comment.id === targetId) {
                return {
                    ...comment,
                    [reactionType === 'like' ? 'likes' : `${reactionType}s`]:
                        (comment[reactionType === 'like' ? 'likes' : (`${reactionType}s` as keyof Comment)] as number) +
                        1,
                };
            }
            if (comment.replies && comment.replies.length > 0) {
                return {
                    ...comment,
                    replies: updateReactionInComments(comment.replies, targetId, reactionType),
                };
            }
            return comment;
        });
    };

    const handleReaction = (commentId: string, reactionType: 'like' | 'heart' | 'laugh' | 'angry') => {
        //TODO: Reaction for comment
        toast({ description: t('toast.comingSoon') });
        // const updatedComments = updateReactionInComments(comments, commentId, reactionType);
        // setComments(updatedComments);
    };

    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
    };

    const renderReplyComment = (comment: Comment) => {
        return (
            <>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4">
                        {comment.replies.map((reply, replyIndex) => renderComment(reply, replyIndex))}
                    </div>
                )}
            </>
        );
    };

    // Fetch replies for a parent comment (moved above renderComment for scope)
    const handleFetchReplyComment = async (parentCmtId: string | number) => {
        try {
            const response = await fetchReplyComments({ parentCmtId, nodeId, typeNode, page: 1, limit: 20 });
            if (response && response.data) {
                const formatted: Comment[] = response.data.map((c: IClassTopicComment) => handleFormatComment(c));
                setComments((prev) => addReplyToComment(prev, parentCmtId.toString(), formatted, true));
            }
        } catch (e) {
            toast({
                description: t('toast.failedLoadReplies'),
            });
        }
    };

    // Recursive function to render comments and their nested replies
    const renderComment = (comment: Comment, index: number) => {
        const parentContent = comment.parentId ? findCommentContent(comments, comment.parentId) : undefined;

        //Attach the infinite-scroll sentinel to the second-to-last comment so we prefetch the next page
        //before the user reaches the end (only when more pages are available).
        const isLoadingMoreRefItem = index === comments.length - 2 && hasMore;

        return (
            <div key={comment.id} className="space-y-4">
                <div
                    ref={isLoadingMoreRefItem ? loadMoreRef : null}
                    className="animate-in slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <CommentCard
                        id={comment.id}
                        author={{
                            name: comment.userName,
                            avatar: comment.userAvatar,
                        }}
                        content={comment.content}
                        timestamp={comment.timestamp}
                        likes={comment.likes}
                        sentiment={comment.sentiment}
                        replyCount={comment.replyCount}
                        depth={comment.depth}
                        replyTo={parentContent}
                        onFetchReply={() => handleFetchReplyComment(comment.id)}
                        onReply={handleReply}
                        onReaction={(id, type) => handleReaction(id, type)}
                    />
                </div>

                {/* Reply input */}
                {replyingTo === comment.id && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <CommentInput
                            onSubmit={(content) => handleAddReply(comment.id, content)}
                            onCancel={() => setReplyingTo(null)}
                            placeholder={t('placeholders.reply')}
                            isReply
                            depth={comment.depth || 0}
                            replyTo={comment.content}
                            autoFocus
                            avatarUrl={user?.avatarUrl}
                        />
                    </div>
                )}

                {/* Nested replies */}
                {renderReplyComment(comment)}
            </div>
        );
    };

    const renderListComment = () => {
        //Condition for append skeleton loading
        const isLoadingComment = (fetchingComments && !fetchCommentsError) || isAppending;
        return (
            <div>
                {!isLoadingComment && comments.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-blue-700/50">
                            <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700 mb-2">
                            {t('noCommentsTitle')}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">{t('noCommentsBody')}</p>
                        <Button onClick={() => setIsAddCommentDialogOpen(true)} className="bg-gradient-to-r">
                            {t('startDiscussion')}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {comments.map((comment, index) => renderComment(comment, index))}

                        {isLoadingComment && <CommentThreadSkeleton amount={1} />}

                        {!hasMore && comments.length > 0 && (
                            <p className="text-center text-xs text-muted-foreground py-2">{t('loadMoreNone')}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderCommentsContent = () => {
        return (
            <div className="max-w-5xl mx-auto rounded-2xl p-6 ">
                <div className="relative mb-8">
                    <div className="relative backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/20 dark:border-gray-700/30 shadow-lg dark:shadow-gray-900/10 bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center shadow-lg">
                                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
                                        {t('title')}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {t('subtitle', { title: nodeTitle ?? '' })}
                                    </p>
                                </div>
                            </div>

                            {/* Proactive Action Buttons */}

                            <Dialog open={isAddCommentDialogOpen} onOpenChange={setIsAddCommentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="shadow-lg dark:shadow-gray-900/10 dark:hover:shadow-gray-900/10 transition-all duration-300 transform hover:scale-105 gap-2">
                                        <Plus className="h-4 w-4" />
                                        {t('actions.comment')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]  ">
                                    <DialogHeader>
                                        <DialogTitle className="text-lg font-semibold text-muted-foreground">
                                            {t('subtitle', { title: nodeTitle ?? '' })}
                                        </DialogTitle>
                                    </DialogHeader>
                                    <CommentInput
                                        onSubmit={handleAddComment}
                                        placeholder={t('placeholders.root')}
                                        nodeId={nodeId}
                                        avatarUrl={user?.avatarUrl}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    {renderListComment()}
                </div>
            </div>
        );
    };

    const handleFormatComment = (comment: IClassTopicComment): Comment => {
        return {
            id: comment.commentId.toString(),
            userId: comment.author.user_id.toString(),
            userName: comment.author.name,
            userRole: 'Student',
            userAvatar: comment.author.avatar,
            content: comment.content,
            timestamp: comment.createdAt,
            likes: comment.reactionCount,
            sentiment: 'neutral',
            depth: comment.level,
            parentId: comment.parentCmtId?.toString(),
            replyCount: comment.replyCount,
            replies: [],
            page: 1,
        };
    };

    const handleQueryCommentForNode = useCallback(
        async (targetPage: number, { append = false }: { append?: boolean } = {}) => {
            if (!classId || !topicId || !nodeId) return;

            try {
                if (append) {
                    if (isLoadingRef.current) return;
                    isLoadingRef.current = true;
                    setIsAppending(true);
                }

                const response = await fetchComments({ nodeId, typeNode, page: targetPage, limit: PAGE_SIZE });
                if (response && response.data) {
                    const fetched: Comment[] = response.data.map((c: IClassTopicComment) => handleFormatComment(c));
                    if (fetched.length < PAGE_SIZE) setHasMore(false);

                    setComments((prev) => {
                        if (!append) return fetched; // reset mode
                        const existing = new Set(prev.map((c) => c.id));
                        const merged = [...prev];
                        fetched.forEach((c) => {
                            if (!existing.has(c.id)) merged.push(c);
                        });
                        return merged;
                    });
                    setPage(append ? targetPage : 1);
                } else {
                    setHasMore(false);
                }
            } catch (e) {
                toast({ description: t('toast.failedLoadComments') });
                if (append) setHasMore(false);
            } finally {
                if (append) {
                    setIsAppending(false);
                    isLoadingRef.current = false;
                }
            }
        },
        [classId, topicId, nodeId, typeNode, fetchComments, t],
    );

    const loadMoreComments = useCallback(() => {
        if (isAppending || !hasMore) return;
        handleQueryCommentForNode(page + 1, { append: true });
    }, [page, isAppending, hasMore, handleQueryCommentForNode]);

    useEffect(() => {
        if (!loadMoreRef.current || !hasMore) return;
        const sentinel = loadMoreRef.current;
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreComments();
                }
            },
            { root: null, rootMargin: '200px', threshold: 0 },
        );
        observer.observe(sentinel);
        return () => observer.unobserve(sentinel);
    }, [hasMore, loadMoreComments]);

    useEffect(() => {
        if (!nodeId) return;
        if (isCommentsDialogOpen || !showTrigger) {
            setPage(1);
            setHasMore(true);
            handleQueryCommentForNode(1, { append: false });
        }
    }, [nodeId, isCommentsDialogOpen, showTrigger]);

    if (!showTrigger) {
        return (
            <div className={`bg-background ${className}`}>
                <Card className="p-6 shadow-md rounded-xl">{renderCommentsContent()}</Card>
            </div>
        );
    }

    return (
        <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
            <DialogTrigger asChild>
                {triggerComponent ?? (
                    <Button variant="outline" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {triggerText ?? t('open')}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[80vw] max-w-6xl h-[85vh] overflow-hidden bg-slate-200 dark:bg-slate-900">
                <ScrollArea className="h-full w-full">
                    <div className="p-4">{renderCommentsContent()}</div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};

export default CommentThread;
