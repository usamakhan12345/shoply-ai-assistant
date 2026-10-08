import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__grid">
        <div>
          <h4>Shoply</h4>
          <p>A full-stack e-commerce learning project with a tool-using AI shopping agent.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/products">All products</Link>
          <Link to="/products?sort=rating">Top rated</Link>
          <Link to="/products?sort=discount">Best deals</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/orders">My orders</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/register">Become a seller</Link>
        </div>
        <div>
          <h4>Note</h4>
          <p>Payments are simulated. No real money is charged.</p>
        </div>
      </div>
      <div className="footer__bottom">© {new Date().getFullYear()} Shoply – for learning purposes.</div>
    </footer>
  );
}
