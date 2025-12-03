import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleIsEditing, toggleIsEditingTrue } from '@/stores/features/mindmap/isEditingMindmapSlice';
import { useAppSelector } from '@/stores/hooks';
import { useReactFlow } from '@xyflow/react';
import { Pencil } from 'lucide-react';
import React from 'react';
import { useDispatch } from 'react-redux';

interface EditMindmapButtonProps {
    isPanelExpanded: boolean;
}

const EditMindmapButton = ({ isPanelExpanded }: EditMindmapButtonProps) => {
    const dispatch = useDispatch();
    const { getNodes } = useReactFlow();
    const onClick = () => {
        // dispatch(toggleIsEditingTrue());
        dispatch(toggleIsEditing());
    };
    const isEditingMindmap = useAppSelector((state) => state.isEditingMindmapSlice.isEditingMindmap);

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button size="icon-sm" variant={isEditingMindmap ? 'default' : 'outline'} onClick={onClick}>
                    <Pencil />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Edit mindmap</TooltipContent>
        </Tooltip>
    );
};

export default EditMindmapButton;
