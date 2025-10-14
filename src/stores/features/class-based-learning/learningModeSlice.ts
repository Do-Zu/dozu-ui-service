import { RootState } from '@/stores/store';
import { MODE_ACCESS_PAGE_ROLE } from '@/utils/constants/common.constant';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ILearningMode = MODE_ACCESS_PAGE_ROLE.personal | MODE_ACCESS_PAGE_ROLE.classBased;
type InitialState = {
    value: ILearningMode | null | undefined;
};

// state is learningMode itself
const initialState: InitialState = {
    value: null,
};

const learningModeSlice = createSlice({
    name: 'learningMode',
    initialState,
    reducers: {
        setLearningMode: (state, action: PayloadAction<ILearningMode | null | undefined>) => {
            if (!action.payload) {
                state.value = MODE_ACCESS_PAGE_ROLE.personal;
            } else {
                state.value = action.payload;
            }
        },
    },
});

export const selectLearningMode = (state: RootState) => state.learningMode.value;
export const { setLearningMode } = learningModeSlice.actions;
export default learningModeSlice.reducer;
