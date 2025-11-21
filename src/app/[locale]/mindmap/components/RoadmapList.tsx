import React, { useState } from 'react';
import { RoadmapItem } from './RoadmapItem';
import { ArrowDown, ChevronLeft } from 'lucide-react';
import { AppNode, AppEdge } from '@/types/mindmap/mindmap.type';
import { Button } from '@/components/ui/button';

interface RoadmapListProps {
    initialItems: AppNode[];
    setNodes?: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    allNodes?: AppNode[];
    allEdges?: AppEdge[];
    getChildNodes?: (parentNodeId: string) => AppNode[];
    normalizeRoadmapOrder?: (nodes: AppNode[]) => AppNode[];
}

export default function RoadmapList({
    initialItems,
    setNodes,
    allNodes,
    allEdges,
    getChildNodes,
    normalizeRoadmapOrder,
}: RoadmapListProps) {
    const [items, setItems] = useState<AppNode[]>(initialItems);
    const [completed, setCompleted] = useState<string[]>([]);
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

    const toggleComplete = (nodeId: string) => {
        setCompleted((prev) => (prev.includes(nodeId) ? prev.filter((l) => l !== nodeId) : [...prev, nodeId]));
    };

    const handleExpand = (node: AppNode) => {
        // Drill into this node's children
        if (getChildNodes && normalizeRoadmapOrder) {
            const childNodes = getChildNodes(node.data.nodeId);
            if (childNodes.length > 0) {
                setBreadcrumb([...breadcrumb, node]);
                setCurrentNode(node);
                const orderedChildren = normalizeRoadmapOrder(childNodes);
                setItems(orderedChildren);
                setCompleted([]); // Reset completion state when switching roadmap
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
                if (getChildNodes && normalizeRoadmapOrder) {
                    const childNodes = getChildNodes(parentNode.data.nodeId);
                    const orderedChildren = normalizeRoadmapOrder(childNodes);
                    setItems(orderedChildren);
                }
            }
            setCompleted([]); // Reset completion state when switching roadmap
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
                            completed={completed.includes(node.data.nodeId)}
                            onMoveUp={() => moveItem(index, 'up')}
                            onMoveDown={() => moveItem(index, 'down')}
                            onComplete={() => toggleComplete(node.data.nodeId)}
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
