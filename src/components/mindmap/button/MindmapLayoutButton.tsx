import { Button } from '@/components/ui/button';
import { ArrowRightFromLine } from 'lucide-react';
import React, { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { getLayoutedElements } from '@/app/[locale]/mindmap/utils/mindmap.utils';
import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
const elkOptions = {
    'elk.algorithm': 'radial',
    // 'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '80',
};


const MindmapLayoutButton = ({ nodes, edges, setNodes, setEdges, fitView }:LayoutButtonProps) => {
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
        [nodes, edges],
    );

    return (
        <Button
            variant="outline"
            onClick={() => {
                onLayout({ direction: 'DOWN' });
            }}
        >
            <ArrowRightFromLine />
            Set Mindmap layout
        </Button>
    );
};

export default MindmapLayoutButton;
