import { Link } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import ErrorBox from '@/components/common/ErrorBox';
import { PageLoader } from '@/components/common/Spinner';
import ProductGrid from '@/components/product/ProductGrid';
import { useAsync } from '@/hooks/useAsync';
import { productApi } from '@/services/api';
import type { ProductCardData } from '@/types';
import { imgUrl } from '@/utils/format';

const CAT_EMOJI: Record<string, string> = {
  electronics: '💻', fashion: '👗', 'home-living': '🛋️', 'beauty-health': '💄', 'sports-outdoors': '🚴',
};

function Row({ title, to, products }: { title: string; to: string; products: ProductCardData[] }) {
  return (
    <section className="section">
      <div className="section__head">
        <h2>{title}</h2>
        <Link to={to}>View all →</Link>
      </div>
      <ProductGrid products={products} />
    </section>
  );
}

export default function HomePage() {
  const cats = useAsync(() => productApi.categories(), []);
  const top = useAsync(() => productApi.list({ sort: 'rating', page_size: 4 }), []);
  const deals = useAsync(() => productApi.list({ sort: 'discount', page_size: 4 }), []);
  const popular = useAsync(() => productApi.list({ sort: 'popular', page_size: 4 }), []);

  const loading = top.loading || deals.loading || popular.loading;
  const error = top.error || deals.error || popular.error;
  const heroImgs = (top.data?.items ?? []).slice(0, 2).map((p) => imgUrl(p.image));

  return (
    <div className="container page">
      <div className="hero">
        <div>
          <h1>Everything you need, one smart store.</h1>
          <p>Discover top-rated products, great deals — and let our AI shopping assistant find and add items to your cart for you.</p>
          <div className="hero__cta">
            <Link to="/products" className="btn btn--accent btn--lg">Shop now</Link>
            <Link to="/products?sort=discount" className="btn btn--outline btn--lg">See deals</Link>
          </div>
        </div>
        <div className="hero__art" aria-hidden>
          {heroImgs.map((src, i) => <img key={i} src={src} alt="" />)}
        </div>
      </div>

      <div className="perks">
        <div className="perk"><span className="ico">🚚</span><div><strong>Fast delivery</strong><small>Track every order live</small></div></div>
        <div className="perk"><span className="ico">🔒</span><div><strong>Secure checkout</strong><small>Prices verified on the server</small></div></div>
        <div className="perk"><span className="ico">✨</span><div><strong>AI assistant</strong><small>Ask for “top rated electronics”</small></div></div>
      </div>

      {cats.data && (
        <section className="section">
          <div className="section__head"><h2>Shop by category</h2></div>
          <div className="cat-chips">
            {cats.data.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`} className="cat-chip"><span aria-hidden>{CAT_EMOJI[c.slug] ?? '🛒'}</span>{c.name}</Link>
            ))}
          </div>
        </section>
      )}

      {loading && <PageLoader />}
      {error && <ErrorBox message={error} onRetry={() => { top.reload(); deals.reload(); popular.reload(); }} />}
      {!loading && !error && top.data?.items.length === 0 && <EmptyState emoji="📦" title="No products yet" text="Run the seed command or ask a seller to add products." />}
      {top.data && top.data.items.length > 0 && <Row title="Top rated" to="/products?sort=rating" products={top.data.items} />}
      {deals.data && deals.data.items.length > 0 && <Row title="Best deals" to="/products?sort=discount" products={deals.data.items} />}
      {popular.data && popular.data.items.length > 0 && <Row title="Most popular" to="/products?sort=popular" products={popular.data.items} />}
    </div>
  );
}
