import Axios from '@/api/axios';
import { AppEdge, AppNode } from '../../types/mindmap/mindmap.type';
import { v4 as uuidv4 } from 'uuid';

import { LayoutOptions, ElkNode, ElkExtendedEdge } from 'elkjs/lib/elk-api';
// import { GeneratedEdge } from './mindmapUtils';
import ELK from 'elkjs/lib/elk.bundled.js';
import { radialLayoutElkOptions } from '@/app/[locale]/mindmap/constants';

export const elk = new ELK();

export interface GeneratedEdge {
    id: string;
    source: string;
    target: string;
}

export interface GeneratedNode {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        description: string;
        pageStartIndex: number;
        pageEndIndex: number;
        isRoot: boolean;
        color?: string;
    };
}

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
    pageStartIndex?: number | undefined;
    pageEndIndex?: number | undefined;
    startSegment?: number | undefined;
    endSegment?: number | undefined;
}
export const changeNodeLabel = ({
    nodes,
    nodeId,
    newLabel,
    newDescription,
    setNodes,
    pageStartIndex,
    pageEndIndex,
    startSegment,
    endSegment,
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
                    startSegment,
                    endSegment,
                },
            };
        } else {
            return node;
        }
    });
    setNodes(updatedNodes);
};

interface IAddChildNodeParams {
    nodes: AppNode[];
    currentNodeId: string;
    screenToFlowPosition: any;
    setNodes: React.Dispatch<React.SetStateAction<AppNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<AppEdge[]>>;
}

export const addChildNode = ({
    nodes,
    screenToFlowPosition,
    setNodes,
    setEdges,
    currentNodeId,
}: IAddChildNodeParams) => {
    const parent = nodes.find((node) => node.data.nodeId === currentNodeId);
    if (!parent) return;

    const distance = 300;
    const newPos = { x: parent.position.x, y: parent.position.y };

    newPos.y += distance;

    const id = uuidv4();
    const newNode: AppNode = {
        id: id,
        type: 'custom-react-flow-node',
        // position: screenToFlowPosition({ x: 0, y: 0 }),
        position: newPos,
        data: { nodeId: id, label: `Empty node` },
        origin: [0.5, 0.5],
    };

    setNodes((nds) => nds.concat([newNode]));
    setEdges((eds) =>
        eds.concat({ id: `${id}-${currentNodeId}`, source: currentNodeId, target: id, type: 'floating' }),
    );
};
export const getLayoutedElements = async (
    nodes: AppNode[],
    edges: AppEdge[],
    options: LayoutOptions = radialLayoutElkOptions,
) => {
    const isHorizontal = options?.['elk.direction'] === 'RIGHT';

    const graph: ElkNode = {
        id: 'root',
        layoutOptions: options,
        children: nodes.map((node) => ({
            //FIX SPACING HERE :)
            id: node.id,
            width: 300,
            height: 100,
        })),
        edges: edges.map(
            (edge): ElkExtendedEdge => ({
                id: edge.id,
                sources: [edge.source],
                targets: [edge.target],
            }),
        ),
    };

    try {
        const layoutedGraph = await elk.layout(graph);

        //  Handle possible undefined children safely
        const layoutedNodes: AppNode[] =
            layoutedGraph.children?.map((node) => {
                const original = nodes.find((n) => n.id === node.id)!;
                return {
                    ...original, // preserve React Flow-specific data, type, etc.
                    position: { x: node.x ?? 0, y: node.y ?? 0 },
                };
            }) ?? [];

        //expand layout due to algorithm not adjusting for node size
        console.log('type', options['elk.algorithm']);
        if (options['elk.algorithm'] == 'org.eclipse.elk.stress') {
            console.log('is mindmap layout');

            layoutedNodes.forEach((node) => {
                node.position.x *= 1.2;
            });
        } else if (options['elk.algorithm'] == 'radial') {
            //or Shrink layout vertically
            layoutedNodes.forEach((node) => {
                node.position.y *= 0.7;
            });
        }

        const layoutedEdges: AppEdge[] = edges.map((edge) => ({
            ...edge,
        }));

        return {
            nodes: layoutedNodes,
            edges: layoutedEdges,
        };
    } catch (err) {
        console.error(err);
        return { nodes, edges }; // fallback
    }
};

export const getUpdatedEdges = (oldId: string, newId: string, edges: GeneratedEdge[]): GeneratedEdge[] => {
    return edges.map((edge) => ({
        ...edge,
        source: edge.source === oldId ? newId : edge.source,
        target: edge.target === oldId ? newId : edge.target,
    }));
};

export const getAllChildNodeAndSelfIds = ({
    nodes = [],
    edges = [],
    nodeId,
}: {
    nodes: AppNode[];
    edges: AppEdge[];
    nodeId: string;
}): string[] => {
    const result = new Set<string>();

    const dfs = (id: string) => {
        if (result.has(id)) return;
        result.add(id);

        edges.filter((edge) => edge.source === id).forEach((edge) => dfs(edge.target));
    };

    dfs(nodeId);
    return Array.from(result);
};

export const toggleComplete = ({
    allNodes,
    allEdges,
    nodeId,
    items,
    setItems,
    isComplete,
    setNodes,
}: {
    allNodes: AppNode[] | undefined;
    allEdges: AppEdge[] | undefined;
    nodeId: string;
    items: AppNode[];
    setItems: React.Dispatch<React.SetStateAction<AppNode[]>>;
    isComplete: boolean;
    setNodes: ((nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void) | undefined;
}) => {
    // Find and toggle the isComplete property on the node
    const nodesToUpdate =
        allNodes && allEdges ? getAllChildNodeAndSelfIds({ nodes: allNodes, edges: allEdges, nodeId }) : [nodeId]; // Fallback: just toggle the node itself if data is missing
    const updatedItems = items.map((node) => {
        if (nodesToUpdate.includes(node.data.nodeId)) {
            return {
                ...node,
                data: {
                    ...node.data,
                    isComplete: isComplete,
                },
            };
        }
        return node;
    });

    const updatedAllNodes = allNodes?.map((node) => {
        if (nodesToUpdate.includes(node.data.nodeId)) {
            return {
                ...node,
                data: {
                    ...node.data,
                    isComplete: isComplete,
                },
            };
        }
        return node;
    });

    setItems(updatedItems);

    // Propagate the updated completion state back to the global nodes via setNodes if provided
    if (setNodes && updatedAllNodes) {
        setNodes(updatedAllNodes);
        // setNodes(updatedItems);
    }
};

export const toggleCompleteWithoutItems = ({
    allNodes,
    allEdges,
    nodeId,
    isComplete,
    setNodes,
}: {
    allNodes: AppNode[] | undefined;
    allEdges: AppEdge[] | undefined;
    nodeId: string;

    isComplete: boolean;
    setNodes: ((nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void) | undefined;
}) => {
    // Find and toggle the isComplete property on the node
    const nodesToUpdate =
        allNodes && allEdges ? getAllChildNodeAndSelfIds({ nodes: allNodes, edges: allEdges, nodeId }) : [nodeId]; // Fallback: just toggle the node itself if data is missing

    const updatedAllNodes = allNodes?.map((node) => {
        if (nodesToUpdate.includes(node.data.nodeId)) {
            return {
                ...node,
                data: {
                    ...node.data,
                    isComplete: isComplete,
                },
            };
        }
        return node;
    });

    if (setNodes && updatedAllNodes) {
        setNodes(updatedAllNodes);
    }
};
