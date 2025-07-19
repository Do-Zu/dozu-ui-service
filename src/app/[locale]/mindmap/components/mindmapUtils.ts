import Axios from '@/api/axios';
import { AppEdge, AppNode } from '../mindmap.type';
import { v4 as uuidv4 } from 'uuid';

interface IDeleteNodeParams {
    nodeId: string;
    edges: AppEdge[];
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>; // Setter function for nodes state
    setEdges: React.Dispatch<React.SetStateAction<AppEdge[]>>; // Setter function for edges state
}

export const deleteNode = ({ nodeId, edges, setNodes, setEdges }: IDeleteNodeParams) => {
    console.log({ nodeId, edges, setNodes, setEdges });
    edges.forEach((edge) => {
        if (edge.source === nodeId) {
            deleteNode({ nodeId: edge.target, edges, setNodes, setEdges });
        }
    });
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
};

interface ISaveMindMapParams {
    topicId: string;
    nodes: AppNode[];
    edges: AppEdge[];
}

export const saveMindmap = async ({ topicId, nodes, edges }: ISaveMindMapParams) => {
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
};

interface IChangeNodeLabelParams {
    nodes: AppNode[];
    nodeId: string;
    newLabel: string;
    newDescription: string;
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
    pageStartIndex: number;
    pageEndIndex: number;
}
export const changeNodeLabel = ({
    nodes,
    nodeId,
    newLabel,
    newDescription,
    setNodes,
    pageStartIndex,
    pageEndIndex,
}: IChangeNodeLabelParams) => {
    const updatedNodes = nodes.map((node) => {
        if (node.data.nodeId === nodeId) {
            // Create a new node object with updated data
            return {
                ...node,
                data: {
                    ...node.data,
                    label: newLabel,
                    description: newDescription,
                    pageStartIndex: pageStartIndex,
                    pageEndIndex: pageEndIndex,
                },
            };
        } else {
            return node;
        }
    });
    setNodes(updatedNodes);
};

interface IAddChildNodeParams {
    currentNodeId: string;
    screenToFlowPosition: any;
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<AppEdge[]>>;
}

export const addChildNode = ({ screenToFlowPosition, setNodes, setEdges, currentNodeId }: IAddChildNodeParams) => {
    const id = uuidv4();
    const newNode: AppNode = {
        id: id,
        type: 'custom-react-flow-node',
        position: screenToFlowPosition({ x: 0, y: 0 }),
        data: { nodeId: id, label: `Empty node` },
        origin: [0.5, 0.0],
    };

    setNodes((nds) => nds.concat([newNode]));
    setEdges((eds) => eds.concat({ id: `${id}-${currentNodeId}`, source: currentNodeId, target: id }));
};
