import { Input } from '@/components/ui/input';
import { Handle, Node, Position, useEdges, useReactFlow } from '@xyflow/react';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CustomNodeData } from '../mindmap.type';
import { useDispatch } from 'react-redux';
import { openSheet, setSelectedNodeData } from '@/stores/features/mindmap/selectedNodeSlice';
import { getRouter } from '@/utils/routerService';

const CustomReactFlowNode = ({ data }: { data: CustomNodeData }) => {
    const dispatch = useDispatch();
    const router = getRouter();

    const [editing, setEditing] = useState(false);
    const [label, setLabel] = useState(data.label);
    const { screenToFlowPosition, getNodes, setNodes, setEdges } = useReactFlow();
    const edges = useEdges();

    const deleteNode = (id: string) => {
        edges.forEach((edge) => {
            if (edge.source === id) {
                deleteNode(edge.target);
            }
        });
        setNodes((nds) => nds.filter((node) => node.id !== id));
        setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
        console.log(edges);
    };

    const onChangeLabel = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLabel(e.target.value);
    };

    const handleClickNode = () => {
        dispatch(openSheet());
        dispatch(setSelectedNodeData(data));
    };

    return (
        <div
            className={`
        bg-white border border-[#ededed] rounded-lg
        shadow-[0px_3.54px_4.55px_0px_rgba(0,0,0,0.02),0px_3.54px_4.55px_0px_rgba(0,0,0,0.05),0px_0.51px_1.01px_0px_rgba(0,0,0,0.1)]
        px-4 py-2 text-sm text-center flex flex-col items-center justify-center
      `}
            onClick={handleClickNode}
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

            {editing ? <Input value={label} onChange={onChangeLabel} /> : <div>{data?.label}</div>}
        </div>
    );
};

export default CustomReactFlowNode;
