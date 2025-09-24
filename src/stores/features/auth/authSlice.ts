// src/stores/slice/bookSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  accessToken: string;

  userId: string;
  username: string;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  accessToken: '',
  userId: '',
  username: '',
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken: string;
        userId: string;
        username: string;
      }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.userId = action.payload.userId;
      state.username = action.payload.username;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.accessToken = '';

      state.userId = '';
      state.username = '';
      state.isAuthenticated = false;
    },
  },
});

export const { updateAccessToken, setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
