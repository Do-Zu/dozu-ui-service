import React, { useState } from 'react';
import { RoadmapItem } from './RoadmapItem';
import { ArrowDown, ChevronLeft } from 'lucide-react';
import { AppNode, AppEdge } from '@/types/mindmap/mindmap.type';
import { Button } from '@/components/ui/button';
import { getAllChildNodeAndSelfIds, toggleComplete } from '@/utils/mindmap/mindmapUtils';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';

interface Props {
    initialItems: AppNode[];
    setNodes?: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    allNodes?: AppNode[];
    allEdges?: AppEdge[];
    getImmediateChildNodes?: (parentNodeId: string) => AppNode[];
    normalizeRoadmapOrder?: (nodes: AppNode[]) => AppNode[];
    role?: UserRoleEnum.USER | UserRoleEnum.TEACHER;
    mode?: ILearningMode;
}

export default function RoadmapList({
    initialItems,
    setNodes,
    allNodes,
    allEdges,
    getImmediateChildNodes,
    normalizeRoadmapOrder,
    role,
    mode,
}: Props) {
    const [items, setItems] = useState<AppNode[]>(initialItems);
    const [currentNode, setCurrentNode] = useState<AppNode | null>(null); // Track the node being drilled into
    const [breadcrumb, setBreadcrumb] = useState<AppNode[]>([]); // Track parent nodes for back navigation

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

        // Recalculate roadmapOrder and create new node objects to avoid mutating existing ones
        const updatedItems = newItems.map((node, idx) => ({
            ...node,
            data: {
                ...node.data,
                roadmapOrder: idx,
            },
        }));

        setItems(updatedItems);

        // Propagate the updated order back to the global nodes via setNodes if provided
        if (setNodes) {
            setNodes((prev) => {
                const updatedMap = Object.fromEntries(updatedItems.map((n) => [n.data.nodeId, n]));
                return prev.map((p) => (updatedMap[p.data.nodeId] ? updatedMap[p.data.nodeId] : p));
            });
        }
    };

    const handleExpand = (node: AppNode) => {
        if (getImmediateChildNodes && normalizeRoadmapOrder) {
            const childNodes = getImmediateChildNodes(node.data.nodeId);

            if (childNodes.length > 0) {
                // Merge the completion state from items into childNodes
                const enrichedChildNodes = childNodes.map((child) => {
                    const itemWithState = items.find((item) => item.data.nodeId === child.data.nodeId);
                    if (itemWithState?.data.isComplete !== undefined) {
                        return {
                            ...child,
                            data: {
                                ...child.data,
                                isComplete: itemWithState.data.isComplete,
                            },
                        };
                    }
                    return child;
                });

                setBreadcrumb([...breadcrumb, node]);
                setCurrentNode(node);
                const orderedChildren = normalizeRoadmapOrder(enrichedChildNodes);
                setItems(orderedChildren);
            }
        }
    };
    const handleBack = () => {
        if (breadcrumb.length > 0) {
            const newBreadcrumb = [...breadcrumb];
            newBreadcrumb.pop();
            setBreadcrumb(newBreadcrumb);

            if (newBreadcrumb.length === 0) {
                // Back to root
                setCurrentNode(null);
                setItems(initialItems);
            } else {
                // Back to parent
                const parentNode = newBreadcrumb[newBreadcrumb.length - 1];
                setCurrentNode(parentNode);
                if (getImmediateChildNodes && normalizeRoadmapOrder) {
                    const childNodes = getImmediateChildNodes(parentNode.data.nodeId);
                    const orderedChildren = normalizeRoadmapOrder(childNodes);
                    setItems(orderedChildren);
                }
            }
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Breadcrumb navigation */}
            {breadcrumb.length > 0 && (
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-1">
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <span className="text-sm text-muted-foreground min-w-0 flex-1 whitespace-normal break-words">
                        {currentNode?.data.label}
                    </span>{' '}
                </div>
            )}

            {/* Roadmap items */}
            <div className="flex flex-col items-center gap-2 relative overflow-y-auto max-h-[100vh] p-1 flex-1">
                {items.map((node, index) => (
                    <React.Fragment key={node.data.nodeId}>
                        <RoadmapItem
                            label={node.data.label}
                            index={index}
                            total={items.length}
                            completed={node.data.isComplete}
                            onMoveUp={() => moveItem(index, 'up')}
                            onMoveDown={() => moveItem(index, 'down')}
                            onComplete={() =>
                                toggleComplete({
                                    allNodes,
                                    allEdges,
                                    nodeId: node.data.nodeId,
                                    items,
                                    setItems,
                                    isComplete: !node.data.isComplete,
                                    setNodes,
                                })
                            }
                            onExpand={() => handleExpand(node)}
                            node={node}
                            role={role}
                            mode={mode}
                        />

                        {/* Arrow between items */}
                        {index < items.length - 1 && (
                            <div className="flex flex-col items-center">
                                <ArrowDown className="h-5 w-5 text-muted-foreground " />
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
