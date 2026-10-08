import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuthError, register } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Role } from '@/types';
import { safeRedirect } from '@/utils/format';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, error } = useAppSelector((s) => s.auth);
  const [role, setRole] = useState<Role>('customer');
  const [form, setForm] = useState({ full_name: '', email: '', password: '', store_name: '' });
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const redirect = params.get('redirect');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) nav(safeRedirect(redirect, user.role === 'seller' ? '/seller/dashboard' : '/'), { replace: true });
  }, [user, redirect, nav]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (form.password.length < 8) return setLocalError('Password must be at least 8 characters.');
    if (role === 'seller' && !form.store_name.trim()) return setLocalError('Please enter your store name.');
    setBusy(true);
    await dispatch(register({ email: form.email.trim(), password: form.password, full_name: form.full_name.trim(), role, store_name: role === 'seller' ? form.store_name.trim() : undefined }));
    setBusy(false);
  };

  return (
    <div className="container page">
      <div className="auth">
        <h1>Create Account</h1>
        <p className="sub">Join as a customer or start selling</p>
        <form onSubmit={submit}>
          {(localError || error) && <div className="alert alert--error" role="alert">{localError ?? error}</div>}

          <div className="choice-grid" role="radiogroup" aria-label="Account type">
            <label className="choice">
              <input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} />
              <span><strong>Customer</strong><small>Browse &amp; buy products</small></span>
            </label>
            <label className="choice">
              <input type="radio" name="role" checked={role === 'seller'} onChange={() => setRole('seller')} />
              <span><strong>Seller</strong><small>List &amp; manage products</small></span>
            </label>
          </div>

          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" className="input" required maxLength={120} value={form.full_name} onChange={set('full_name')} autoComplete="name" />
          </div>
          {role === 'seller' && (
            <div className="field">
              <label htmlFor="store">Store name</label>
              <input id="store" className="input" required maxLength={120} value={form.store_name} onChange={set('store_name')} />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" required minLength={8} maxLength={72} value={form.password} onChange={set('password')} autoComplete="new-password" />
            <span className="hint">At least 8 characters.</span>
          </div>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
        </form>
        <p className="switch">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}
