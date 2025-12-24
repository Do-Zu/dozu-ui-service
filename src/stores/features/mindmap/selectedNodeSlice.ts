import { CustomNodeData } from '@/types/mindmap/mindmap.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedNodeState {
    isSheetOpen: boolean;
    selectedNodeData: CustomNodeData | undefined;
    selectedNodeIds: string[];
    isMultiSelectMode: boolean;
}

const initialState: SelectedNodeState = {
    isSheetOpen: false,
    selectedNodeData: undefined,
    selectedNodeIds: [],
    isMultiSelectMode: false,
};

export const selectedNodeSlice = createSlice({
    name: 'selectedNodeSlice',
    initialState,
    reducers: {
        openSheet: (state) => {
            state.isSheetOpen = true;
        },
        closeSheet: (state) => {
            state.isSheetOpen = false;
        },
        setIsSheetOpen: (state, action: PayloadAction<boolean>) => {
            state.isSheetOpen = action.payload;
        },
        setSelectedNodeData: (state, action: PayloadAction<CustomNodeData>) => {
            state.selectedNodeData = action.payload;
        },
        clearSelectedNodeData: (state) => {
            state.selectedNodeData = undefined;
        },
        toggleNodeSelection: (state, action: PayloadAction<string>) => {
            const nodeId = action.payload;
            const index = state.selectedNodeIds.indexOf(nodeId);

            if (index > -1) {
                state.selectedNodeIds = state.selectedNodeIds.filter((id) => id !== nodeId);
            } else {
                state.selectedNodeIds = [...state.selectedNodeIds, nodeId];
            }
        },
        clearNodeSelection: (state) => {
            state.selectedNodeIds = [];
        },
        setMultiSelectMode: (state, action: PayloadAction<boolean>) => {
            state.isMultiSelectMode = action.payload;
            if (!action.payload) {
                state.selectedNodeIds = [];
            }
        },
        turnOffMultiSelectMode: (state) => {
            state.isMultiSelectMode = false;
        },
    },
});

export const {
    openSheet,
    closeSheet,
    setIsSheetOpen,
    setSelectedNodeData,
    clearSelectedNodeData,
    toggleNodeSelection,
    clearNodeSelection,
    setMultiSelectMode,
    turnOffMultiSelectMode,
} = selectedNodeSlice.actions;

export default selectedNodeSlice.reducer;
