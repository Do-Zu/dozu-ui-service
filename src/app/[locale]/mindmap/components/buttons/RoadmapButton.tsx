import { Button } from '@/components/ui/button';

import React from 'react';

import { useTranslations } from 'next-intl';
import { Signpost } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import RoadmapList from '../RoadmapList';

interface RoadmapButtonProps {
    isPanelExpanded: boolean;
    nodes: AppNode[];
    edges: AppEdge[];
}

const RoadmapButton = ({ isPanelExpanded, nodes, edges }: RoadmapButtonProps) => {
    const t = useTranslations('RoadmapButton');



    const rootNode = nodes.find((node) => node.data.isRoot === true);
    const baseNodes:string[] = [];
    const baseEdges = edges.filter((edge) => edge.source === rootNode?.data.nodeId);
    baseEdges.forEach((edge) => {
        baseNodes.push(edge.target);
    });


    return (

        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline">
                    <Signpost />
                    {isPanelExpanded ? t('RoadmapButtonLabel') : ''}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>{t('RoadmapButtonLabel')}</SheetTitle>

                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">

                    <RoadmapList
                        initialItems={baseNodes}
                        nodes={nodes}
                    />
                </div>

            </SheetContent>
        </Sheet>
    );
};

export default RoadmapButton;
