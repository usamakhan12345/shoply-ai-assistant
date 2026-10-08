import { FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { actionHandled, resetChat, sendMessage, toggleChat } from '@/features/agent/agentSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { isAllowedRoute } from '@/utils/navigation';
import ChatMessage from './ChatMessage';

const SUGGESTIONS = [
  'Show me top rated electric items',
  'Cheapest kitchen appliances',
  'Laptops under 120000',
  'What is in my cart?',
  'mere delivered orders batao',
  'mera latest order kahan tak pohancha?',
];

export default function ChatWidget() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const { open, messages, sending } = useAppSelector((s) => s.agent);
  const user = useAppSelector((s) => s.auth.user);
  const [text, setText] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Always scroll to the newest message (and to the typing indicator).
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  // Run the agent's UI action (e.g. "open checkout") ONCE, but only for routes on the frontend allow-list.
  useEffect(() => {
    const m = messages[messages.length - 1];
    if (!m || m.role !== 'assistant' || !m.action || m.actionHandled) return;
    dispatch(actionHandled(m.id));
    if (m.action.type === 'NAVIGATE' && isAllowedRoute(m.action.route)) {
      nav(m.action.route);
      if (window.innerWidth < 576) dispatch(toggleChat(false)); // on phones the chat covers the page
    }
  }, [messages, dispatch, nav]);

  const send = (value: string) => {
    const v = value.trim();
    if (!v || sending) return;
    setText('');
    dispatch(sendMessage(v));
  };
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(text);
  };

  if (!open) {
    return (
      <button className="chat-fab" onClick={() => dispatch(toggleChat(true))} aria-label="Open AI shopping assistant">
        <span className="ico" aria-hidden>✨</span>
        <span className="txt">Ask AI</span>
      </button>
    );
  }

  return (
    <section className="chat" role="dialog" aria-label="AI Shopping Assistant">
      <header className="chat__head">
        <div className="avatar" aria-hidden>🤖</div>
        <div>
          <strong>AI Shopping Assistant</strong>
          <small>{user ? `Signed in as ${user.full_name.split(' ')[0]}` : 'Browsing as guest'}</small>
        </div>
        <span className="spacer" />
        {messages.length > 0 && <button onClick={() => dispatch(resetChat())} title="Start a new conversation">New chat</button>}
        <button onClick={() => dispatch(toggleChat(false))} aria-label="Close chat">✕</button>
      </header>

      <div className="chat__body" aria-live="polite">
        {messages.length === 0 && (
          <div className="chat__empty">
            <div className="emoji" aria-hidden>🛍️</div>
            <h3>How can I help you shop?</h3>
            <p>Ask about products, prices and ratings, or tell me what to add to your cart.</p>
            <div className="chips">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
            </div>
          </div>
        )}
        {messages.map((m) => <ChatMessage key={m.id} msg={m} onLoginClick={() => dispatch(toggleChat(false))} />)}
        {sending && (
          <div className="typing" aria-label="Assistant is typing"><span /><span /><span /></div>
        )}
        <div ref={bottom} />
      </div>

      <form className="chat__foot" onSubmit={onSubmit}>
        <input
          ref={input}
          className="input"
          placeholder="Ask about products…"
          value={text}
          maxLength={1000}
          onChange={(e) => setText(e.target.value)}
          aria-label="Message"
        />
        <button className="btn btn--primary" disabled={sending || !text.trim()} type="submit">Send</button>
      </form>
    </section>
  );
}
