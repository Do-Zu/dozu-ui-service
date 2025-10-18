import React, { useState } from 'react';
import { RoadmapItem } from './RoadmapItem';
import { ArrowDown } from 'lucide-react';
import { AppNode } from '@/types/mindmap/mindmap.type';

interface RoadmapListProps {
    initialItems: string[];
    nodes: AppNode[];
}

export default function RoadmapList({ initialItems, nodes }: RoadmapListProps) {
    const [items, setItems] = useState(initialItems);
    const [completed, setCompleted] = useState<string[]>([]);

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newItems.length) return;
        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
        setItems(newItems);
    };

    const toggleComplete = (label: string) => {
        setCompleted((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]));
    };

    return (
        <div className="flex flex-col items-center gap-2 max-w-lg mx-auto relative">
            {items.map((label, index) => (
                <React.Fragment key={label}>
                    <RoadmapItem
                        label={label}
                        index={index}
                        total={items.length}
                        completed={completed.includes(label)}
                        onMoveUp={() => moveItem(index, 'up')}
                        onMoveDown={() => moveItem(index, 'down')}
                        onComplete={() => toggleComplete(label)}
                        node={nodes.find((node) => node.data.nodeId === label)!}
                    />

                    {/* Arrow between items */}
                    {index < items.length - 1 && (
                        <div className="flex flex-col items-center">
                            <ArrowDown className="h-5 w-5 text-muted-foreground animate-pulse" />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
