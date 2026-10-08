import { Link, useParams } from 'react-router-dom';
import ErrorBox from '@/components/common/ErrorBox';
import OrderTimeline from '@/components/common/OrderTimeline';
import { PageLoader } from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { orderApi } from '@/services/api';
import { dateTime, imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { data: o, loading, error, reload } = useAsync(() => orderApi.get(id!), [id]);

  if (loading && !o) return <div className="container page"><PageLoader /></div>;
  if (error || !o) return <div className="container page"><ErrorBox message={error ?? 'Order not found'} onRetry={reload} /><p><Link to="/orders">← My orders</Link></p></div>;

  return (
    <div className="container page">
      <p><Link to="/orders">← My orders</Link></p>
      <div className="row-between page-title">
        <h1 style={{ margin: 0 }}>Order #{o.id}</h1>
        <div className="row"><StatusBadge status={o.status} /><button className="btn btn--outline btn--sm" onClick={reload}>Refresh status</button></div>
      </div>
      <div className="order-detail">
        <div className="stack">
          <div className="form-card" style={{ margin: 0 }}>
            <h3>Tracking</h3>
            <OrderTimeline order={o} />
          </div>
          <div className="form-card" style={{ margin: 0 }}>
            <h3>Items</h3>
            {o.items.map((i) => (
              <div key={i.id} className="row" style={{ padding: '10px 0', borderTop: '1px solid #e5e8f0' }}>
                <img src={imgUrl(i.image)} alt="" width={60} height={60} style={{ borderRadius: 8, objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
                <span style={{ flex: 1 }}>{i.product_id ? <Link to={`/products/${i.product_id}`}>{i.title}</Link> : i.title}<br /><span className="muted">{i.quantity} × {money(i.unit_price)}</span></span>
                <strong>{money(i.unit_price * i.quantity)}</strong>
              </div>
            ))}
          </div>
        </div>
        <aside className="summary">
          <h3>Summary</h3>
          <div className="line"><span>Placed</span><span>{dateTime(o.created_at)}</span></div>
          <div className="line"><span>Sold by</span><span>{o.seller_store}</span></div>
          <div className="line"><span>Subtotal</span><span>{money(o.subtotal + o.discount_total)}</span></div>
          {o.discount_total > 0 && <div className="line save"><span>Discount</span><span>− {money(o.discount_total)}</span></div>}
          <div className="line"><span>Shipping</span><span>{o.shipping === 0 ? 'Free' : money(o.shipping)}</span></div>
          <div className="line total"><span>Total</span><span>{money(o.total)}</span></div>
          <div className="line"><span>Payment</span><span>{o.payment_method} · {o.payment_status}</span></div>
          <h3 style={{ marginTop: 20 }}>Ship to</h3>
          <p className="muted" style={{ margin: 0 }}>{o.shipping_name}<br />{o.shipping_line1}<br />{o.shipping_city} {o.shipping_postal_code}<br />{o.shipping_country}<br />{o.shipping_phone}</p>
        </aside>
      </div>
    </div>
  );
}
