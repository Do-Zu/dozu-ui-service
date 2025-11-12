import DownloadButton from '@/components/mindmap/button/DownloadButton';
import EditMindmapButton from '@/components/mindmap/button/EditMindmapButton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel, useReactFlow } from '@xyflow/react';
import React, { useState } from 'react';
import ExportToCSVButton from '@/app/[locale]/mindmap/components/buttons/ExportToCSVButton';
import HorizontalLayoutButton from '@/components/mindmap/button/HorizontalLayoutButton';
import VerticalLayoutButton from '@/components/mindmap/button/VerticalLayoutButton';
import MindmapLayoutButton from '@/components/mindmap/button/MindmapLayoutButton';
import DeleteMindmapButton from '@/components/mindmap/button/DeleteMindmapButton';
import { useMindMapContext } from '../context/MindMapContext';
import { Expand, Save } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
// import ImportMindmapButton from './buttons/ImportMindmapButton';
import ImportButton from './buttons/ImportButton';
import RoadmapButton from './buttons/RoadmapButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
// import ImportMindmapButton from '@/app/[locale]/mindmap/components/buttons/ImportMindmapButton';

// import { Toggle } from "@/components/ui/toggle"

const MindmapButtonsPanel = ({}) => {
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

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

    const { fitView } = useReactFlow();

    return (
        <Panel position="top-center">
            {/* <Card className="p-2"> */}
            {/* <div className="pb-2">
                    <Toggle
                        size="sm"
                        pressed={isPanelExpanded}
                        onPressedChange={(pressed) => setIsPanelExpanded(pressed)}
                    >
                        <Expand />
                    </Toggle>
                </div> */}
            <div className="flex gap-2 flex-row">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button size="icon-sm" disabled={isSaving} variant="outline" onClick={saveMindmap}>
                            <Save />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{isSaving ? 'Saving...' : 'Save mindmap'}</TooltipContent>
                </Tooltip>
                {/* <Separator className="my-4" /> */}

                <EditMindmapButton isPanelExpanded={isPanelExpanded} />
                <RoadmapButton isPanelExpanded={isPanelExpanded} nodes={nodes} edges={edges} />
                <DownloadButton isPanelExpanded={isPanelExpanded} />
                {/* <ImportMindmapButton isPanelExpanded={isPanelExpanded} /> */}
                <ImportButton isPanelExpanded={isPanelExpanded} />
                <ExportToCSVButton isPanelExpanded={isPanelExpanded} />
                <HorizontalLayoutButton
                    nodes={nodes}
                    edges={edges}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    fitView={fitView}
                    isPanelExpanded={isPanelExpanded}
                />
                <VerticalLayoutButton
                    nodes={nodes}
                    edges={edges}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    fitView={fitView}
                    isPanelExpanded={isPanelExpanded}
                />
                <MindmapLayoutButton
                    nodes={nodes}
                    edges={edges}
                    setNodes={setNodes}
                    setEdges={setEdges}
                    fitView={fitView}
                    isPanelExpanded={isPanelExpanded}
                />

                <DeleteMindmapButton isPanelExpanded={isPanelExpanded} />
            </div>
            {/* </Card> */}
        </Panel>
    );
};

export default MindmapButtonsPanel;
