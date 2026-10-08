import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { clearAuthError, login } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { safeRedirect } from '@/utils/format';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { user, error } = useAppSelector((s) => s.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const redirect = params.get('redirect');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  // Already logged in (or just logged in): go back where the user came from, or to their home.
  useEffect(() => {
    if (user) nav(safeRedirect(redirect, user.role === 'seller' ? '/seller/dashboard' : '/'), { replace: true });
  }, [user, redirect, nav]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    await dispatch(login({ email: email.trim(), password }));
    setBusy(false);
  };

  return (
    <div className="container page">
      <div className="auth">
        <h1>Welcome back</h1>
        <p className="sub">Log in to your account</p>
        <form onSubmit={submit}>
          {error && <div className="alert alert--error" role="alert">{error}</div>}
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button className="btn btn--primary btn--lg btn--block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        </form>
        <p className="switch">New here? <Link to={`/register${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}>Create an account</Link></p>
        <div className="demo">
          <strong>Demo accounts (local seed data)</strong><br />
          Customer: customer@demo.com / Customer123!<br />
          Seller: seller@demo.com / Seller123!
        </div>
      </div>
    </div>
  );
}
