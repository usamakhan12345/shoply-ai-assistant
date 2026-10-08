import type { ProductCardData } from '@/types';
import ProductCard from './ProductCard';

export default function ProductGrid({ products, className = '' }: { products: ProductCardData[]; className?: string }) {
  return (
    <div className={`product-grid ${className}`}>
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
