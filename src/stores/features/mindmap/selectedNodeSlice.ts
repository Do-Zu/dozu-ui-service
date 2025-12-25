import { CustomNodeData } from '@/types/mindmap/mindmap.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedNodeState {
    isSheetOpen: boolean;
    selectedNodeData: CustomNodeData | undefined;
    selectedNodeIds: string[];
    isMultiSelectMode: boolean;
    hiddenNodeIds: string[];
}

const initialState: SelectedNodeState = {
    isSheetOpen: false,
    selectedNodeData: undefined,
    selectedNodeIds: [],
    isMultiSelectMode: false,
    hiddenNodeIds: [],
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
        clearHiddenNodes: (state) => {
            state.hiddenNodeIds = [];
        },
        addHiddenNodes: (state, action: PayloadAction<string[]>) => {
            for (const nodeId of action.payload) {
                if (state.hiddenNodeIds.includes(nodeId)) continue;
                state.hiddenNodeIds.push(nodeId);
            }
        },
        removeHiddenNodes: (state, action: PayloadAction<string[]>) => {
            state.hiddenNodeIds = state.hiddenNodeIds.filter((item) => {
                return !action.payload.includes(item);
            });
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
    clearHiddenNodes,
    addHiddenNodes,
    removeHiddenNodes,
} = selectedNodeSlice.actions;

export default selectedNodeSlice.reducer;
