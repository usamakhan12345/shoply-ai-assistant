import { Link } from 'react-router-dom';
import ErrorBox from '@/components/common/ErrorBox';
import { PageLoader } from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { sellerApi } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import { dateOnly, money } from '@/utils/format';

export default function DashboardPage() {
  const user = useAppSelector((s) => s.auth.user)!;
  const stats = useAsync(() => sellerApi.stats(), []);
  const orders = useAsync(() => sellerApi.orders(), []);

  return (
    <>
      <h1>Welcome, {user.store_name ?? user.full_name}</h1>
      {stats.error && <ErrorBox message={stats.error} onRetry={stats.reload} />}
      {stats.loading && <PageLoader />}
      {stats.data && (
        <div className="stats">
          <div className="stat"><small>Revenue</small><strong>{money(stats.data.revenue)}</strong></div>
          <div className="stat"><small>Orders</small><strong>{stats.data.orders}</strong></div>
          <div className={`stat${stats.data.pending_orders ? ' warn' : ''}`}><small>Pending orders</small><strong>{stats.data.pending_orders}</strong></div>
          <div className={`stat${stats.data.low_stock ? ' warn' : ''}`}><small>Low stock (≤5)</small><strong>{stats.data.low_stock}</strong></div>
        </div>
      )}
      <div className="section__head"><h2>Recent orders</h2><Link to="/seller/orders">All orders →</Link></div>
      {orders.data && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {orders.data.slice(0, 5).map((o) => (
                <tr key={o.id}><td>#{o.id}</td><td>{o.customer_name}</td><td>{dateOnly(o.created_at)}</td><td>{money(o.total)}</td><td><StatusBadge status={o.status} /></td></tr>
              ))}
              {orders.data.length === 0 && <tr><td colSpan={5} className="muted">No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
