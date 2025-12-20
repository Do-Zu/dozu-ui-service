import { IFlashcard } from '@/app/[locale]/flashcards/types/flashcard.type';
import { Edge, Node } from '@xyflow/react';
import { NextRouter } from 'next/router';

export type CustomEdge = {
    id: string;
    type?: string;
    source: string;
    target: string;
    color?: string;
};

export type CustomNodeData = {
    nodeId: string;
    label: string;
    description?: string;
    isRoot?: boolean;
    topicId?: string; // Add topicId here if it's part of your data
    forceToolbarVisible?: boolean;
    // pdf fields
    pageStartIndex?: number;
    pageEndIndex?: number;

    // youtube fields
    startSegment?: number;
    endSegment?: number;

    statistics?: NodeStat;
    color?: string;
    roadmapOrder?: number;
    isComplete?: boolean;
};

export type AppNode = Node<CustomNodeData>;
export type AppEdge = Edge<CustomEdge>;

export interface CustomNode {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        description: string;
        pageStartIndex: string;
        pageEndIndex: string;
        nodeId: string; //includes more later like the above
        isRoot?: boolean;
        color?: string;
    };
    type: string;
}

export type NodeStat = {
    nodeId: string;
    total: number;
    mature: number;
};

export interface INodeFlashcards {
    flashcards: IFlashcard[];
    summaryData: any;
}

export interface ILinkFlashcardsToNodePayload {
    topicId: number;
    nodeId: string;
    unlinkedFlashcards: number[];
    linkedFlashcards: number[];
}

export interface IColorTheme {
    name: string;
    colors: string[];
}

export type IMindmapType = 'abstract' | 'detailed';

export interface IMindmapGenerateOptions {
    type?: IMindmapType;
    colorTheme?: IColorTheme | null;
    instruction?: string;
}
