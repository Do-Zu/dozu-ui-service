import { Panel } from '@xyflow/react';
import React, { useState } from 'react';

import { useMindMapContext } from '../context/MindMapContext';

import RoadmapButton from './buttons/RoadmapButton';
import { UserRoleEnum } from '@/utils/constants/roles';
import { ILearningMode } from '@/stores/features/class-based-learning/learningModeSlice';

interface StudentProps {
    role: UserRoleEnum.USER;
}
interface TeacherProps {
    role?: UserRoleEnum.TEACHER;
}

type Props = { mode?: ILearningMode } & (StudentProps | TeacherProps);

const RoadmapButtonPanel = ({ mode, role = UserRoleEnum.TEACHER }: Props) => {
    const [isPanelExpanded] = useState(false);

    const { nodes, edges, setNodes } = useMindMapContext();

    return (
        <Panel position="top-right">
            <div className="flex gap-2 flex-row">
                <RoadmapButton
                    isPanelExpanded={isPanelExpanded}
                    nodes={nodes}
                    edges={edges}
                    setNodes={setNodes}
                    role={role}
                    mode={mode}
                />
            </div>
        </Panel>
    );
};

export default RoadmapButtonPanel;
