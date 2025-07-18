'use client';

import { Button } from '@/components/ui/button';
import { setRouterRef } from '@/utils/routerService';
import { Background, BackgroundVariant, Controls, Panel, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import DownloadButton from '../components/buttons/DownloadButton';
import ViewFileButton from '../components/buttons/ViewFileButton.';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import FileSheet from '../components/FileSheet';
import FloatingEdge from '../components/FloatingEdge';
import NodeSheet from '../components/NodeSheet';
import { useMindMapContext } from '../context/MindMapContext';

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

export default function MindmapContent() {
    const router = useRouter();

    const { topicId, nodes, edges, onNodesChange, onEdgesChange, isSaving, saveMindmap } = useMindMapContext();

    useEffect(() => {
        setRouterRef(router);
    }, [router]);

    if (!topicId) {
        return <div>No topic id is provided</div>;
    }

    return (
        <div className="w-full h-full">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
            >
                <Panel position="top-left">
                    <ViewFileButton />
                </Panel>
                <Panel position="top-center">
                    <div className="flex gap-2 ">
                        <Button disabled={isSaving} variant="outline" onClick={saveMindmap}>
                            <Save />
                            {isSaving ? 'Saving...' : 'Save mindmap'}
                        </Button>
                        <DownloadButton />
                    </div>
                    <FileSheet />
                    <NodeSheet />
                </Panel>
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
}
