import React, { useState } from 'react';
import { RoadmapItem } from './RoadmapItem';
import { ArrowDown } from 'lucide-react';
import { AppNode } from '@/types/mindmap/mindmap.type';

interface RoadmapListProps {
    initialItems: AppNode[];
    setNodes?: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
}

export default function RoadmapList({ initialItems, setNodes }: RoadmapListProps) {
    const [items, setItems] = useState<AppNode[]>(initialItems);
    const [completed, setCompleted] = useState<string[]>([]);

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

    return (
        <div className="flex flex-col items-center gap-2 max-w-lg mx-auto relative">
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
    );
}
