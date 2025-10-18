import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { useReactFlow } from '@xyflow/react';
import { Palette } from 'lucide-react';
import React from 'react';
import { useMindMapContext } from '../../context/MindMapContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface PaletteButtonParams {
    nodeId: string;
}

const PaletteButton = ({ nodeId }: PaletteButtonParams) => {
    // const { setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const { nodes, edges ,setNodes,setEdges} = useMindMapContext();

    const handleSetColor = (color: string) => {
        const newNodes = nodes.map((node) =>
            node.data.nodeId === nodeId ? { ...node, data: { ...node.data, color: color } } : node,
        );
        setNodes(newNodes);
        const newEdges = edges.map((edge) =>
            edge.target === nodeId ? { ...edge, data: { ...edge.data, color: color } } : edge,
        ) as AppEdge[];
        setEdges(newEdges);
    };

    const presetColors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#6b7280'];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Palette className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="center" className="w-fit p-3">
                <div className="flex gap-2 flex-wrap">
                    {presetColors.map((color) => (
                        <button
                            key={color}
                            className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                handleSetColor(color);
                            }}
                        />
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default PaletteButton;
