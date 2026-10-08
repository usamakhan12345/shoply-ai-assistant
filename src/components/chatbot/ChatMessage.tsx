import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '@/components/product/ProductCard';
import type { ChatMessage as Msg } from '@/features/agent/agentSlice';
import { isAllowedRoute } from '@/utils/navigation';
import ChatOrderCard from './ChatOrderCard';

// Human-readable labels for the "what did the AI just do" chips.
const TOOL_LABEL: Record<string, string> = {
  search_products: '🔎 Searched products',
  get_top_rated_products: '⭐ Looked up top rated',
  get_product_details: '📄 Read product details',
  list_categories: '🗂️ Listed categories',
  get_cart: '🛒 Checked your cart',
  add_to_cart: '➕ Added to cart',
  remove_from_cart: '➖ Removed from cart',
  update_cart_quantity: '✏️ Updated cart',
  get_my_orders: '📦 Looked up your orders',
  get_my_order: '📦 Checked your order',
  start_checkout: '🧾 Prepared checkout',
  navigate_to_orders: '↗️ Opened My Orders',
  navigate_to_order: '↗️ Opened order',
  navigate_to_cart: '↗️ Opened cart',
  navigate_to_product: '↗️ Opened product',
};

export default function ChatMessage({ msg, onLoginClick }: { msg: Msg; onLoginClick?: () => void }) {
  const nav = useNavigate();
  const loc = useLocation();
  const isUser = msg.role === 'user';
  const action = msg.action && isAllowedRoute(msg.action.route) ? msg.action : null;

  const goLogin = () => {
    onLoginClick?.();
    nav(`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`);
  };

  return (
    <div className={`msg ${isUser ? 'msg--user' : 'msg--bot'}${msg.isError ? ' msg--error' : ''}`}>
      {!isUser && msg.actions && msg.actions.length > 0 && (
        <div className="msg__tools" aria-label="Actions taken by the assistant">
          {msg.actions.map((a, i) => (
            <span key={i} className={`tool${a.status === 'error' ? ' error' : ''}`}>
              {TOOL_LABEL[a.tool] ?? a.tool}
              {a.status === 'error' ? ' – failed' : ''}
            </span>
          ))}
        </div>
      )}
      <div className="msg__bubble" dir="auto">{msg.text}</div>
      {msg.orders && msg.orders.length > 0 && (
        <div className="msg__products">
          {msg.orders.map((o) => <ChatOrderCard key={o.id} order={o} />)}
        </div>
      )}
      {msg.products && msg.products.length > 0 && (
        <div className="msg__products">
          {msg.products.map((p) => <ProductCard key={p.id} product={p} compact />)}
        </div>
      )}
      {action && (
        // The agent already navigated for the user; this button lets them go back to the page later.
        <button className="btn btn--outline btn--sm msg__login" onClick={() => nav(action.route)}>{action.label ?? 'Open'} →</button>
      )}
      {msg.requiresLogin && (
        <button className="btn btn--primary btn--sm msg__login" onClick={goLogin}>Log in to continue</button>
      )}
    </div>
  );
}
