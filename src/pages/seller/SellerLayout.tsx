import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/seller/dashboard', label: '📊 Overview' },
  { to: '/seller/products', label: '📦 Products' },
  { to: '/seller/products/new', label: '➕ Add product' },
  { to: '/seller/orders', label: '🧾 Orders' },
  { to: '/seller/profile', label: '👤 Profile' },
];

export default function SellerLayout() {
  return (
    <div className="container page">
      <div className="seller">
        <nav className="seller__nav" aria-label="Seller navigation">
          <h4>Seller dashboard</h4>
          {LINKS.map((l) => <NavLink key={l.to} to={l.to} end>{l.label}</NavLink>)}
        </nav>
        <main className="seller__main"><Outlet /></main>
      </div>
    </div>
  );
}
