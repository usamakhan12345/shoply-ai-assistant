import { Link } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import ErrorBox from '@/components/common/ErrorBox';
import { PageLoader } from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { orderApi } from '@/services/api';
import { dateTime, imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

export default function OrdersPage() {
  const { data, loading, error, reload } = useAsync(() => orderApi.list(), []);

  return (
    <div className="container page">
      <h1 className="page-title">My orders</h1>
      {loading && <PageLoader />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState emoji="📦" title="No orders yet" text="When you place an order it will show up here." action={<Link to="/products" className="btn btn--primary">Start shopping</Link>} />}
      {data?.map((o) => (
        <div key={o.id} className="order-card">
          <div className="head">
            <div><strong>Order #{o.id}</strong><br /><span className="muted">{dateTime(o.created_at)} · Sold by {o.seller_store}</span></div>
            <div className="text-right"><StatusBadge status={o.status} /><br /><strong>{money(o.total)}</strong></div>
          </div>
          <div className="items">
            {o.items.slice(0, 6).map((i) => <img key={i.id} src={imgUrl(i.image)} alt={i.title} title={`${i.quantity} × ${i.title}`} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />)}
          </div>
          <div className="row-between">
            <span className="muted">{o.items.reduce((n, i) => n + i.quantity, 0)} item(s)</span>
            <Link to={`/orders/${o.id}`} className="btn btn--outline btn--sm">View &amp; track</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
