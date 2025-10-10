import { AppEdge, AppNode } from "@/types/mindmap/mindmap.type";
import ELK, { ElkExtendedEdge, ElkNode, LayoutOptions } from "elkjs/lib/elk.bundled.js";

const elk = new ELK();


export const getLayoutedElements = async (
  nodes: AppNode[],
  edges: AppEdge[],
  options: LayoutOptions = {}
) => {
  const isHorizontal = options?.["elk.direction"] === "RIGHT";

  const graph: ElkNode = {
    id: "root",
    layoutOptions: options,
    children: nodes.map((node) => ({
      id: node.id,
      width: 150,
      height: 50,
    })),
    edges: edges.map(
      (edge): ElkExtendedEdge => ({
        id: edge.id,
        sources: [edge.source],
        targets: [edge.target],
      })
    ),
  };

  try {
    const layoutedGraph = await elk.layout(graph);

    // ✅ Handle possible undefined children safely
    const layoutedNodes: AppNode[] =
      layoutedGraph.children?.map((node) => {
        const original = nodes.find((n) => n.id === node.id)!;
        return {
          ...original, // preserve React Flow-specific data, type, etc.
          position: { x: node.x ?? 0, y: node.y ?? 0 },
        };
      }) ?? [];

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
