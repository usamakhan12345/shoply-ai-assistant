import type {
  AgentReply, Address, Cart, CategoryTree, Order, OrderStatus, Page, ProductCardData, ProductDetail,
  ProductInput, ProductQuery, Review, SellerStats, User,
} from '@/types';
import { http } from './http';

// One small object per backend area. Components never build URLs themselves.

export const authApi = {
  register: (body: { email: string; password: string; full_name: string; role: 'customer' | 'seller'; store_name?: string }) =>
    http.post<{ access_token: string; user: User }>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    http.post<{ access_token: string; user: User }>('/auth/login', body).then((r) => r.data),
  me: () => http.get<User>('/auth/me').then((r) => r.data),
  updateMe: (body: { full_name?: string; store_name?: string }) => http.patch<User>('/auth/me', body).then((r) => r.data),
};

export const productApi = {
  categories: () => http.get<CategoryTree[]>('/categories').then((r) => r.data),
  list: (params: ProductQuery) => http.get<Page<ProductCardData>>('/products', { params }).then((r) => r.data),
  get: (id: number | string) => http.get<ProductDetail>(`/products/${id}`).then((r) => r.data),
  reviews: (id: number | string) => http.get<Review[]>(`/products/${id}/reviews`).then((r) => r.data),
  addReview: (id: number, body: { rating: number; comment: string }) => http.post<Review>(`/products/${id}/reviews`, body).then((r) => r.data),
};

export const cartApi = {
  get: () => http.get<Cart>('/cart').then((r) => r.data),
  add: (product_id: number, quantity = 1) => http.post<Cart>('/cart/items', { product_id, quantity }).then((r) => r.data),
  update: (itemId: number, quantity: number) => http.put<Cart>(`/cart/items/${itemId}`, { quantity }).then((r) => r.data),
  remove: (itemId: number) => http.delete<Cart>(`/cart/items/${itemId}`).then((r) => r.data),
};

export const orderApi = {
  place: (address: Address) => http.post<Order[]>('/orders', { address, payment_method: 'mock' }).then((r) => r.data),
  list: () => http.get<Order[]>('/orders').then((r) => r.data),
  get: (id: number | string) => http.get<Order>(`/orders/${id}`).then((r) => r.data),
};

export const sellerApi = {
  stats: () => http.get<SellerStats>('/seller/stats').then((r) => r.data),
  products: (params: { q?: string; page?: number; page_size?: number }) =>
    http.get<Page<ProductCardData>>('/seller/products', { params }).then((r) => r.data),
  createProduct: (body: ProductInput) => http.post<ProductDetail>('/products', body).then((r) => r.data),
  updateProduct: (id: number, body: Partial<ProductInput>) => http.put<ProductDetail>(`/products/${id}`, body).then((r) => r.data),
  deleteProduct: (id: number) => http.delete(`/products/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return http.post<{ url: string }>('/seller/uploads', form).then((r) => r.data.url);
  },
  orders: (status?: OrderStatus) => http.get<Order[]>('/seller/orders', { params: { status } }).then((r) => r.data),
  updateStatus: (id: number, status: OrderStatus) => http.patch<Order>(`/seller/orders/${id}/status`, { status }).then((r) => r.data),
};

export const agentApi = {
  chat: (message: string, conversation_id: string | null) =>
    http.post<AgentReply>('/agent/chat', { message, conversation_id }).then((r) => r.data),
};
