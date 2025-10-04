// src/stores/slice/bookSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
//temporarily stores inputset
interface InputSetState {
    inputSetId: number;
}

const initialState: InputSetState = {
    inputSetId: -1,
};

export const inputSetSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateInputSetId: (state, action: PayloadAction<number>) => {
            state.inputSetId = action.payload;
        },
        resetInputSet: (state) => {
            state.inputSetId = -1;
        },
    },
});

export const { updateInputSetId, resetInputSet } = inputSetSlice.actions;

export default inputSetSlice.reducer;
