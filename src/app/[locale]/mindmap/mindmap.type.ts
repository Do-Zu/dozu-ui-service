import { NextRouter } from "next/router";

export interface Edge {
  id: string;
  type: string;
  source: string;
  target: string;
}

export type CustomNodeData = {
  nodeId: string;
  label: string;
  isRoot?: boolean;
  topicId?: string; // Add topicId here if it's part of your data
  router?: NextRouter; // Or AppRouterInstance if using App Router
  forceToolbarVisible?: boolean; // If you use this prop
};