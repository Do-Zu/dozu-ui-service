'use client';

import React, { useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useParams, useRouter } from 'next/navigation';
import Axios from '@/api/axios';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import FloatingEdge from '../components/FloatingEdge';
import { v4 as uuidv4 } from 'uuid';
import { Background, BackgroundVariant, Controls, Panel, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { CustomEdge } from '../mindmap.type';

const initialEdges: CustomEdge[] = [];

const defaultEdgeOptions = {
    type: 'floating',
};

const nodeTypes = {
    'custom-react-flow-node': CustomReactFlowNode,
};

const edgeTypes = {
    floating: FloatingEdge,
};

const MindmapPage = () => {
    const router = useRouter();
    const params = useParams();
    const topicId = params?.id;
    console.log('topicId', topicId);
    const [isLoading, setIsLoading] = useState(false);

    const initialNodes = [
        {
            id: '1',
            type: 'custom-react-flow-node',
            position: { x: 0, y: 0 },
            data: { nodeId: '1', label: '1', isRoot: true, topicId: topicId, router: router },
        },
    ];
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    if (!params?.id) return <div>No topic id is provided</div>;

    useEffect(() => {
        const getTopic = async () => {
            console.log('router', router);
            const result = await Axios.get(`/topics/${params.id}`);
            console.log(result.data.data);
            const id = uuidv4();
            setNodes([
                {
                    id: id,
                    type: 'custom-react-flow-node',
                    position: { x: 0, y: 0 },
                    data: {
                        nodeId: id,
                        label: result.data.data.name,
                        isRoot: true,
                        topicId: topicId, //remove
                        router: router, //remove
                    },
                },
            ]);
        };
        const getMindmap = async () => {
            try {
                const result = await Axios.get(`/mindmap/${params.id}`);
                console.log(result.data.data.resultMindmap.mindmapData);
                const mindmapData = result.data.data.resultMindmap.mindmapData;
                mindmapData.nodes = mindmapData.nodes.map((node: any) => {
                    return {
                        ...node,
                        data: { ...node.data, topicId: topicId, router: router },
                    };
                });
                console.log(mindmapData.nodes);
                setNodes(mindmapData.nodes);
                setEdges(mindmapData.edges);
            } catch (e) {
                // console.log('error', e);
                getTopic();
            }
        };

        getMindmap();
    }, []);

    const handleSaveMindMap = async () => {
        setIsLoading(true);
        try {
            const options: any = {
                body: {
                    title: 'a',
                    nodes: nodes,
                    edges: edges,
                },
            };
            const response = await Axios.post(`/mindmap/${topicId}`, options.body);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full h-full">
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
                <Panel position="top-center">
                    <Button disabled={isLoading} onClick={handleSaveMindMap}>
                        Save mind map
                    </Button>
                </Panel>
                {/* <Panel position="top-left">React Flow Mind Map</Panel> */}
                <Controls />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </div>
    );
};

export default MindmapPage;
