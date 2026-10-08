import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cartApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import type { Cart } from '@/types';
import { logout } from '../auth/authSlice';

const empty: Cart = { items: [], item_count: 0, subtotal: 0, discount_total: 0, shipping: 0, total: 0 };

interface CartState extends Cart {
  loading: boolean;
  /** item ids / product ids currently being changed - used to disable buttons */
  busy: boolean;
}

const initialState: CartState = { ...empty, loading: false, busy: false };

// The server returns the full recalculated cart after every change: the UI never does its own math.
const wrap = <A>(name: string, fn: (a: A) => Promise<Cart>) =>
  createAsyncThunk(`cart/${name}`, async (arg: A, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  });

export const fetchCart = wrap<void>('fetch', () => cartApi.get());
export const addToCart = wrap<{ productId: number; quantity?: number }>('add', (a) => cartApi.add(a.productId, a.quantity ?? 1));
export const updateCartItem = wrap<{ itemId: number; quantity: number }>('update', (a) => cartApi.update(a.itemId, a.quantity));
export const removeCartItem = wrap<number>('remove', (id) => cartApi.remove(id));

const slice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    cartCleared: () => initialState,
  },
  extraReducers: (b) => {
    for (const t of [fetchCart, addToCart, updateCartItem, removeCartItem]) {
      b.addCase(t.pending, (s) => {
        s.busy = true;
      });
      b.addCase(t.fulfilled, (s, a) => ({ ...(a.payload as Cart), loading: false, busy: false }) as CartState & typeof s);
      b.addCase(t.rejected, (s) => {
        s.busy = false;
      });
    }
    b.addCase(logout, () => initialState);
  },
});

export const { cartCleared } = slice.actions;
export default slice.reducer;
