import { Button } from '@/components/ui/button';
import { ArrowRightFromLine, CircleDashed } from 'lucide-react';
import React, { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { getLayoutedElements } from '@/utils/mindmap/mindmapUtils';
import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';
import { radialLayoutElkOptions } from '@/app/[locale]/mindmap/constants';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const elk = new ELK();

// Elk has a *huge* amount of options to configure. To see everything you can
// tweak check out:
//
// - https://www.eclipse.org/elk/reference/algorithms.html
// - https://www.eclipse.org/elk/reference/options.html
// const elkOptions = {
//     'elk.algorithm': 'radial',
//     'elk.spacing.nodeNode': '100', // extra space between siblings
//     'elk.radial.radius': '0.5',
//     'elk.radial.minEdgeLength': '50', // avoid edge overlap
//     'elk.radial.edges': 'STRAIGHT', // cleaner edges
//     'elk.radial.toNode': 'PREFERRED_CHILD', // keeps child grouping predictable
//     'elk.padding': '[top=10,left=10,bottom=10,right=10]', // margin around layout
// };

const RadialLayoutButton = ({ nodes, edges, setNodes, setEdges, fitView, isPanelExpanded }: LayoutButtonProps) => {
    const onLayout = useCallback(
        ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
            const opts = { 'elk.direction': direction, ...radialLayoutElkOptions };
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
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon-sm"
                    variant="outline"
                    onClick={() => {
                        onLayout({ direction: 'DOWN' });
                    }}
                >
                    <CircleDashed />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="right"> {'Radial layout'}</TooltipContent>
        </Tooltip>
    );
};

export default RadialLayoutButton;
