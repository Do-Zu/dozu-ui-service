'use client';

import { Button } from '@/components/ui/button';
import {
  addEdge,
  Background,
  Controls,
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';

const initialNodes = [
  { id: '1', type: 'default', position: { x: 0, y: 0 }, data: { label: '123' } },
  { id: '2', type: 'default', position: { x: 0, y: 100 }, data: { label: '2' } },
];
const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];

const TestMindMapPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        // edgeTypes={edgeTypes}
        onConnect={onConnect}
      >
        <Panel position="top-center">
          <Button>Something</Button>
        </Panel>
        <Panel position="top-left">React Flow Mind Map</Panel>
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default TestMindMapPage;
