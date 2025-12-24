import { Button } from '@/components/ui/button';
import { ArrowRightFromLine } from 'lucide-react';
import React, { useCallback } from 'react';
import ELK from 'elkjs/lib/elk.bundled.js';
import { getLayoutedElements } from '@/utils/mindmap/mindmapUtils';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { FitView } from '@xyflow/react';
import { LayoutButtonProps } from '@/app/[locale]/mindmap/types/layoutButton.types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const elkOptions = {
    'elk.algorithm': 'mrtree',
    'elk.layered.spacing.nodeNodeBetweenLayers': '100',
    'elk.spacing.nodeNode': '120',
};

const HorizontalLayoutButton = ({
    layoutNodes: nodes,
    layoutEdges: edges,
    isPanelExpanded,
    onLayoutSuccess,
}: LayoutButtonProps) => {
    const onLayout = useCallback(
        ({ direction, useInitialNodes = false }: { direction: string; useInitialNodes?: boolean }) => {
            const opts = { 'elk.direction': direction ?? 'RIGHT', ...elkOptions };
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
                        onLayout({ direction: 'RIGHT' });
                    }}
                >
                    <ArrowRightFromLine />
                    {isPanelExpanded ? 'Set horizontal layout' : ''}
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom"> {'Horizontal layout'}</TooltipContent>
        </Tooltip>
    );
};

export default HorizontalLayoutButton;
