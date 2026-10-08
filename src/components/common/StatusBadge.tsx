import type { OrderStatus } from '@/types';

const KIND: Record<OrderStatus, string> = {
  Pending: 'badge--warn',
  Processing: 'badge--info',
  Shipped: 'badge--info',
  'Out for Delivery': 'badge--info',
  Delivered: 'badge--success',
  Cancelled: 'badge--danger',
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`badge ${KIND[status]}`}>{status}</span>;
}
