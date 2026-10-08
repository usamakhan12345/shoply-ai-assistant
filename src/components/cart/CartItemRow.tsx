import { Link } from 'react-router-dom';
import QtyControl from '@/components/common/QtyControl';
import { removeCartItem, updateCartItem } from '@/features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import type { CartItem } from '@/types';
import { imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

export default function CartItemRow({ item }: { item: CartItem }) {
  const dispatch = useAppDispatch();
  const busy = useAppSelector((s) => s.cart.busy);
  const p = item.product;

  const setQty = async (quantity: number) => {
    const res = await dispatch(updateCartItem({ itemId: item.id, quantity }));
    if (updateCartItem.rejected.match(res)) dispatch(pushToast('error', (res.payload as string) ?? 'Could not update quantity'));
  };

  return (
    <div className="cart-item">
      <img src={imgUrl(p.image)} alt={p.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
      <div>
        <Link to={`/products/${p.id}`} className="title">{p.title}</Link>
        <span className="muted">{money(p.price)} each</span>
        {p.stock < 6 && <div className="badge badge--warn" style={{ marginTop: 4 }}>Only {p.stock} left</div>}
      </div>
      <div className="controls">
        <QtyControl value={item.quantity} max={p.stock} onChange={setQty} disabled={busy} />
        <button className="btn btn--danger btn--sm" disabled={busy} onClick={() => dispatch(removeCartItem(item.id))}>Remove</button>
      </div>
      <div className="line">{money(item.line_total)}</div>
    </div>
  );
}
