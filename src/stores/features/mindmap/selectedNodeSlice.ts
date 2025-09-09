import { CustomNodeData } from '@/app/[locale]/mindmap/mindmap.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedNodeState {
    isSheetOpen: boolean;
    selectedNodeData: CustomNodeData | undefined;
}

const initialState: SelectedNodeState = {
    isSheetOpen: false,
    selectedNodeData: undefined,
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
    },
});

export const { openSheet, closeSheet, setIsSheetOpen, setSelectedNodeData } = selectedNodeSlice.actions;

export default selectedNodeSlice.reducer;
