type NodeData = {
    id: string;
    position: { x: number; y: number };
    data: {
        label: string;
        pageStartIndex?: number;
        pageEndIndex?: number;
    };
};

type EdgeData = {
    id: string;
    source: string;
    target: string;
};

export type MindmapData = {
    nodes: NodeData[];
    edges: EdgeData[];
};
