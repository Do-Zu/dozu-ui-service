import { Button } from '@/components/ui/button';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { addChildNode, deleteNode } from '@/utils/mindmap/mindmapUtils';
import { useReactFlow } from '@xyflow/react';
import { Plus, Trash } from 'lucide-react';
import React from 'react';
import { useMindMapContext } from '../../context/MindMapContext';

interface DeleteNodeButtonParams {
    nodeId: string;
}

const DeleteNodeButton = ({ nodeId }: DeleteNodeButtonParams) => {
    const { screenToFlowPosition, setNodes, setEdges } = useReactFlow<AppNode, AppEdge>();
    const { edges } = useMindMapContext();
    const handleOnClickDelete = () => {
        deleteNode({ nodeId: nodeId, edges, setNodes, setEdges });
    };
    return (
        <Button variant="ghost" onClick={handleOnClickDelete}>
            <Trash />
        </Button>
    );
};

export default DeleteNodeButton;
