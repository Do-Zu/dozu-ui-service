// src/stores/slice/bookSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface BookState {
  floor: number;
  unit: string;
}

const initialState: BookState = {
  floor: 0,
  unit: '',
};

export const bookSlice = createSlice({
  name: 'book',
  initialState,
  reducers: {
    updateFloor: (state, action: PayloadAction<number>) => {
      state.floor = action.payload;
    },
    incrementFloor: (state) => {
      state.floor += 1;
    },
    decrementFloor: (state) => {
      state.floor -= 1;
    }, 
    updateUnit: (state, action: PayloadAction<string>) => {
      state.unit = action.payload;
    },
  },
});

export const {
  updateFloor,
  incrementFloor,
  decrementFloor,
  updateUnit
} = bookSlice.actions;

export default bookSlice.reducer;
