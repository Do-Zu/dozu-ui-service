import React, { useState } from 'react';
import { RoadmapItem } from './RoadmapItem';
import { ArrowDown, ChevronLeft } from 'lucide-react';
import { AppNode, AppEdge } from '@/types/mindmap/mindmap.type';
import { Button } from '@/components/ui/button';
import { getAllChildNodeAndSelfIds } from '../utils/mindmap.utils';

interface RoadmapListProps {
    initialItems: AppNode[];
    setNodes?: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    allNodes?: AppNode[];
    allEdges?: AppEdge[];
    getImmediateChildNodes?: (parentNodeId: string) => AppNode[];
    normalizeRoadmapOrder?: (nodes: AppNode[]) => AppNode[];
}

export default function RoadmapList({
    initialItems,
    setNodes,
    allNodes,
    allEdges,
    getImmediateChildNodes,
    normalizeRoadmapOrder,
}: RoadmapListProps) {
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

    const toggleComplete = (nodeId: string, isComplete: boolean) => {
        // Find and toggle the isComplete property on the node
        const nodesToUpdate =
            allNodes && allEdges ? getAllChildNodeAndSelfIds({ nodes: allNodes, edges: allEdges, nodeId }) : [nodeId]; // Fallback: just toggle the node itself if data is missing
        const updatedItems = items.map((node) => {
            if (nodesToUpdate.includes(node.data.nodeId)) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isComplete: isComplete,
                    },
                };
            }
            return node;
        });

        const updatedAllNodes = allNodes?.map((node) => {
            if (nodesToUpdate.includes(node.data.nodeId)) {
                return {
                    ...node,
                    data: {
                        ...node.data,
                        isComplete: isComplete,
                    },
                };
            }
            return node;
        });

        setItems(updatedItems);

        // Propagate the updated completion state back to the global nodes via setNodes if provided
        if (setNodes && updatedAllNodes) {
            setNodes(updatedAllNodes);
            // setNodes(updatedItems);
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
                    <span className="text-sm text-muted-foreground truncate">{currentNode?.data.label}</span>
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
                            onComplete={() => toggleComplete(node.data.nodeId, !node.data.isComplete)}
                            onExpand={() => handleExpand(node)}
                            node={node}
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
