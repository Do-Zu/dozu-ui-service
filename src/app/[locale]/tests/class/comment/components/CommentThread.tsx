'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGetCommentsByNode, useCreateComment, IClassTopicComment } from '@/services/class-based-learning/comment';
import { TypeNodeComment } from '@/app/[locale]/class-based/types/class.type';
import { useAuth } from '@/contexts/auth/AuthContext';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userRole: 'Teacher' | 'Student' | 'Moderator' | 'Author';
    userAvatar: string;
    content: string;
    timestamp: string;
    likes: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    isTopComment?: boolean;
    isVerified?: boolean;
    replies?: Comment[];
    parentId?: string;
    depth?: number;
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
    const [comments, setComments] = useState<Comment[]>(initialComments);

    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);
    const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

    const { user } = useAuth();

    const {
        execute: fetchComments,
        data: apiCommentsData,
        loading: fetchingComments,
        error: fetchCommentsError,
    } = useGetCommentsByNode(classId || '', topicId || '');

    const {
        execute: createNewComment,
        loading: creatingComment,
        error: createCommentError,
    } = useCreateComment(classId || '', topicId || '', {
        onSuccess: (newComment: any) => {
            // Convert API response to local Comment format
            const formattedComment: Comment = {
                id: newComment.commentId.toString(),
                userId: newComment.author.user_id.toString(),
                userName: newComment.author.name,
                userRole: 'Student',
                userAvatar: newComment.author.avatar,
                content: newComment.content,
                timestamp: newComment.createdAt.toISOString(),
                likes: 0,
                sentiment: 'neutral',
                depth: newComment.level,
                replies: [],
            };

            if (newComment.parentCmtId) {
                // Handle adding reply to existing comment
                const updatedComments = addReplyToComment(
                    comments,
                    newComment.parentCmtId.toString(),
                    formattedComment,
                );
                setComments(updatedComments);
            } else {
                // Handle adding new top-level comment
                setComments([...comments, formattedComment]);
            }
            setIsAddCommentDialogOpen(false);
        },
    });

    const handleAddComment = async (content: string) => {
        if (!classId || !topicId || !nodeId) {
            console.error('Missing required parameters for creating comment');
            return;
        }

        try {
            await createNewComment({
                nodeId,
                typeNode,
                content,
                topicId,
                author: {
                    user_id: parseInt(user?.id! as string),
                    name: user?.name!,
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser',
                },
            });
        } catch (error) {
            console.error('Failed to create comment:', error);
        }
    };

    // Helper function to add reply at any depth
    const addReplyToComment = (comments: Comment[], targetId: string, newReply: Comment): Comment[] => {
        return comments.map((comment) => {
            if (comment.id === targetId) {
                return {
                    ...comment,
                    replies: [...(comment.replies || []), newReply],
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
        if (!classId || !topicId || !nodeId) {
            console.error('Missing required parameters for creating reply');
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
                    user_id: parseInt(user?.id as string),
                    name: user?.name || '',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser',
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
        const updatedComments = updateReactionInComments(comments, commentId, reactionType);
        setComments(updatedComments);
    };

    const handleLike = (commentId: string) => {
        handleReaction(commentId, 'like');
    };

    const handleReply = (commentId: string) => {
        setReplyingTo(commentId);
    };

    // Recursive function to render comments and their nested replies
    const renderComment = (comment: Comment, index: number) => {
        const parentContent = comment.parentId ? findCommentContent(comments, comment.parentId) : undefined;

        return (
            <div key={comment.id} className="space-y-4">
                <div
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
                        timestamp={new Date(comment.timestamp).toLocaleString()}
                        likes={comment.likes}
                        sentiment={comment.sentiment}
                        replies={comment.replies?.length || 0}
                        depth={comment.depth || 0}
                        replyTo={parentContent}
                        onLike={() => handleLike(comment.id)}
                        onReply={() => handleReply(comment.id)}
                        onReaction={(id, type) => handleReaction(id, type)}
                    />
                </div>

                {/* Reply input */}
                {replyingTo === comment.id && (
                    <div className="animate-in slide-in-from-top-2 duration-300">
                        <CommentInput
                            onSubmit={(content) => handleAddReply(comment.id, content)}
                            onCancel={() => setReplyingTo(null)}
                            placeholder="Write a thoughtful reply..."
                            isReply
                            depth={comment.depth || 0}
                            replyTo={comment.content}
                            autoFocus
                        />
                    </div>
                )}

                {/* Nested replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-4">
                        {comment.replies.map((reply, replyIndex) => renderComment(reply, replyIndex))}
                    </div>
                )}
            </div>
        );
    };

    const renderCommentsContent = () => {
        return (
            <div className="max-w-5xl mx-auto rounded-2xl p-6 ">
                <div className="relative mb-8">
                    <div className="relative backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/30 shadow-lg dark:shadow-gray-900/10 bg-white/50 dark:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl flex items-center justify-center shadow-lg">
                                    <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
                                        {nodeTitle ? `Discussion: ${nodeTitle}` : 'Discussion Thread'}
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {comments.length} {comments.length === 1 ? 'comment' : 'comments'} • Join the
                                        conversation
                                    </p>
                                </div>
                            </div>

                            {/* Proactive Action Buttons */}

                            <Dialog open={isAddCommentDialogOpen} onOpenChange={setIsAddCommentDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="shadow-lg dark:shadow-gray-900/10 dark:hover:shadow-gray-900/10 transition-all duration-300 transform hover:scale-105 gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Comment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]  ">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                            Share Your Thoughts
                                        </DialogTitle>
                                    </DialogHeader>
                                    <CommentInput
                                        onSubmit={handleAddComment}
                                        placeholder={
                                            nodeId
                                                ? `What are your thoughts on ${nodeTitle}?`
                                                : 'Share your insights and join the discussion...'
                                        }
                                        nodeId={nodeId}
                                    />
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
                <div>
                    {comments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-blue-700/50">
                                <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-700 mb-2">
                                No comments yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Be the first to share your thoughts!
                            </p>
                            <Button onClick={() => setIsAddCommentDialogOpen(true)} className="bg-gradient-to-r">
                                Start the Discussion
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map((comment, index) => renderComment(comment, index))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    //TODO: query for get all comment for node
    const handleQueryCommentForNode = async () => {
        if (!classId || !topicId || !nodeId) {
            console.error('Missing required parameters for fetching comments');
            return;
        }

        try {
            const response = await fetchComments({
                nodeId: parseInt(nodeId),
                typeNode,
                page: 1,
                limit: 20,
            });

            if (response && Array.isArray(response)) {
                // Convert API response to local Comment format
                const formattedComments: Comment[] = response.map((apiComment: any) => ({
                    id: apiComment.commentId.toString(),
                    userId: apiComment.author.user_id.toString(),
                    userName: apiComment.author.name,
                    userRole: 'Student', // You might want to map this from the API
                    userAvatar:
                        apiComment.author.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${apiComment.author.name}`,
                    content: apiComment.content,
                    timestamp: apiComment.createdAt.toISOString(),
                    likes: apiComment.reactionCount,
                    sentiment: 'neutral',
                    depth: apiComment.level,
                    parentId: apiComment.parentCmtId?.toString(),
                    replies: apiComment.replies
                        ? apiComment.replies.map((reply: any) => ({
                              id: reply.commentId.toString(),
                              userId: reply.author.user_id.toString(),
                              userName: reply.author.name,
                              userRole: 'Student',
                              userAvatar: reply.author.avatar,
                              content: reply.content,
                              timestamp: reply.createdAt.toISOString(),
                              likes: reply.reactionCount,
                              hearts: 0,
                              laughs: 0,
                              angry: 0,
                              sentiment: 'neutral',
                              depth: reply.level,
                              parentId: reply.parentCmtId?.toString(),
                              replies: [], // Nested replies would need recursive handling
                          }))
                        : [],
                }));

                setComments(formattedComments);
            }
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    useEffect(() => {
        if (nodeId && isCommentsDialogOpen) {
            handleQueryCommentForNode();
        }
    }, [nodeId, isCommentsDialogOpen]);

    if (!showTrigger) {
        return (
            <div className={`bg-background ${className}`}>
                <Card className="p-6 shadow-md rounded-xl">{renderCommentsContent()}</Card>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
                <DialogTrigger asChild>
                    {triggerComponent ?? (
                        <Button variant="outline" className="gap-2">
                            <MessageCircle className="h-4 w-4" />
                            {triggerText}
                        </Button>
                    )}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[80vw] max-w-6xl h-[85vh] overflow-hidden bg-slate-200 dark:bg-slate-900">
                    <ScrollArea className="h-full w-full">
                        <div className="p-4">{renderCommentsContent()}</div>
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CommentThread;
