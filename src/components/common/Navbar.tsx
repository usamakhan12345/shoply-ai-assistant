import { FormEvent, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function SearchBox({ onDone }: { onDone?: () => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    nav(`/products${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''}`);
    onDone?.();
  };
  return (
    <form className="navbar__search searchbox" onSubmit={submit} role="search">
      <input className="input" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
    </form>
  );
}

export default function Navbar() {
  const { user } = useAppSelector((s) => s.auth);
  const count = useAppSelector((s) => s.cart.item_count);
  const dispatch = useAppDispatch();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const doLogout = () => {
    dispatch(logout());
    close();
    nav('/');
  };

  const links = (
    <>
      {user?.role === 'seller' ? (
        <NavLink className="navbar__link" to="/seller/dashboard" onClick={close}>Seller Dashboard</NavLink>
      ) : (
        <>
          <NavLink className="navbar__link" to="/products" onClick={close}>Shop</NavLink>
          {user && <NavLink className="navbar__link" to="/orders" onClick={close}>My Orders</NavLink>}
          {user && (
            <NavLink className="navbar__link cart-link" to="/cart" onClick={close} aria-label={`Cart, ${count} items`}>
              🛒 Cart{count > 0 && <span className="count">{count}</span>}
            </NavLink>
          )}
        </>
      )}
      {user ? (
        <>
          <span className="user-chip">
            <span className="avatar" aria-hidden>{user.full_name[0]?.toUpperCase()}</span>
            {user.full_name.split(' ')[0]}
          </span>
          <button className="btn btn--outline btn--sm" onClick={doLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link className="btn btn--ghost btn--sm" to="/login" onClick={close}>Log in</Link>
          <Link className="btn btn--primary btn--sm" to="/register" onClick={close}>Sign up</Link>
        </>
      )}
    </>
  );

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to={user?.role === 'seller' ? '/seller/dashboard' : '/'} className="navbar__brand">
          🛍️ Shop<span className="dot">ly</span>
        </Link>
        {user?.role !== 'seller' && <SearchBox />}
        <nav className="navbar__links">{links}</nav>
        <button className="icon-btn navbar__burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
      {open && (
        <div className="navbar__mobile">
          {user?.role !== 'seller' && <SearchBox onDone={close} />}
          {links}
        </div>
      )}
    </header>
  );
}
