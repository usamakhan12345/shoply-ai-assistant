import type { ReactNode } from 'react';
import type { Cart } from '@/types';
import { money } from '@/utils/format';

interface Props {
  cart: Pick<Cart, 'subtotal' | 'discount_total' | 'shipping' | 'total' | 'item_count'>;
  children?: ReactNode;
  title?: string;
}

/** Shows server-computed totals. The frontend never calculates prices itself. */
export default function CartSummary({ cart, children, title = 'Order summary' }: Props) {
  return (
    <aside className="summary">
      <h3>{title}</h3>
      <div className="line"><span>Subtotal ({cart.item_count} items)</span><span>{money(cart.subtotal + cart.discount_total)}</span></div>
      {cart.discount_total > 0 && <div className="line save"><span>Discount</span><span>− {money(cart.discount_total)}</span></div>}
      <div className="line"><span>Shipping</span><span>{cart.shipping === 0 ? 'Free' : money(cart.shipping)}</span></div>
      <div className="line total"><span>Total</span><span>{money(cart.total)}</span></div>
      {cart.shipping > 0 && <p className="free-ship">Add more items to qualify for free shipping.</p>}
      {children}
    </aside>
  );
}
