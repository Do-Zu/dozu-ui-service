import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SquareMousePointer } from 'lucide-react';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { setMultiSelectMode, clearNodeSelection } from '@/stores/features/mindmap/selectedNodeSlice';

const SelectMultipleButton = () => {
    const dispatch = useAppDispatch();
    const isMultiSelectMode = useAppSelector((state) => state.selectedNodeSlice.isMultiSelectMode);

    const handleToggleMultiSelect = () => {
        if (isMultiSelectMode) {
            // Turning off multi-select mode, clear all selections
            dispatch(setMultiSelectMode(false));
            dispatch(clearNodeSelection());
        } else {
            // Turning on multi-select mode
            dispatch(setMultiSelectMode(true));
        }
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    size="icon-sm"
                    variant={isMultiSelectMode ? 'default' : 'outline'}
                    onClick={handleToggleMultiSelect}
                >
                    <SquareMousePointer />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                {isMultiSelectMode ? 'Disable multi-select' : 'Select multiple'}
            </TooltipContent>
        </Tooltip>
    );
};

export default SelectMultipleButton;
