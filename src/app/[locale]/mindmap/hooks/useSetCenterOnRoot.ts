
import { AppNode } from '@/types/mindmap/mindmap.type';
import { Background, BackgroundVariant, ColorMode, Controls, Panel, ReactFlow, useReactFlow } from '@xyflow/react';
import { useEffect, useRef } from 'react';

interface useSetCenterOnRootParams {
  nodes: AppNode[];
}

export function useSetCenterOnRoot({ nodes }: useSetCenterOnRootParams) {
  const hasCentered = useRef(false);
const { setCenter } = useReactFlow();

  useEffect(() => {
    if (!hasCentered.current && nodes.length > 1) {
      const rootNode = nodes.find((node) => node.data.isRoot);
      if (rootNode) {
        setCenter(rootNode.position.x, rootNode.position.y, { duration: 800, zoom: 1 });
        hasCentered.current = true;
      }
    }
  }, [nodes, setCenter]);
}