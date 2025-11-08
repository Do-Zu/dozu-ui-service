import { Handle, Node, Position, useEdges, useReactFlow } from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { CustomNodeData } from '../../../../types/mindmap/mindmap.type';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

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

const CustomReactFlowPreviewNode = ({ data }: { data: CustomNodeData }) => {
    const isActive = false;
    const isExpanded = false;
    const { screenToFlowPosition, getNodes, setNodes, setEdges } = useReactFlow();
    const edges = useEdges();

    const addNode = () => {
        const id = uuidv4();
        const newNode: Node = {
            id: id,
            type: 'custom-react-flow-node',
            position: screenToFlowPosition({ x: 0, y: 0 }),
            data: { nodeId: id, label: `Empty node` },
            origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat([newNode]));
        setEdges((eds) =>
            eds.concat({ id: `${id}-${data.nodeId}`, source: data.nodeId, target: id, type: 'floating' }),
        );
    };
    const deleteNode = (id: string) => {
        edges.forEach((edge) => {
            if (edge.source === id) {
                deleteNode(edge.target);
            }
        });
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        console.log(edges);
    };

    const handleAddChild = () => {
        addNode();
    };

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
            // ref={wrapperRef}
            // onClick={handleClickNode}
            // onContextMenu={handleRightClickNode}
            className={`
                  relative group min-w-[180px] max-w-[280px]
                  bg-card/95 backdrop-blur-sm
                  border border-border/10 hover:border-border
                  rounded-xl shadow-sm hover:shadow-md
                  transition-all duration-200 ease-out
                  ${data.isRoot ? 'ring-2 ring-primary/20 bg-primary/5' : ''}
                  ${isActive ? 'shadow-lg' : ''}
              `}
            style={{
                borderColor: data.color || 'hsl(var(--border))', // use custom color or fallback
                background: data.isRoot
                    ? 'linear-gradient(135deg, hsl(var(--primary))/0.05 0%, hsl(var(--background)) 100%)'
                    : undefined,
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
                                    className={`text-xs text-muted-foreground mt-1 leading-relaxed ${isActive ? '' : 'truncate'}`}
                                    style={{ lineHeight: '1.4' }}
                                >
                                    {data.description}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    {/* Page Index Info */}
                    {/* {(data.pageStartIndex || data.pageEndIndex) && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1 text-xs text-muted-foreground"
                        >
                            <FileText className="w-3 h-3" />
                        </motion.div>
                    )} */}
                </motion.div>

                {/* Action Buttons */}
            </div>

            <div
                className="absolute inset-0 rounded-xl ring-2 ring-primary/0 group-focus-within:ring-primary/40 transition-all duration-200 pointer-events-none"
                aria-hidden="true"
            />
            {/* <NodeToolbar isVisible={isEditingMindmap} position={Position.Top}>
                <AddChildNodeButton nodeId={data.nodeId} />
                <DeleteNodeButton nodeId={data.nodeId} />
                <PaletteButton nodeId={data.nodeId} />
            </NodeToolbar> */}
        </motion.div>
    );
};

export default CustomReactFlowPreviewNode;
