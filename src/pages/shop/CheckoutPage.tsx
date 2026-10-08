import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartSummary from '@/components/cart/CartSummary';
import AddressForm from '@/components/checkout/AddressForm';
import EmptyState from '@/components/common/EmptyState';
import { cartCleared, fetchCart } from '@/features/cart/cartSlice';
import { orderApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Address } from '@/types';
import { imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

type Errors = Partial<Record<keyof Address, string>>;

function validate(a: Address): Errors {
  const e: Errors = {};
  if (!a.full_name.trim()) e.full_name = 'Required';
  if (a.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a valid phone number';
  if (a.line1.trim().length < 3) e.line1 = 'Enter your street address';
  if (!a.city.trim()) e.city = 'Required';
  if (a.postal_code.trim().length < 2) e.postal_code = 'Required';
  return e;
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const user = useAppSelector((s) => s.auth.user)!;
  const cart = useAppSelector((s) => s.cart);
  const [address, setAddress] = useState<Address>({ full_name: user.full_name, phone: '', line1: '', city: '', postal_code: '', country: 'Pakistan' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  if (cart.items.length === 0 && !placing) {
    return <div className="container page"><EmptyState emoji="🛒" title="Nothing to check out" text="Your cart is empty." action={<Link to="/products" className="btn btn--primary">Browse products</Link>} /></div>;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const v = validate(address);
    setErrors(v);
    if (Object.keys(v).length) return;
    setPlacing(true);
    setServerError(null);
    try {
      // Only the address goes to the server. Prices, discounts, shipping and totals are recomputed there.
      const orders = await orderApi.place(address);
      dispatch(cartCleared());
      nav('/order-confirmation', { state: { orders }, replace: true });
    } catch (err) {
      setServerError(errorMessage(err));
      dispatch(fetchCart()); // stock/prices may have changed
      setPlacing(false);
    }
  };

  return (
    <div className="container page">
      <div className="steps"><span>1. Cart</span> › <span className="on">2. Checkout</span> › <span>3. Confirmation</span></div>
      <h1 className="page-title">Checkout</h1>
      <form className="cart-layout" onSubmit={submit} noValidate>
        <div className="stack">
          <div className="form-card">
            <h3>Customer</h3>
            <p style={{ margin: 0 }}><strong>{user.full_name}</strong><br /><span className="muted">{user.email}</span></p>
          </div>
          <div className="form-card">
            <h3>Shipping address</h3>
            <AddressForm value={address} onChange={setAddress} errors={errors} />
          </div>
          <div className="form-card">
            <h3>Payment</h3>
            <div className="mock-banner"><strong>Demo payment.</strong> This is a simulated checkout for learning – no card is charged and no real payment provider is called.</div>
            <label className="choice" style={{ cursor: 'default' }}><input type="radio" checked readOnly /><span><strong>Mock payment</strong><small>Order is marked as paid instantly</small></span></label>
          </div>
          <div className="form-card">
            <h3>Items ({cart.item_count})</h3>
            {cart.items.map((i) => (
              <div key={i.id} className="row" style={{ padding: '8px 0', borderTop: '1px solid #e5e8f0' }}>
                <img src={imgUrl(i.product.image)} alt="" width={52} height={52} style={{ borderRadius: 8, objectFit: 'cover' }} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
                <span style={{ flex: 1 }}>{i.product.title}<br /><span className="muted">Qty {i.quantity}</span></span>
                <strong>{money(i.line_total)}</strong>
              </div>
            ))}
          </div>
        </div>

        <CartSummary cart={cart}>
          {serverError && <div className="alert alert--error" role="alert" style={{ marginBottom: 12 }}>{serverError}</div>}
          <button className="btn btn--accent btn--lg btn--block" disabled={placing}>{placing ? 'Placing order…' : `Place order · ${money(cart.total)}`}</button>
        </CartSummary>
      </form>
    </div>
  );
}
