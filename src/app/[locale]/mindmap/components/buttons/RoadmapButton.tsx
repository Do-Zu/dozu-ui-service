import { Button } from '@/components/ui/button';
import React from 'react';
import { useTranslations } from 'next-intl';
import { Signpost } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import RoadmapList from '../RoadmapList';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RoadmapButtonProps {
    isPanelExpanded: boolean;
    nodes: AppNode[];
    edges: AppEdge[];
    setNodes?: (nodes: AppNode[] | ((nodes: AppNode[]) => AppNode[])) => void;
}

const RoadmapButton = ({ isPanelExpanded, nodes, edges, setNodes }: RoadmapButtonProps) => {
    const t = useTranslations('RoadmapButton');

    const rootNode = nodes.find((node) => node.data.isRoot === true);
    // const baseNodes: string[] = [];
    const baseNodes: AppNode[] = [];
        const baseEdges = edges.filter((edge) => edge.source === rootNode?.data.nodeId);
        baseEdges.forEach((edge) => {
            const targetNode = nodes.find((node) => node.data.nodeId === edge.target);
            if (targetNode) {
                baseNodes.push(targetNode);
            }
        });

    function normalizeRoadmapOrder(baseNodes: AppNode[]) {
        const total = baseNodes.length;

        // Step 1: Separate valid vs invalid order nodes
        const validNodes = baseNodes.filter((n) => {
            const order = n.data?.roadmapOrder;
            return typeof order === 'number' && order >= 0 && order < total;
        });

        const invalidNodes = baseNodes.filter((n) => !validNodes.includes(n));

        // Step 2: Sort valid nodes by their existing order
        validNodes.sort((a, b) => {
            const orderA = typeof a.data.roadmapOrder === 'number' ? a.data.roadmapOrder : 0;
            const orderB = typeof b.data.roadmapOrder === 'number' ? b.data.roadmapOrder : 0;
            return orderA - orderB;
        });

        // Step 3: Merge valid first, then invalid
        const finalOrdered = [...validNodes, ...invalidNodes];

        // Step 4: Assign new clean 0..N-1 order numbers
        finalOrdered.forEach((node, index) => {
            node.data.roadmapOrder = index;
        });

        return finalOrdered;
    }

    const orderedBaseNodes = normalizeRoadmapOrder(baseNodes);

    return (
        <Sheet>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button size="icon-sm" variant="outline">
                            <Signpost />
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">{t('RoadmapButtonLabel')}</TooltipContent>
            </Tooltip>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('RoadmapButtonLabel')}</SheetTitle>
                    <div className="grid flex-1 auto-rows-min gap-6 px-4">
                        <RoadmapList initialItems={orderedBaseNodes} setNodes={setNodes}/>
                    </div>
                </SheetHeader>
            </SheetContent>
        </Sheet>
    );
};

export default RoadmapButton;
