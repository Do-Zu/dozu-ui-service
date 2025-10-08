import { AppEdge, AppNode } from "@/types/mindmap/mindmap.type";
import { FitView } from "@xyflow/react";

export interface LayoutButtonProps {
    nodes: AppNode[];
    edges: AppEdge[];
    setNodes: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
    setEdges: (edges: AppEdge[] | ((edges: AppEdge[]) => AppEdge[])) => void;
    fitView: FitView;
}
