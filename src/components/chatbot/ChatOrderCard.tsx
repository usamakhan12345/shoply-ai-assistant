import { Link } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge';
import type { ChatOrder } from '@/types';
import { dateOnly, imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

/** Compact order summary used inside the AI chat. Reuses the app's StatusBadge and links to the real order page. */
export default function ChatOrderCard({ order: o }: { order: ChatOrder }) {
  const units = o.items.reduce((n, i) => n + i.quantity, 0);
  return (
    <article className="ocard">
      <div className="ocard__head">
        <strong>Order #{o.id}</strong>
        <StatusBadge status={o.status} />
      </div>
      <div className="ocard__items">
        {o.items.slice(0, 3).map((i, k) => (
          <img key={k} src={imgUrl(i.image)} alt={i.title} title={`${i.quantity} × ${i.title}`} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
        ))}
        <span className="ocard__titles">{o.items.map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.title}` : i.title)).join(', ')}</span>
      </div>
      <div className="ocard__foot">
        <span className="muted">
          {o.delivered_at ? `Delivered ${dateOnly(o.delivered_at)}` : `Placed ${dateOnly(o.created_at)}`} · {units} item{units === 1 ? '' : 's'}
        </span>
        <strong>{money(o.total)}</strong>
      </div>
      <Link to={`/orders/${o.id}`} className="btn btn--outline btn--sm">View &amp; track</Link>
    </article>
  );
}
