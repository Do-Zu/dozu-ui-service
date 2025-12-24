import { AppNode } from '@/types/mindmap/mindmap.type';
import { useReactFlow } from '@xyflow/react';
import { useCallback } from 'react';
import { useMindMapContext } from '../context/MindMapContext';
import { getLayoutedElements } from '@/utils/mindmap/mindmapUtils';
import { mindmapLayoutElkOptions } from '../constants';

// const elkOptions = {
//     'elk.algorithm': 'radial',
//     // 'elk.layered.spacing.nodeNodeBetweenLayers': '100',
//     'elk.spacing.nodeNode': '80',
    
// };

export function useSetMindmapLayout() {
    const { fitView } = useReactFlow();
    const {
        topicId,
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        isSaving,
        saveMindmap,
        sseData,
        sseStatus,
        isProcessingRegisterGenerate,
    } = useMindMapContext();
    const onLayout = useCallback(
        ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
            const opts = { 'elk.direction': direction, ...mindmapLayoutElkOptions };
            // const ns = useInitialNodes ? initialNodes : nodes;
            // const es = useInitialNodes ? initialEdges : edges;

            getLayoutedElements(nodes, edges, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                fitView();
            });
        },
        [nodes, edges, setNodes, setEdges, fitView],
    );
    return onLayout;
}
