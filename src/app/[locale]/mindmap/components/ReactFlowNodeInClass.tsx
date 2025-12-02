import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Handle, Position, useEdges, useReactFlow } from '@xyflow/react';
import { BookOpenIcon, FileText, Target, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CustomNodeData } from '../../../../types/mindmap/mindmap.type';
import { openSheet, setSelectedNodeData } from '@/stores/features/mindmap/selectedNodeSlice';
import { EnumNodeComment } from '../../class-based/types/class.type';
import CommentThread from '../../class-based/components/comment/CommentThread';

const ReactFlowNodeInClass = ({ data }: { data: CustomNodeData }) => {
    const dispatch = useDispatch();
    const { id: classId } = useParams<{ id: string }>();

    const handleClickNode = () => {
        dispatch(openSheet());
        dispatch(setSelectedNodeData(data));
    };

    // Animation variants
    const nodeVariants = {
        initial: { scale: 0.95, opacity: 0.8 },
        animate: { scale: 1, opacity: 1 },
        hover: { scale: 1.02, y: -2 },
        tap: { scale: 0.98 },
    };

    const contentVariants = {
        collapsed: { height: 'auto' },
        expanded: { height: 'auto' },
    };

    const iconVariants = {
        hidden: { opacity: 0, scale: 0.8, x: -10 },
        visible: { opacity: 1, scale: 1, x: 0 },
    };

    const triggerComponent = useMemo(
        () => (
            <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                className="h-7 px-2 text-xs rounded-full transition-all duration-300 transform hover:scale-105 text-gray-600 dark:text-gray-400 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/20"
            >
                <MessageCircle className="w-3 h-3 mr-1" />
                comments
            </Button>
        ),
        [],
    );

    return (
        <motion.div
            variants={nodeVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            // onMouseEnter={() => setIsHovered(true)}
            // onMouseLeave={() => setIsHovered(false)}
            className={`
                relative group min-w-[180px] max-w-[280px]
                bg-card/95 backdrop-blur-sm
                border border-border/10 hover:border-border
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-200 ease-out
                ${data.isRoot ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
            `}
            style={{
                // background: data.isRoot
                //     ? 'linear-gradient(135deg, hsl(var(--primary))/0.05 0%, hsl(var(--background)) 100%)'
                //     : undefined,
            }}
        >
            {/* Connection Handles */}
            <Handle
                className="w-3 h-3 bg-primary/60 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                position={Position.Right}
                type="source"
                style={{ right: -6 }}
            />
            <Handle
                className="w-3 h-3 bg-primary/60 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                position={Position.Left}
                type="target"
                style={{ left: -6 }}
                isConnectableStart={false}
            />
            <Handle
                className="w-3 h-3 bg-primary/60 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                position={Position.Bottom}
                type="target"
                style={{ bottom: -6 }}
                isConnectableStart={false}
            />
            <Handle
                className="w-3 h-3 bg-primary/60 border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                position={Position.Top}
                type="target"
                style={{ top: -6 }}
                isConnectableStart={false}
            />

            <div className="p-4">
                {data.isRoot && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-center mb-2"
                    >
                        <Badge variant="secondary" className="text-xs font-medium bg-primary/10 text-primary">
                            <Target className="w-3 h-3 mr-1" />
                            Root Topic
                        </Badge>
                    </motion.div>
                )}

                <motion.div
                    variants={contentVariants}
                    animate={'collapsed'}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-3"
                >
                    <div className="space-y-2">
                        <div onClick={handleClickNode} className="cursor-pointer group/title">
                            <motion.h3
                                className="text-sm font-medium text-foreground leading-relaxed line-height-[1.5] group-hover/title:text-primary transition-colors duration-200"
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    letterSpacing: '0.01em',
                                }}
                            >
                                {data?.label || 'Untitled Node'}
                            </motion.h3>

                            {/* Description if available */}
                            {data.description && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="text-xs text-muted-foreground mt-1 leading-relaxed"
                                    style={{ lineHeight: '1.4' }}
                                >
                                    {data.description}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* Page Index Info */}
                    {(data.pageStartIndex || data.pageEndIndex) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                            <FileText className="w-3 h-3" />
                        </motion.div>
                    )}
                </motion.div>

                <AnimatePresence>
                    <motion.div
                        variants={iconVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="flex items-center justify-between mt-3 pt-3 border-t border-border/40"
                    >
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                                e.stopPropagation();
                                toast({
                                    description: 'feature is coming soon!',
                                });
                            }}
                            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                        >
                            <BookOpenIcon className="w-3 h-3 mr-1" />
                            Learn
                        </Button>
                        {data.topicId && classId && (
                            <CommentThread
                                triggerComponent={triggerComponent}
                                nodeId={data.nodeId}
                                nodeTitle={data.label}
                                classId={classId}
                                topicId={data.topicId}
                                typeNode={EnumNodeComment.MINDMAP}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            <div
                className="absolute inset-0 rounded-xl ring-2 ring-primary/0 group-focus-within:ring-primary/40 transition-all duration-200 pointer-events-none"
                aria-hidden="true"
            />
        </motion.div>
    );
};

export default ReactFlowNodeInClass;
