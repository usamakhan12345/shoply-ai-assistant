import { createSlice, nanoid } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  kind: 'success' | 'error' | 'info';
  text: string;
}

const slice = createSlice({
  name: 'ui',
  initialState: { toasts: [] as Toast[] },
  reducers: {
    pushToast: {
      reducer(s, a: { payload: Toast }) {
        s.toasts.push(a.payload);
      },
      prepare: (kind: Toast['kind'], text: string) => ({ payload: { id: nanoid(), kind, text } }),
    },
    dismissToast(s, a: { payload: string }) {
      s.toasts = s.toasts.filter((t) => t.id !== a.payload);
    },
  },
});

export const { pushToast, dismissToast } = slice.actions;
export default slice.reducer;
