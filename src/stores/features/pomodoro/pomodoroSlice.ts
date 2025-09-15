import { RootState } from '@/stores/store';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type InitialState = {
    isDisplay: boolean;
};

// state is learningMode itself
const initialState: InitialState = {
    isDisplay: false,
};

const pomodoroSlice = createSlice({
    name: 'pomodoro',
    initialState,
    reducers: {
        setDisplayPomodoro: (state, action: PayloadAction<boolean | null | undefined>) => {
            state.isDisplay = !!action.payload;
        },
    },
});

export const { setDisplayPomodoro } = pomodoroSlice.actions;
export default pomodoroSlice.reducer;
