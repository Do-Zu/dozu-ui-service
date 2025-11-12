import CustomReactFlowNode from '@/app/[locale]/mindmap/components/CustomReactFlowNode';
import FloatingEdge from '@/app/[locale]/mindmap/components/FloatingEdge';
import MindmapButtonsPanel from '@/app/[locale]/mindmap/components/MindmapButtonsPanel';
import NodeSheet from '@/app/[locale]/mindmap/components/NodeSheet';
import { useMindMapContext } from '@/app/[locale]/mindmap/context/MindMapContext';
import Spinner from '@/components/ui/spinner';
import { ColorMode, ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
// import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { useTheme } from 'next-themes';
import React from 'react';

//set react flow to use custom nodes & edges
const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};
const edgeTypes = {
    floating: FloatingEdge,
};

const MindmapContent = ({}) => {
    const {
        topicId,
        isLoading,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        isSaving,
        saveMindmap,
        sseData,
        sseStatus,
        isProcessingRegisterGenerate,
    } = useMindMapContext();

    //pass website color theme along to react flow
    const { resolvedTheme } = useTheme();
    const colorMode = resolvedTheme as ColorMode;

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            colorMode={colorMode}
            fitView
            minZoom={0.001}
        >
     

            <MindmapButtonsPanel />
         
            <NodeSheet />
            <Controls position="top-right" />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        </ReactFlow>
    );
};

export default MindmapContent;
