import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartItemRow from '@/components/cart/CartItemRow';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/common/EmptyState';
import { fetchCart } from '@/features/cart/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export default function CartPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const cart = useAppSelector((s) => s.cart);

  // Re-sync with the server on open (the AI assistant may have changed the cart).
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div className="container page">
      <h1 className="page-title">Shopping cart</h1>
      {cart.items.length === 0 ? (
        <EmptyState emoji="🛒" title="Your cart is empty" text="Browse products or ask the AI assistant to find something for you." action={<Link to="/products" className="btn btn--primary">Start shopping</Link>} />
      ) : (
        <div className="cart-layout">
          <div>{cart.items.map((i) => <CartItemRow key={i.id} item={i} />)}</div>
          <CartSummary cart={cart}>
            <button className="btn btn--primary btn--lg btn--block" onClick={() => nav('/checkout')}>Proceed to checkout</button>
            <Link to="/products" className="btn btn--ghost btn--block" style={{ marginTop: 8 }}>Continue shopping</Link>
          </CartSummary>
        </div>
      )}
    </div>
  );
}
