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
import { Save } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
// import ImportMindmapButton from './buttons/ImportMindmapButton';
import ImportButton from './buttons/ImportButton';
import RoadmapButton from './buttons/RoadmapButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import SelectMultipleButton from '@/components/mindmap/button/SelectMultipleButton';
import { useAppSelector } from '@/stores/hooks';
import ChangeColorThemeButton from '@/components/mindmap/button/ChangeColorThemeButton';
import { AppEdge, AppNode } from '@/types/mindmap/mindmap.type';
import { getFilteredEdges, getFilteredNodes } from '@/utils/mindmap/mindmapUtils';
// import ImportMindmapButton from '@/app/[locale]/mindmap/components/buttons/ImportMindmapButton';

// import { Toggle } from "@/components/ui/toggle"

interface StudentProps {
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    role?: UserRoleEnum.TEACHER;
}

type Props = { mode?: ILearningMode } & (StudentProps | TeacherProps);

const MindmapButtonsPanel = ({ mode, role = UserRoleEnum.TEACHER }: Props) => {
    const [isPanelExpanded, setIsPanelExpanded] = useState(false);

    const isMultiSelectMode = useAppSelector((state) => state.selectedNodeSlice.isMultiSelectMode);

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

    const hiddenNodeIds = useAppSelector((state) => state.selectedNodeSlice.hiddenNodeIds);

    const filteredNodes = getFilteredNodes(nodes, hiddenNodeIds);
    const filteredEdges = getFilteredEdges(edges, hiddenNodeIds);

    function onLayoutSuccess({ layoutedNodes, layoutedEdges }: { layoutedNodes: AppNode[]; layoutedEdges: AppEdge[] }) {
        setNodes((prev) => {
            return prev.map((node) => {
                const layoutedNode = layoutedNodes.find((item) => item.data.nodeId === node.data.nodeId);
                return layoutedNode ? layoutedNode : node;
            });
        });
        setEdges((prev) => {
            return prev.map((edge) => {
                const layoutedEdge = layoutedEdges.find(
                    (item) => item.source === edge.source && item.target === edge.target,
                );
                return layoutedEdge ? layoutedEdge : edge;
            });
        });
        fitView();
    }

    return (
        <Panel position="top-center">
            <div className="flex gap-2 flex-row">
                {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                    <>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon-sm" disabled={isSaving} variant="outline" onClick={saveMindmap}>
                                    <Save />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">{isSaving ? 'Saving...' : 'Save mindmap'}</TooltipContent>
                        </Tooltip>
                        <EditMindmapButton disabled={isMultiSelectMode} isPanelExpanded={isPanelExpanded} />
                        <SelectMultipleButton />
                        <ChangeColorThemeButton />
                    </>
                ) : (
                    ''
                )}

                <DownloadButton />
                {mode === MODE_ACCESS_PAGE_ROLE.personal || role === UserRoleEnum.TEACHER ? (
                    <>
                        <ImportButton isPanelExpanded={isPanelExpanded} />
                    </>
                ) : (
                    ''
                )}
                <ExportToCSVButton isPanelExpanded={isPanelExpanded} />
                <HorizontalLayoutButton
                    layoutNodes={filteredNodes}
                    layoutEdges={filteredEdges}
                    isPanelExpanded={isPanelExpanded}
                    onLayoutSuccess={onLayoutSuccess}
                />
                <VerticalLayoutButton
                    layoutNodes={filteredNodes}
                    layoutEdges={filteredEdges}
                    isPanelExpanded={isPanelExpanded}
                    onLayoutSuccess={onLayoutSuccess}
                />
                <MindmapLayoutButton
                    layoutNodes={filteredNodes}
                    layoutEdges={filteredEdges}
                    isPanelExpanded={isPanelExpanded}
                    onLayoutSuccess={onLayoutSuccess}
                />

                <DeleteMindmapButton isPanelExpanded={isPanelExpanded} />
            </div>
            {/* </Card> */}
        </Panel>
    );
};

export default MindmapButtonsPanel;
