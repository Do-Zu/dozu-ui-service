export interface Edge {
  id: string;
  type: string;
  source: string;
  target: string;
}
export interface CustomNodeData {
  nodeId: string;
  label: string;
  isRoot?: boolean;
  forceToolbarVisible?: boolean;
}
