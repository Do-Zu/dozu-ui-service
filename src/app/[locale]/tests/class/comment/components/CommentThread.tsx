'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentInput from './CommentInput';
import CommentCard from './CommentCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userRole: 'Teacher' | 'Student' | 'Moderator' | 'Author';
    userAvatar: string;
    content: string;
    timestamp: string;
    likes: number;
    hearts: number;
    laughs: number;
    angry: number;
    sentiment: 'positive' | 'neutral' | 'negative';
    isTopComment?: boolean;
    isVerified?: boolean;
    replies?: Comment[];
    parentId?: string;
    depth?: number;
}

interface CommentThreadProps {
    comments?: Comment[];
    className?: string;
    nodeId?: string;
    nodeTitle?: string;
    filterType?: 'all' | 'top' | 'recent';
    triggerText?: string;
    showTrigger?: boolean;
}
const mockDataComments: Comment[] = [
    {
        id: '1',
        userId: 'user1',
        userName: 'Sarah Johnson',
        userRole: 'Teacher',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        content:
            "I'd like everyone to share their thoughts on the reading assignment. What stood out to you the most about the chapter on neural networks? This is a great opportunity to dive deep into the concepts and share different perspectives on how these systems work in practice.",
        timestamp: '2023-05-15T10:30:00Z',
        likes: 12,
        hearts: 5,
        laughs: 0,
        angry: 0,
        sentiment: 'positive',
        isTopComment: true,
        isVerified: true,
        depth: 0,
        replies: [
            {
                id: '2',
                userId: 'user2',
                userName: 'Michael Chen',
                userRole: 'Student',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
                content:
                    "I was fascinated by how neural networks mimic human brain function. The parallels between biological neurons and artificial ones really helped me understand the concept better. It's amazing how we can simulate learning processes computationally!",
                timestamp: '2023-05-15T11:15:00Z',
                likes: 8,
                hearts: 3,
                laughs: 1,
                angry: 0,
                sentiment: 'positive',
                parentId: '1',
                depth: 1,
                replies: [
                    {
                        id: '5',
                        userId: 'user5',
                        userName: 'Alex Thompson',
                        userRole: 'Student',
                        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
                        content:
                            "@Michael Chen That's exactly what I thought too! The biological inspiration is what makes it so intuitive once you grasp the basic concept.",
                        timestamp: '2023-05-15T12:00:00Z',
                        likes: 4,
                        hearts: 2,
                        laughs: 0,
                        angry: 0,
                        sentiment: 'positive',
                        parentId: '2',
                        depth: 2,
                        replies: [
                            {
                                id: '6',
                                userId: 'user2',
                                userName: 'Michael Chen',
                                userRole: 'Student',
                                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
                                content:
                                    'Absolutely! And the way they handle pattern recognition is just mind-blowing.',
                                timestamp: '2023-05-15T12:30:00Z',
                                likes: 2,
                                hearts: 1,
                                laughs: 0,
                                angry: 0,
                                sentiment: 'positive',
                                parentId: '5',
                                depth: 3,
                            },
                        ],
                    },
                ],
            },
            {
                id: '3',
                userId: 'user3',
                userName: 'Emma Rodriguez',
                userRole: 'Student',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
                content:
                    "I struggled with understanding backpropagation. Could someone explain it in simpler terms? I've read the textbook multiple times but I'm still not getting how the error flows backward through the network.",
                timestamp: '2023-05-15T13:45:00Z',
                likes: 5,
                hearts: 1,
                laughs: 0,
                angry: 0,
                sentiment: 'neutral',
                parentId: '1',
                depth: 1,
            },
        ],
    },
    {
        id: '4',
        userId: 'user4',
        userName: 'David Wilson',
        userRole: 'Student',
        userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
        content:
            "Has anyone found good resources for visualizing neural networks? I'm a visual learner and would appreciate any recommendations. Something interactive would be perfect!",
        timestamp: '2023-05-16T09:20:00Z',
        likes: 7,
        hearts: 2,
        laughs: 0,
        angry: 0,
        sentiment: 'neutral',
        depth: 0,
        replies: [],
    },
];

const CommentThread = ({
    comments: initialComments = [],
    className = '',
    nodeId,
    nodeTitle,
    filterType = 'all',
    triggerText = 'View Comments',
    showTrigger = true,
}: CommentThreadProps) => {
    // Default comments if none provided
    const [comments, setComments] = useState<Comment[]>(
        initialComments.length > 0 ? initialComments : mockDataComments,
    );

    const [activeTab, setActiveTab] = useState('all');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isAddCommentDialogOpen, setIsAddCommentDialogOpen] = useState(false);
    const [isCommentsDialogOpen, setIsCommentsDialogOpen] = useState(false);

    // Filter comments based on active tab
    const filteredComments = activeTab === 'top' ? comments.filter((comment) => comment.isTopComment) : comments;

    const handleAddComment = (content: string) => {
        const newComment: Comment = {
            id: `comment-${Date.now()}`,
            userId: 'currentUser',
            userName: 'Current User',
            userRole: 'Student',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser',
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            hearts: 0,
            laughs: 0,
            angry: 0,
            sentiment: 'neutral',
            depth: 0,
            replies: [],
        };

        setComments([...comments, newComment]);
        setIsAddCommentDialogOpen(false);
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

    const handleAddReply = (commentId: string, content: string) => {
        const parentDepth = findCommentDepth(comments, commentId);
        const parentContent = findCommentContent(comments, commentId);

        const newReply: Comment = {
            id: `reply-${Date.now()}`,
            userId: 'currentUser',
            userName: 'Current User',
            userRole: 'Student',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=currentUser',
            content,
            timestamp: new Date().toISOString(),
            likes: 0,
            hearts: 0,
            laughs: 0,
            angry: 0,
            sentiment: 'neutral',
            parentId: commentId,
            depth: parentDepth + 1,
        };

        const updatedComments = addReplyToComment(comments, commentId, newReply);
        setComments(updatedComments);
        setReplyingTo(null);
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
                            role: comment.userRole,
                            isVerified: comment.isVerified,
                        }}
                        content={comment.content}
                        timestamp={new Date(comment.timestamp).toLocaleString()}
                        likes={comment.likes}
                        hearts={comment.hearts}
                        laughs={comment.laughs}
                        angry={comment.angry}
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
                    {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-400/20 dark:to-purple-400/20 rounded-xl blur-sm"></div> */}
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
                    {filteredComments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200/50 dark:border-blue-700/50">
                                <MessageCircle className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                                No comments yet
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                Be the first to share your thoughts!
                            </p>
                            <Button
                                onClick={() => setIsAddCommentDialogOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white"
                            >
                                Start the Discussion
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredComments.map((comment, index) => renderComment(comment, index))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (!showTrigger) {
        return (
            <div className={`bg-background ${className}`}>
                <Card className="p-6 shadow-md rounded-xl">{renderCommentsContent()}</Card>
            </div>
        );
    }

    return (
        <div className={`${className} border-2  `}>
            <Dialog open={isCommentsDialogOpen} onOpenChange={setIsCommentsDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {triggerText}
                        {comments.length > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full ml-1">
                                {comments.length}
                            </span>
                        )}
                    </Button>
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
