import DownloadButton from '@/components/mindmap/button/DownloadButton';
import EditMindmapButton from '@/components/mindmap/button/EditMindmapButton';
import { Button } from '@/components/ui/button';
import { Panel, useReactFlow } from '@xyflow/react';
import React, { useState } from 'react';
import ExportToCSVButton from '@/app/[locale]/mindmap/components/buttons/ExportToCSVButton';

import DeleteMindmapButton from '@/components/mindmap/button/DeleteMindmapButton';
import { useMindMapContext } from '../context/MindMapContext';
import { Save } from 'lucide-react';

// import ImportMindmapButton from './buttons/ImportMindmapButton';
import ImportButton from './buttons/ImportButton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import SelectMultipleButton from '@/components/mindmap/button/SelectMultipleButton';
import { useAppSelector } from '@/stores/hooks';
import ChangeColorThemeButton from '@/components/mindmap/button/ChangeColorThemeButton';
import CustomizeMindmapLayoutOptionsButton from '@/components/mindmap/button/CustomizeMindmapLayoutOptionsButton';
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

    return (
        <Panel position="top-center">
            <div className="flex flex-row gap-2">
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

                <CustomizeMindmapLayoutOptionsButton
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
