import { CustomNodeData } from '@/types/mindmap/mindmap.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface IsEditingMindmapState {
    isEditingMindmap: boolean;
}

const initialState: IsEditingMindmapState = {
    isEditingMindmap: false,
};

export const isEditingMindmapSlice = createSlice({
    name: 'isEditingMindmapSlice',
    initialState,
    reducers: {
        toggleIsEditingTrue: (state) => {
            state.isEditingMindmap = true;
        },
        toggleIsEditingFalse: (state) => {
            state.isEditingMindmap = false;
        },
        toggleIsEditing:(state)=>{
            state.isEditingMindmap=!state.isEditingMindmap
        }
    },
});

export const { toggleIsEditingTrue, toggleIsEditingFalse,toggleIsEditing } = isEditingMindmapSlice.actions;

export default isEditingMindmapSlice.reducer;
