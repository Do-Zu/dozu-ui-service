'use client';

import React, { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { useParams, useRouter } from 'next/navigation';
import Axios from '@/api/axios';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import FloatingEdge from '../components/FloatingEdge';
import { v4 as uuidv4 } from 'uuid';
import {
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { Button } from '@/components/ui/button';
import { Edge } from '../mindmap.type';

const initialNodes = [
  {
    id: '1',
    type: 'custom-react-flow-node',
    position: { x: 0, y: 0 },
    data: { nodeId: '1', label: '1', isRoot: true },
  },
];
const initialEdges: Edge[] = [];

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
  const [isLoading, setIsLoading] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const params = useParams();
  const router = useRouter();
  const topicId = params.id;

  if (!params?.id) return <div>No topic id is provided</div>;

  useEffect(() => {
    const getTopic = async () => {
      const result = await Axios.get(`/topics/${params.id}`);
      console.log(result.data.data);
      const id = uuidv4();
      setNodes([
        {
          id: id,
          type: 'custom-react-flow-node',
          position: { x: 0, y: 0 },
          data: { nodeId: id, label: result.data.data.name, isRoot: true },
        },
      ]);
    };
    const getMindmap = async () => {
      try {
        const result = await Axios.get(`/mindmap/${params.id}`);
        console.log(result.data.data.resultMindmap.mindmapData);
        const mindmapData = result.data.data.resultMindmap.mindmapData;
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

  // const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div className="w-full h-full">
      {/* <ReactFlowProvider> */}
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
        <Panel position="top-left">React Flow Mind Map</Panel>
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      {/* </ReactFlowProvider> */}
    </div>
  );
};

export default MindmapPage;
