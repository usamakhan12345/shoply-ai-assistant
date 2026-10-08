import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import type { ProductCardData } from '@/types';
import { addToCart } from './cartSlice';

/** Shared "Add to cart" behaviour for every Add-to-cart button in the app. */
export function useAddToCart() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const nav = useNavigate();
  const loc = useLocation();

  return async (product: ProductCardData, quantity = 1) => {
    if (!user) {
      dispatch(pushToast('info', 'Please log in to add items to your cart.'));
      nav(`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`);
      return false;
    }
    if (user.role !== 'customer') {
      dispatch(pushToast('error', 'Seller accounts cannot shop. Use a customer account.'));
      return false;
    }
    const res = await dispatch(addToCart({ productId: product.id, quantity }));
    if (addToCart.fulfilled.match(res)) {
      dispatch(pushToast('success', `Added “${product.title}” to your cart`));
      return true;
    }
    dispatch(pushToast('error', (res.payload as string) ?? 'Could not add to cart'));
    return false;
  };
}
