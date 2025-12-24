import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';

export interface LayoutButtonProps {
    layoutNodes: AppNode[];
    layoutEdges: AppEdge[];
    isPanelExpanded: boolean;
    onLayoutSuccess?: (args: { layoutedNodes: AppNode[]; layoutedEdges: AppEdge[] }) => void;
}
