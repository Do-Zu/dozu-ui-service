import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { addChildNode } from '@/utils/mindmap/mindmapUtils';
import { useNodes, useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import React from 'react';
import { useMindMapContext } from '../../context/MindMapContext';

interface AddChildNodeButtonParams {
    nodeId: string;
}

const AddChildNodeButton = ({ nodeId }: AddChildNodeButtonParams) => {
    
    const { screenToFlowPosition, setNodes, setEdges, getNodes } = useReactFlow<AppNode, AppEdge>();
    const { nodes } = useMindMapContext();
    const handleOnClickAddChild = () => {
        addChildNode({ nodes, screenToFlowPosition, setNodes, setEdges, currentNodeId: nodeId });
    };
    return (
        <Button variant="ghost" onClick={handleOnClickAddChild}>
            <Plus />
        </Button>
    );
};

export default AddChildNodeButton;
