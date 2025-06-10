import { Button } from '@/components/ui/button';
import {
  Handle,
  NodeToolbar,
  Position,
  useEdges,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

const initialNodes = [
  // {
  //   id: "1",
  //   type: "input",
  //   data: { label: "Mind Map" },
  //   position: { x: 0, y: 0 },
  // },
];

const CustomReactFlowNode = ({ data }) => {
  console.log(data);
  const { screenToFlowPosition, setNodes, setEdges } = useReactFlow();
  const edges = useEdges();
  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const addNode = () => {
    const id = uuidv4();
    const newNode = {
      id: id,
      type: 'custom-react-flow-node',
      position: screenToFlowPosition({ x: 0, y: 0 }),
      data: { nodeId: id, label: `Empty node` },
      origin: [0.5, 0.0],
    };
    setNodes((nds) => nds.concat(newNode));
    setEdges((eds) => eds.concat({ id: `${id}-${data.nodeId}`, source: data.nodeId, target: id }));
  };
  const deleteNode = (id) => {
    edges.forEach((edge) => {
      if (edge.source === id) {
        deleteNode(edge.target);
      }
    });
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    console.log(edges);
  };

  const handleAddChild = () => {
    addNode();
  };

  const handleDelete = () => {
    deleteNode(data.nodeId);
  };

  return (
    <div
      className={`
        bg-white border border-[#ededed] rounded-lg
        shadow-[0px_3.54px_4.55px_0px_rgba(0,0,0,0.02),0px_3.54px_4.55px_0px_rgba(0,0,0,0.05),0px_0.51px_1.01px_0px_rgba(0,0,0,0.1)]
        px-4 py-2 text-sm text-center flex flex-col items-center justify-center
      `}
    >
      {/* <Handle type="source" position={Position.Top} id="a" /> */}
      {/* <Handle type="source" position={Position.Right} id="b" /> */}
      {/* <Handle type="source" position={Position.Bottom} id="c" /> */}
      {/* <Handle type="source" position={Position.Left} id="d" /> */}
      <Handle
        className="w-full h-full bg-blue-500 absolute top-0 left-0 rounded-none transform-none border-none opacity-0"
        position={Position.Right}
        type="source"
      />

      <Handle
        className="w-full h-full bg-blue-500 absolute top-0 left-0 rounded-none transform-none border-none opacity-0"
        position={Position.Left}
        type="target"
        isConnectableStart={false}
      />
      <Handle
        className="w-full h-full bg-blue-500 absolute top-0 left-0 rounded-none transform-none border-none opacity-0"
        position={Position.Bottom}
        type="target"
        isConnectableStart={false}
      />
      <Handle
        className="w-full h-full bg-blue-500 absolute top-0 left-0 rounded-none transform-none border-none opacity-0"
        position={Position.Right}
        type="target"
        isConnectableStart={false}
      />
      <Handle
        className="w-full h-full bg-blue-500 absolute top-0 left-0 rounded-none transform-none border-none opacity-0"
        position={Position.Top}
        type="target"
        isConnectableStart={false}
      />
      <NodeToolbar isVisible={data.forceToolbarVisible || undefined} position={Position.Bottom}>
        <Button onClick={handleAddChild}>Add child</Button>
        {/* <Button>copy</Button> */}
        <Button onClick={handleDelete}>Delete</Button>
      </NodeToolbar>
      <div>{data?.label}</div>
    </div>
  );
};

export default CustomReactFlowNode;
