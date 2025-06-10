'use client';

import { Button } from '@/components/ui/button';
import {
  addEdge,
  Background,
  Controls,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { useCallback } from 'react';
import CustomReactFlowNode from '../components/CustomReactFlowNode';
import SimpleFloatingEdge from '../components/SimpleFloatingEdge';
import FloatingEdge from '../components/FloatingEdge';

const initialNodes = [
  {
    id: '1',
    type: 'custom-react-flow-node',
    position: { x: 0, y: 0 },
    data: { nodeId: '1', label: '123' },
  },
  {
    id: '2',
    type: 'custom-react-flow-node',
    position: { x: 0, y: 100 },
    data: { nodeId: '2', label: '2' },
  },
];
const initialEdges = [{ id: 'e1-2', type: 'floating', source: '1', target: '2' }];

const nodeTypes = {
  'custom-react-flow-node': CustomReactFlowNode,
};

// const edgeTypes = {
//   floating: SimpleFloatingEdge,
// };

const edgeTypes = {
  floating: FloatingEdge,
};

const defaultEdgeOptions = {
  type: 'floating',
  // markerEnd: {
  //   type: MarkerType.ArrowClosed,
  //   color: '#b1b1b7',
  // },
};

const TestMindMapPage: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const setPosition = useCallback(
    (pos) =>
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: { ...node.data, toolbarPosition: pos },
        })),
      ),
    [setNodes],
  );

  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = getId();
        const { clientX, clientY } = 'changedTouches' in event ? event.changedTouches[0] : event;
        const newNode = {
          id,
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          data: { label: `Node ${id}` },
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) => eds.concat({ id, source: connectionState.fromNode.id, target: id }));
      }
    },
    [screenToFlowPosition],
  );

  const forceToolbarVisible = useCallback((enabled) =>
    setNodes((nodes) =>
      nodes.map((node) => ({
        ...node,
        data: { ...node.data, forceToolbarVisible: enabled },
      })),
    ),
  );

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* <ReactFlowProvider> */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        defaultEdgeOptions={defaultEdgeOptions}
      >
        <Panel position="top-center">
          <Button>Something</Button>
        </Panel>
        <Panel position="top-left">React Flow Mind Map</Panel>
        <Controls />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
      {/* </ReactFlowProvider> */}
    </div>
  );
};

export default TestMindMapPage;
