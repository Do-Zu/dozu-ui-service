import { Button } from '@/components/ui/button';
import { ArrowDownFromLine, ArrowRightFromLine } from 'lucide-react';
import React, { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';
import { getLayoutedElements } from '@/utils/mindmap/mindmapUtils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const elk = new ELK();

const elkOptions = {
    'elk.algorithm': 'layered',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '160',
};

const VerticalLayoutButton = ({
    layoutNodes: nodes,
    layoutEdges: edges,
    isPanelExpanded,
    onLayoutSuccess,
}: LayoutButtonProps) => {
    const onLayout = useCallback(
        ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
            const opts = { 'elk.direction': direction, ...elkOptions };
            // const ns = useInitialNodes ? initialNodes : nodes;
            // const es = useInitialNodes ? initialEdges : edges;

            getLayoutedElements(nodes, edges, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
                onLayoutSuccess?.({ layoutedNodes, layoutedEdges });
            });
        },
        [nodes, edges, onLayoutSuccess],
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
                    <ArrowDownFromLine />
                    {isPanelExpanded ? 'Set vertical layout' : ''}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"> {'Vertical layout'}</TooltipContent>
        </Tooltip>
    );
};

export default VerticalLayoutButton;
