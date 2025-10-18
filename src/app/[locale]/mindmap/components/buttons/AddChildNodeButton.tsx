import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { addChildNode } from '@/utils/mindmap/mindmapUtils';
import { useReactFlow } from '@xyflow/react';
import { Plus } from 'lucide-react';
import React from 'react';

interface AddChildNodeButtonParams {
    nodeId: string;
}

const AddChildNodeButton = ({ nodeId }: AddChildNodeButtonParams) => {
    const { screenToFlowPosition, setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const handleOnClickAddChild = () => {
        addChildNode({ screenToFlowPosition, setNodes, setEdges, currentNodeId: nodeId });
    };
    return (
        <Button variant="ghost" onClick={handleOnClickAddChild}>
            <Plus />
        </Button>
    );
};

export default AddChildNodeButton;
