// src/stores/store.ts
import { configureStore } from '@reduxjs/toolkit';
import bookSlice from './features/book/bookSlice'; // Slice quản lý thông tin book

// Cấu hình Redux Store
export const store = configureStore({
  reducer: {
    book: bookSlice, // Thêm bookSlice vào store
  },
  devTools: process.env.NODE_ENV !== 'production', // Bật Redux DevTools khi ở môi trường development
});

// Các type cần thiết cho app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
