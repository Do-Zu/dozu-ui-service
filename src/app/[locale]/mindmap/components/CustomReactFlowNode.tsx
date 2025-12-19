import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Handle, Node, NodeToolbar, Position, useEdges, useInternalNode, useReactFlow } from '@xyflow/react';
import { useState, useRef, useEffect } from 'react';
import { CustomNodeData } from '../../../../types/mindmap/mindmap.type';
import { useDispatch } from 'react-redux';
import { openSheet, setSelectedNodeData, toggleNodeSelection } from '@/stores/features/mindmap/selectedNodeSlice';
import { getRouter } from '@/utils/routerService';
import CommentThread from '../../class-based/components/comment/CommentThread';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Save, X, BookOpenIcon, FileText, Target, MessageCircle, Plus, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/stores/hooks';
import AddChildNodeButton from './buttons/AddChildNodeButton';
import DeleteNodeButton from './buttons/DeleteNodeButton';
import PaletteButton from './buttons/PaletteButton';

const CustomReactFlowNode = ({ data }: { data: CustomNodeData }) => {
    // stats;
    const tCommon = useTranslations('common.messages');
    const total = data.statistics?.total || 0;
    const mature = data.statistics?.mature || 0;
    const progress = total > 0 ? (mature / total) * 100 : 0;

    // Check completion status
    const isComplete = data.isComplete;

    const dispatch = useDispatch();
    // const router = getRouter();

    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const [isHovered, setIsHovered] = useState(false);
    const [isClickedOn, setIsClickedOn] = useState(false);
    const isInMultiSelect = useAppSelector(
        (state) => state.selectedNodeSlice.selectedNodeIds.find((id) => id === data.nodeId) !== undefined,
    );
    const isActive = isClickedOn || isHovered || isInMultiSelect;
    const [isExpanded, setIsExpanded] = useState(false);
    const { screenToFlowPosition, fitView, getNodes, setNodes, setEdges, setViewport } = useReactFlow();
    const edges = useEdges();
    const internalNode = useInternalNode(data.nodeId);

    const isEditingMindmap = useAppSelector((state) => state.isEditingMindmapSlice.isEditingMindmap);
    const isMultiSelectMode = useAppSelector((state) => state.selectedNodeSlice.isMultiSelectMode);

    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                wrapperRef.current &&
                event.target instanceof HTMLElement &&
                !wrapperRef.current.contains(event.target)
            ) {
                setIsClickedOn(false);
            }
        }

        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
        };
    }, []);

    const deleteNode = (id: string) => {
        edges.forEach((edge) => {
            if (edge.source === id) {
                deleteNode(edge.target);
            }
        });
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    };

    const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
        handleSave(e.target.value);
    };

    const handleSave = (inputLabel: string) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === data.nodeId ? { ...node, data: { ...node.data, label: inputLabel } } : node,
            ),
        );
        setEditing(false);
    };

    const handleCancel = () => {
        setLabel(data.label);
        setEditing(false);
    };

    const handleClickNode = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        dispatch(setSelectedNodeData(data));
        if (isMultiSelectMode) {
            dispatch(toggleNodeSelection(data.nodeId));
        } else {
            setIsClickedOn(true);
        }
    };

    const handleRightClickNode = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (internalNode) {
            requestAnimationFrame(() => {
                fitView({ nodes: [internalNode], duration: 800, padding: 0.2 });
            });
        }
        setIsClickedOn(true);

        dispatch(setSelectedNodeData(data));
        dispatch(openSheet());
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave(label);
        } else if (e.key === 'Escape') {
            handleCancel();
        }
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

    // --- Dynamic Styles Logic ---

    // Helper to determine if we are overriding the ring color
    // We override if the node is active, complete, and has a specific color assigned.
    const shouldUseCustomRingColor = isActive && isComplete && data.color;

    const getBorderClass = () => {
        if (isActive) return isComplete ? 'border-green-500' : 'border-primary/40';
        if (isComplete) return 'border-green-500/40';
        return 'border-border/10 hover:border-border';
    };

    const getRingClass = () => {
        if (isActive) {
            // If we are using a custom ring color via style prop, just set the width/shadow
            if (shouldUseCustomRingColor) return 'shadow-2xl ring-2';
            // Otherwise use default Tailwind classes
            return `shadow-2xl ring-2 ${isComplete ? 'ring-green-500/60' : 'ring-primary/60'}`;
        }
        if (data.isRoot) return 'ring-2 ring-primary/20';
        return '';
    };

    const getBackgroundClass = () => {
        // Keep the green tint for completion to distinguish it from regular nodes
        if (isComplete) return 'bg-green-50/10 dark:bg-green-900/10';
        if (data.isRoot) return 'bg-primary/5';
        return '';
    };

    return (
        <motion.div
            variants={nodeVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onMouseEnter={() => {
                if (!isMultiSelectMode) {
                    setIsHovered(true);
                }
            }}
            onMouseLeave={() => setIsHovered(false)}
            ref={wrapperRef}
            onClick={handleClickNode}
            onContextMenu={handleRightClickNode}
            className={`
                relative group min-w-[180px] max-w-[280px]
                bg-card/95 backdrop-blur-sm
                rounded-xl shadow-sm hover:shadow-md
                transition-all duration-200 ease-out
                border
                ${getBorderClass()}
                ${getRingClass()}
                ${getBackgroundClass()}
            `}
            style={
                {
                    // Border color fallback for inactive, incomplete, colored nodes
                    borderColor: !isActive && !isComplete && data.color ? data.color : undefined,

                    // If active, complete, and colored: override the CSS variable for ring color
                    // We append '99' to the hex to create a ~60% opacity effect (Hex 8-digit notation)
                    '--tw-ring-color': shouldUseCustomRingColor ? `${data.color}99` : undefined,
                } as React.CSSProperties
            }
        >
            {/* Completed Indicator Tick */}
            {isComplete && (
                <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute -top-2 -right-2 z-20 bg-card rounded-full shadow-sm ring-1 ring-green-100 dark:ring-green-900"
                >
                    <CheckCircle className="w-5 h-5 text-green-500 fill-green-100 dark:fill-green-900/30" />
                </motion.div>
            )}

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

            {/* Node Header */}
            <div className="p-4">
                {/* Root indicator */}
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

                {/* Main Content */}
                <motion.div
                    variants={contentVariants}
                    animate={isExpanded ? 'expanded' : 'collapsed'}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-3"
                >
                    {/* Title Section */}
                    <div className="space-y-2">
                        <div className="cursor-pointer group/title">
                            <motion.h3
                                className={`text-sm font-medium text-foreground leading-relaxed line-height-[1.5] group-hover/title:text-primary transition-colors duration-200 ${isComplete ? 'text-muted-foreground' : ''}`}
                                style={{
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    letterSpacing: '0.01em',
                                    textDecoration: isComplete ? 'line-through' : 'none',
                                    textDecorationColor: 'hsl(var(--muted-foreground))',
                                }}
                            >
                                {isEditingMindmap ? (
                                    <Input
                                        className="h-7 px-2 py-1 text-sm border border-neutral-300 dark:border-neutral-600"
                                        value={label}
                                        onChange={onChangeLabel}
                                    />
                                ) : (
                                    data?.label || 'Untitled Node'
                                )}
                            </motion.h3>

                            {/* Description if available */}
                            {data.description && (
                                <motion.p
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`text-xs text-muted-foreground mt-1 leading-relaxed ${isActive ? '' : 'truncate'}`}
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

                {/* Action Buttons */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            variants={iconVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            transition={{ duration: 0.2, delay: 0.1 }}
                            className="mt-3 pt-3 border-t border-border/40 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toast({
                                            description: tCommon('featureInComing'),
                                        });
                                    }}
                                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    <BookOpenIcon className="w-3 h-3 mr-1" />
                                    Learn
                                </Button>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Progress</span>
                                    <span className="text-sm font-medium">
                                        {mature} / {total}
                                    </span>
                                </div>
                            </div>

                            <Progress
                                value={progress}
                                className={`h-2 ${isComplete ? 'bg-green-100 [&>div]:bg-green-500' : ''}`}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div
                className="absolute inset-0 rounded-xl ring-2 ring-primary/0 group-focus-within:ring-primary/40 transition-all duration-200 pointer-events-none"
                aria-hidden="true"
            />
            <NodeToolbar isVisible={isEditingMindmap} position={Position.Top}>
                <AddChildNodeButton nodeId={data.nodeId} />
                <DeleteNodeButton nodeId={data.nodeId} />
                <PaletteButton nodeId={data.nodeId} />
            </NodeToolbar>
        </motion.div>
    );
};

export default CustomReactFlowNode;
