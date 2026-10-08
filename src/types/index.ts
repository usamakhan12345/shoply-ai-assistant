export type Role = 'customer' | 'seller';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  store_name: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
}

export interface CategoryTree {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

export interface ProductCardData {
  id: number;
  title: string;
  slug: string;
  price: number;
  original_price: number | null;
  discount: number;
  rating: number;
  review_count: number;
  stock: number;
  image: string | null;
  category: Category;
  subcategory: Category | null;
}

export interface ProductDetail extends ProductCardData {
  description: string;
  sales_count: number;
  location: string | null;
  seller: { id: number; store_name: string | null; full_name: string };
  images: { id: number; url: string }[];
  specs: { name: string; value: string }[];
  colors: string[];
  sizes: string[];
  created_at: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'popular' | 'discount';

export interface ProductQuery {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  sort?: SortKey;
  page?: number;
  page_size?: number;
}

export interface ProductInput {
  title: string;
  description: string;
  category_id: number;
  subcategory_id: number | null;
  price: number;
  original_price: number | null;
  stock: number;
  location: string | null;
  image_urls: string[];
  specs: { name: string; value: string }[];
  colors: string[];
  sizes: string[];
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer: string;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: ProductCardData;
  line_total: number;
}

export interface Cart {
  items: CartItem[];
  item_count: number;
  subtotal: number;
  discount_total: number;
  shipping: number;
  total: number;
}

export interface Address {
  full_name: string;
  phone: string;
  line1: string;
  city: string;
  postal_code: string;
  country: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface Order {
  id: number;
  checkout_ref: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_line1: string;
  shipping_city: string;
  shipping_postal_code: string;
  shipping_country: string;
  created_at: string;
  items: { id: number; product_id: number | null; title: string; image: string | null; unit_price: number; original_unit_price: number; quantity: number }[];
  history: { status: OrderStatus; created_at: string }[];
  seller_store: string | null;
  customer_name: string | null;
  next_statuses: OrderStatus[];
}

export interface SellerStats {
  products: number;
  low_stock: number;
  orders: number;
  pending_orders: number;
  revenue: number;
}

export interface AgentAction {
  tool: string;
  status: 'ok' | 'error';
  detail: string | null;
}

export interface ChatOrder {
  id: number;
  status: OrderStatus;
  total: number;
  created_at: string;
  delivered_at: string | null;
  items: { title: string; quantity: number; image: string | null }[];
  seller_store: string | null;
}

/** Structured UI instruction returned by the agent (validated against an allow-list before use). */
export interface AgentUiAction {
  type: 'NAVIGATE';
  route: string;
  label: string | null;
}

export interface AgentReply {
  conversation_id: string;
  reply: string;
  products: ProductCardData[];
  orders: ChatOrder[];
  action: AgentUiAction | null;
  actions: AgentAction[];
  requires_login: boolean;
  cart_changed: boolean;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: { field: string; message: string }[] };
}
