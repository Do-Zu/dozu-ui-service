import { Button } from '@/components/ui/button';
import { ArrowRightFromLine } from 'lucide-react';
import React, { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { getLayoutedElements } from '@/app/[locale]/mindmap/utils/mindmap.utils';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { FitView } from '@xyflow/react';
import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';

const elkOptions = {
    'elk.algorithm': 'mrtree',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    // 'elk.spacing.nodeNode': '80',
};

const HorizontalLayoutButton = ({ nodes, edges, setNodes, setEdges, fitView }: LayoutButtonProps) => {
    const onLayout = useCallback(
        ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
            const opts = { 'elk.direction': direction, ...elkOptions };
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

    return (
        <Button
            variant="outline"
            onClick={() => {
                onLayout({ direction: 'RIGHT' });
            }}
        >
            <ArrowRightFromLine />
            Set horizontal layout
        </Button>
    );
};

export default HorizontalLayoutButton;
