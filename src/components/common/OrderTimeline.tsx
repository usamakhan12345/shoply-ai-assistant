import type { Order, OrderStatus } from '@/types';
import { dateTime } from '@/utils/format';

const FLOW: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

/** Draws the lifecycle from the server's status history. */
export default function OrderTimeline({ order }: { order: Order }) {
  const at = new Map(order.history.map((h) => [h.status, h.created_at]));
  const cancelled = order.status === 'Cancelled';
  const reached = cancelled ? FLOW.filter((s) => at.has(s)) : FLOW.slice(0, FLOW.indexOf(order.status) + 1);

  return (
    <div className="timeline">
      {FLOW.map((s) => {
        const done = reached.includes(s);
        const current = !cancelled && s === order.status;
        if (cancelled && !done) return null;
        return (
          <div key={s} className={`t${done ? ' done' : ''}${current ? ' current' : ''}`}>
            <span className="dot">{done ? '✓' : ''}</span>
            <div><strong>{s}</strong><small>{at.get(s) ? dateTime(at.get(s)!) : 'Waiting'}</small></div>
          </div>
        );
      })}
      {cancelled && (
        <div className="t cancelled">
          <span className="dot">✕</span>
          <div><strong>Cancelled</strong><small>{at.get('Cancelled') ? dateTime(at.get('Cancelled')!) : ''}</small></div>
        </div>
      )}
    </div>
  );
}
