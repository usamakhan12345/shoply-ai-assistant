import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { authApi } from '@/services/api';
import { errorMessage, getToken, setToken } from '@/services/http';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  /** 'loading' only while restoring a saved session at startup */
  status: 'idle' | 'loading' | 'ready';
  error: string | null;
}

const initialState: AuthState = { user: null, status: getToken() ? 'loading' : 'ready', error: null };

export const login = createAsyncThunk('auth/login', async (body: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const r = await authApi.login(body);
    setToken(r.access_token);
    return r.user;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

export const register = createAsyncThunk('auth/register', async (body: Parameters<typeof authApi.register>[0], { rejectWithValue }) => {
  try {
    const r = await authApi.register(body);
    setToken(r.access_token);
    return r.user;
  } catch (e) {
    return rejectWithValue(errorMessage(e));
  }
});

/** Called once at startup: if a token is saved, ask the backend who it belongs to. */
export const restoreSession = createAsyncThunk('auth/restore', async () => {
  try {
    return await authApi.me();
  } catch {
    setToken(null);
    return null;
  }
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      setToken(null);
      state.user = null;
      state.error = null;
    },
    userUpdated(state, a: { payload: User }) {
      state.user = a.payload;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(restoreSession.fulfilled, (s, a) => {
      s.user = a.payload;
      s.status = 'ready';
    });
    for (const thunk of [login, register]) {
      b.addCase(thunk.pending, (s) => {
        s.error = null;
      });
      b.addCase(thunk.fulfilled, (s, a) => {
        s.user = a.payload;
      });
      b.addCase(thunk.rejected, (s, a) => {
        s.error = (a.payload as string) ?? 'Request failed';
      });
    }
  },
});

export const { logout, userUpdated, clearAuthError } = slice.actions;
export default slice.reducer;
