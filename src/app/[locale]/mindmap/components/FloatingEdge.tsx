import { EdgeProps, getBezierPath, useInternalNode } from '@xyflow/react';

import { getEdgeParams } from '../../../../utils/mindmap/initialElements';

function FloatingEdge({ id, source, target, markerEnd, style, data }: EdgeProps) {
    const sourceNode = useInternalNode(source);
    const targetNode = useInternalNode(target);

    if (!sourceNode || !targetNode) {
        return null;
    }

    const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);

    const [edgePath] = getBezierPath({
        sourceX: sx,
        sourceY: sy,
        sourcePosition: sourcePos,
        targetPosition: targetPos,
        targetX: tx,
        targetY: ty,
    });

    const edgeStyle = data?.color
        ? {
              ...style,
              stroke: data.color as string,
              strokeWidth: style?.strokeWidth ?? 2,
              transition: 'stroke 0.2s ease',
          }
        : style;

    return <path id={id} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} style={edgeStyle} />;
}

export default FloatingEdge;
