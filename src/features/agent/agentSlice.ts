import { createAsyncThunk, createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit';
import { agentApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import type { AgentAction, AgentUiAction, ChatOrder, ProductCardData } from '@/types';
import { logout } from '../auth/authSlice';
import { fetchCart } from '../cart/cartSlice';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  products?: ProductCardData[];
  orders?: ChatOrder[];
  /** UI instruction from the agent (e.g. open checkout). actionHandled stops it running twice. */
  action?: AgentUiAction | null;
  actionHandled?: boolean;
  actions?: AgentAction[];
  requiresLogin?: boolean;
  isError?: boolean;
}

interface AgentState {
  open: boolean;
  messages: ChatMessage[];
  conversationId: string | null;
  sending: boolean;
}

const CONV_KEY = 'shop.agent.conversation';
const readConv = () => {
  try {
    return sessionStorage.getItem(CONV_KEY);
  } catch {
    return null;
  }
};
const writeConv = (id: string | null) => {
  try {
    if (id) sessionStorage.setItem(CONV_KEY, id);
    else sessionStorage.removeItem(CONV_KEY);
  } catch {
    /* ignore */
  }
};

const initialState: AgentState = { open: false, messages: [], conversationId: readConv(), sending: false };

export const sendMessage = createAsyncThunk('agent/send', async (text: string, { getState, dispatch, rejectWithValue }) => {
  const { conversationId } = (getState() as { agent: AgentState }).agent;
  try {
    const r = await agentApi.chat(text, conversationId);
    // The agent changed the cart on the server -> refresh the navbar badge / cart page.
    if (r.cart_changed) dispatch(fetchCart());
    return r;
  } catch (e) {
    return rejectWithValue(errorMessage(e, 'The assistant is unavailable right now.'));
  }
});

const slice = createSlice({
  name: 'agent',
  initialState,
  reducers: {
    toggleChat(s, a: PayloadAction<boolean | undefined>) {
      s.open = a.payload ?? !s.open;
    },
    actionHandled(s, a: PayloadAction<string>) {
      const m = s.messages.find((x) => x.id === a.payload);
      if (m) m.actionHandled = true;
    },
    resetChat(s) {
      s.messages = [];
      s.conversationId = null;
      writeConv(null);
    },
  },
  extraReducers: (b) => {
    b.addCase(sendMessage.pending, (s, a) => {
      s.sending = true;
      s.messages.push({ id: nanoid(), role: 'user', text: a.meta.arg });
    });
    b.addCase(sendMessage.fulfilled, (s, a) => {
      s.sending = false;
      s.conversationId = a.payload.conversation_id;
      writeConv(a.payload.conversation_id);
      s.messages.push({
        id: nanoid(),
        role: 'assistant',
        text: a.payload.reply,
        products: a.payload.products,
        orders: a.payload.orders,
        action: a.payload.action,
        actions: a.payload.actions,
        requiresLogin: a.payload.requires_login,
      });
    });
    b.addCase(sendMessage.rejected, (s, a) => {
      s.sending = false;
      s.messages.push({ id: nanoid(), role: 'assistant', text: (a.payload as string) ?? 'Something went wrong.', isError: true });
    });
    // A different person must never see the previous person's chat.
    b.addCase(logout, (s) => {
      s.messages = [];
      s.conversationId = null;
      writeConv(null);
    });
  },
});

export const { toggleChat, resetChat, actionHandled } = slice.actions;
export default slice.reducer;
