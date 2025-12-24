import { Panel } from '@xyflow/react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Signpost } from 'lucide-react';

interface Props {
    onClick?: () => void;
}

const RoadmapButtonPanel = ({ onClick }: Props) => {
    return (
        <Panel position="top-right">
            <div className="flex gap-2 flex-row">
                <Button variant="outline" onClick={onClick}>
                    <Signpost />
                    Roadmap
                </Button>
            </div>
        </Panel>
    );
};

export default RoadmapButtonPanel;
