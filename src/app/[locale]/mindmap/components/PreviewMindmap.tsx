'use client';

import '@xyflow/react/dist/style.css';
import CustomReactFlowNode from './CustomReactFlowNode';
import FloatingEdge from './FloatingEdge';
import { Background, BackgroundVariant, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

const PreviewMindmap = ({ initialNodes, initialEdges }: any) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    return (
        <div className="flex-grow h-[calc(100vh-200px)] w-full">
            {' '}
            {/* Example to fill remaining height, adjust 200px as needed */}
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                // onConnect={onConnect}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default PreviewMindmap;
