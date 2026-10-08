import { Fragment, useState } from 'react';
import EmptyState from '@/components/common/EmptyState';
import ErrorBox from '@/components/common/ErrorBox';
import OrderTimeline from '@/components/common/OrderTimeline';
import { PageLoader } from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAsync } from '@/hooks/useAsync';
import { sellerApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import type { Order, OrderStatus } from '@/types';
import { dateTime, money } from '@/utils/format';

const FILTERS: (OrderStatus | '')[] = ['', 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function SellerOrdersPage() {
  const dispatch = useAppDispatch();
  const [filter, setFilter] = useState<OrderStatus | ''>('');
  const [open, setOpen] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const { data, loading, error, reload, setData } = useAsync(() => sellerApi.orders(filter || undefined), [filter]);

  const change = async (o: Order, status: OrderStatus) => {
    if (status === 'Cancelled' && !window.confirm(`Cancel order #${o.id}? Stock will be returned and this cannot be undone.`)) return;
    setBusyId(o.id);
    try {
      const updated = await sellerApi.updateStatus(o.id, status); // the server enforces the allowed lifecycle
      setData((list) => list?.map((x) => (x.id === o.id ? updated : x)) ?? list);
      dispatch(pushToast('success', `Order #${o.id} is now “${status}”`));
    } catch (e) {
      dispatch(pushToast('error', errorMessage(e)));
      reload();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <h1>Orders</h1>
      <div className="row" style={{ flexWrap: 'wrap', marginBottom: 16 }}>
        {FILTERS.map((s) => <button key={s || 'all'} className={`btn btn--sm ${filter === s ? 'btn--primary' : 'btn--outline'}`} onClick={() => setFilter(s)}>{s || 'All'}</button>)}
      </div>
      {loading && !data && <PageLoader />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data?.length === 0 && <EmptyState emoji="🧾" title="No orders" text="Orders containing your products will appear here." />}
      {data && data.length > 0 && (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Update status</th></tr></thead>
            <tbody>
              {data.map((o) => (
                <Fragment key={o.id}>
                  <tr>
                    <td><button className="btn btn--ghost btn--sm" onClick={() => setOpen(open === o.id ? null : o.id)} aria-expanded={open === o.id}>#{o.id} {open === o.id ? '▴' : '▾'}</button><br /><span className="muted">{dateTime(o.created_at)}</span></td>
                    <td>{o.customer_name}<br /><span className="muted">{o.shipping_city}</span></td>
                    <td>{o.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}</td>
                    <td>{money(o.total)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td>
                      {o.next_statuses.length === 0 ? <span className="muted">Final</span> : (
                        <div className="status-actions">
                          {o.next_statuses.map((s) => (
                            <button key={s} className={`btn btn--sm ${s === 'Cancelled' ? 'btn--danger' : 'btn--primary'}`} disabled={busyId === o.id} onClick={() => change(o, s)}>{s === 'Cancelled' ? 'Cancel' : `Mark ${s}`}</button>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                  {open === o.id && (
                    <tr>
                      <td colSpan={6} style={{ background: '#fafbfe' }}>
                        <div className="grid-2">
                          <div><strong>Ship to</strong><p className="muted">{o.shipping_name}<br />{o.shipping_line1}, {o.shipping_city} {o.shipping_postal_code}<br />{o.shipping_country} · {o.shipping_phone}</p></div>
                          <OrderTimeline order={o} />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
