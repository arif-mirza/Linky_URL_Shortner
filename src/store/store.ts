import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';
import linksReducer from '@/store/slices/linkSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    links: linksReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
