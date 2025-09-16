import { Edge, Node } from '@xyflow/react';
import { NextRouter } from 'next/router';

export type CustomEdge = {
    id: string;
    type?: string;
    source: string;
    target: string;
};

export type CustomNodeData = {
    nodeId: string;
    label: string;
    description?: string;
    isRoot?: boolean;
    topicId?: string; // Add topicId here if it's part of your data
    forceToolbarVisible?: boolean;
    pageStartIndex?: number;
    pageEndIndex?: number;
    statistics?: NodeStat;
};

export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge<CustomEdge>;

export interface CustomNode {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        pageStartIndex: string;
        pageEndIndex: string;
        nodeId: string; //includes more later like the above
    };
    type: string;
}

export type NodeStat = {
    nodeId: string;
    total: number;
    mature: number;
};

