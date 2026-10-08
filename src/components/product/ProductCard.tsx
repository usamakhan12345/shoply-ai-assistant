import { Link } from 'react-router-dom';
import Stars from '@/components/common/Stars';
import { useAddToCart } from '@/features/cart/useAddToCart';
import { useAppSelector } from '@/store/hooks';
import type { ProductCardData } from '@/types';
import { imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

interface Props {
  product: ProductCardData;
  /** compact = horizontal layout used inside the AI chat. Same component, same data, same Add-to-cart logic. */
  compact?: boolean;
}

export default function ProductCard({ product: p, compact }: Props) {
  const add = useAddToCart();
  const role = useAppSelector((s) => s.auth.user?.role);
  const soldOut = p.stock <= 0;

  return (
    <article className={`pcard${compact ? ' pcard--compact' : ''}`}>
      <Link to={`/products/${p.id}`} className="pcard__media" aria-label={p.title}>
        <img src={imgUrl(p.image)} alt={p.title} loading="lazy" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
        {p.discount > 0 && <span className="pcard__badge">-{p.discount}%</span>}
        {soldOut && !compact && <span className="pcard__out">Out of stock</span>}
      </Link>
      <div className="pcard__body">
        {!compact && <span className="pcard__cat">{p.subcategory?.name ?? p.category.name}</span>}
        <Link to={`/products/${p.id}`} className="pcard__title">{p.title}</Link>
        <Stars rating={p.rating} count={p.review_count} />
        <div className="pcard__price">
          <strong>{money(p.price)}</strong>
          {p.original_price && p.original_price > p.price && <s>{money(p.original_price)}</s>}
        </div>
        {role !== 'seller' && (
          <div className="pcard__foot">
            <button className={`btn btn--primary btn--sm${compact ? '' : ' btn--block'}`} disabled={soldOut} onClick={() => add(p)}>
              {soldOut ? 'Sold out' : '🛒 Add to Cart'}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
