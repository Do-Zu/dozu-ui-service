import { Button } from '@/components/ui/button';

import React from 'react';

import { useTranslations } from 'next-intl';
import { Signpost } from 'lucide-react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Sign } from 'crypto';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import OutlineTree from './OutlineTree';
import RoadmapList from '../RoadmapList';

interface RoadmapButtonProps {
    isPanelExpanded: boolean;
    nodes: AppNode[];
    edges: AppEdge[];
}

const RoadmapButton = ({ isPanelExpanded, nodes, edges }: RoadmapButtonProps) => {
    const t = useTranslations('RoadmapButton');

    const handleOnClickRoadmap = () => {};

    const rootNode = nodes.find((node) => node.data.isRoot === true);
    const baseNodes:string[] = [];
    const baseEdges = edges.filter((edge) => edge.source === rootNode?.data.nodeId);
    baseEdges.forEach((edge) => {
        baseNodes.push(edge.target);
    });


    return (
        // <Button variant="outline" onClick={handleOnClickRoadmap}>
        //     <Signpost />
        // </Button>
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
                    {/* <SheetDescription>
                        Make changes to your profile here. Click save when you&apos;re done.
                    </SheetDescription> */}
                </SheetHeader>
                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    {/* <OutlineTree
                        root="Present Tense in English"
                        children={[
                            'The Simple Present',
                            'Present Continuous',
                            'Present Perfect',
                            'Stative vs Dynamic Verbs',
                        ]}
                    /> */}
                    <RoadmapList
                        initialItems={baseNodes}
                        nodes={nodes}
                    />
                </div>
                {/* <SheetFooter>
                    <Button type="submit">Save changes</Button>
                    <SheetClose asChild>
                        <Button variant="outline">Close</Button>
                    </SheetClose>
                </SheetFooter> */}
            </SheetContent>
        </Sheet>
    );
};

export default RoadmapButton;
