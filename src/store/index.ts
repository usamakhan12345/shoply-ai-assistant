import { configureStore } from '@reduxjs/toolkit';
import agent from '@/features/agent/agentSlice';
import auth from '@/features/auth/authSlice';
import cart from '@/features/cart/cartSlice';
import ui from './uiSlice';

export const store = configureStore({ reducer: { auth, cart, agent, ui } });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
