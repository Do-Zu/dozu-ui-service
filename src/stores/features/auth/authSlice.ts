// src/stores/slice/bookSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string;
}

const initialState: AuthState = {
  accessToken: '',
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
  },
});

export const { updateAccessToken } = authSlice.actions;

export default authSlice.reducer;
