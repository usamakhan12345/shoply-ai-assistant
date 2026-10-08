import { useEffect } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import ChatWidget from '@/components/chatbot/ChatWidget';
import Footer from '@/components/common/Footer';
import Navbar from '@/components/common/Navbar';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import Toasts from '@/components/common/Toasts';
import { logout, restoreSession } from '@/features/auth/authSlice';
import { fetchCart } from '@/features/cart/cartSlice';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import OrderDetailPage from '@/pages/orders/OrderDetailPage';
import OrdersPage from '@/pages/orders/OrdersPage';
import DashboardPage from '@/pages/seller/DashboardPage';
import ProductFormPage from '@/pages/seller/ProductFormPage';
import SellerLayout from '@/pages/seller/SellerLayout';
import SellerOrdersPage from '@/pages/seller/SellerOrdersPage';
import SellerProductsPage from '@/pages/seller/SellerProductsPage';
import SellerProfilePage from '@/pages/seller/SellerProfilePage';
import CartPage from '@/pages/shop/CartPage';
import CheckoutPage from '@/pages/shop/CheckoutPage';
import HomePage from '@/pages/shop/HomePage';
import OrderConfirmationPage from '@/pages/shop/OrderConfirmationPage';
import ProductDetailPage from '@/pages/shop/ProductDetailPage';
import ProductsPage from '@/pages/shop/ProductsPage';
import { getToken } from '@/services/http';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';

function Shell() {
  const user = useAppSelector((s) => s.auth.user);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      {user?.role !== 'seller' && <ChatWidget />}
      <Toasts />
    </>
  );
}

function NotFound() {
  return (
    <div className="container page center-box">
      <div style={{ fontSize: '3rem' }}>🧭</div>
      <h1>Page not found</h1>
      <Link to="/" className="btn btn--primary">Go home</Link>
    </div>
  );
}

export default function App() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Restore a saved session once at startup.
  useEffect(() => {
    if (getToken()) dispatch(restoreSession());
  }, [dispatch]);

  // The API client fires this when the server rejects our token (expired / revoked).
  useEffect(() => {
    const onExpired = () => {
      dispatch(logout());
      dispatch(pushToast('info', 'Your session expired. Please log in again.'));
    };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, [dispatch]);

  // Customers have a server-side cart: load it as soon as we know who they are.
  useEffect(() => {
    if (user?.role === 'customer') dispatch(fetchCart());
  }, [user?.id, user?.role, dispatch]);

  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={user?.role === 'seller' ? <Navigate to="/seller/dashboard" replace /> : <HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Customer area (UX guard only - the API enforces roles itself) */}
        <Route element={<ProtectedRoute role="customer" />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Route>

        {/* Seller area */}
        <Route element={<ProtectedRoute role="seller" />}>
          <Route element={<SellerLayout />}>
            <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
            <Route path="/seller/dashboard" element={<DashboardPage />} />
            <Route path="/seller/products" element={<SellerProductsPage />} />
            <Route path="/seller/products/new" element={<ProductFormPage />} />
            <Route path="/seller/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/seller/orders" element={<SellerOrdersPage />} />
            <Route path="/seller/profile" element={<SellerProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
