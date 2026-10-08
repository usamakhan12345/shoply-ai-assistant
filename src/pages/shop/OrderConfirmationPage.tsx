import { Link, Navigate, useLocation } from 'react-router-dom';
import type { Order } from '@/types';
import { money } from '@/utils/format';

export default function OrderConfirmationPage() {
  const { state } = useLocation() as { state: { orders?: Order[] } | null };
  const orders = state?.orders;
  if (!orders?.length) return <Navigate to="/orders" replace />;
  const total = orders.reduce((s, o) => s + o.total, 0);

  return (
    <div className="container page">
      <div className="confirm">
        <div className="tick" aria-hidden>✓</div>
        <h1>Thank you! Your order is placed.</h1>
        <p className="muted">
          {orders.length > 1 ? `Your items ship from ${orders.length} sellers, so we created ${orders.length} orders.` : 'We will notify you as the seller prepares it.'}
        </p>
        <div className="card" style={{ textAlign: 'left', margin: '24px 0' }}>
          {orders.map((o) => (
            <div key={o.id} className="row-between" style={{ padding: '8px 0' }}>
              <span><strong>Order #{o.id}</strong> · {o.seller_store}<br /><span className="muted">{o.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}</span></span>
              <strong>{money(o.total)}</strong>
            </div>
          ))}
          <div className="row-between" style={{ borderTop: '1px solid #e5e8f0', paddingTop: 12, marginTop: 8 }}><strong>Total paid (demo)</strong><strong>{money(total)}</strong></div>
        </div>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link to={`/orders/${orders[0].id}`} className="btn btn--primary">Track order</Link>
          <Link to="/products" className="btn btn--outline">Continue shopping</Link>
        </div>
      </div>
    </div>
  );
}
