import { useState } from 'react';
import EmptyState from '@/components/common/EmptyState';
import ErrorBox from '@/components/common/ErrorBox';
import Pagination from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/Spinner';
import ProductFilters from '@/components/product/ProductFilters';
import ProductGrid from '@/components/product/ProductGrid';
import { useProductQuery } from '@/features/products/useProductQuery';
import { useAsync } from '@/hooks/useAsync';
import { productApi } from '@/services/api';
import type { SortKey } from '@/types';

const SORT_LABELS: Record<SortKey, string> = {
  newest: 'Newest',
  popular: 'Most popular',
  rating: 'Top rated',
  discount: 'Biggest discount',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
};

export default function ProductsPage() {
  const { query, update, clear } = useProductQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const cats = useAsync(() => productApi.categories(), []);
  const key = JSON.stringify(query);
  const products = useAsync(() => productApi.list(query), [key]);

  const catName = cats.data?.flatMap((c) => [c, ...c.children]).find((c) => c.slug === query.category)?.name;
  const chips: { label: string; clear: Record<string, undefined> }[] = [];
  if (query.q) chips.push({ label: `“${query.q}”`, clear: { q: undefined } });
  if (query.category) chips.push({ label: catName ?? query.category, clear: { category: undefined } });
  if (query.min_price !== undefined || query.max_price !== undefined)
    chips.push({ label: `Rs. ${query.min_price ?? 0} – ${query.max_price ?? '∞'}`, clear: { min_price: undefined, max_price: undefined } });
  if (query.in_stock) chips.push({ label: 'In stock', clear: { in_stock: undefined } });

  const data = products.data;

  return (
    <div className="container page">
      <h1 className="page-title">{catName ?? (query.q ? 'Search results' : 'All products')}</h1>
      <div className="shop-layout">
        <ProductFilters
          categories={cats.data ?? []}
          category={query.category}
          minPrice={query.min_price?.toString()}
          maxPrice={query.max_price?.toString()}
          inStock={!!query.in_stock}
          open={filtersOpen}
          onChange={(patch) => update(patch)}
          onClear={clear}
        />
        <div>
          <div className="toolbar">
            <span className="muted">{data ? `${data.total} product${data.total === 1 ? '' : 's'}` : ' '}</span>
            <div className="row">
              <button className="btn btn--outline btn--sm filters-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
                {filtersOpen ? 'Hide filters' : 'Filters'}
              </button>
              <select className="select" value={query.sort} onChange={(e) => update({ sort: e.target.value })} aria-label="Sort by">
                {Object.entries(SORT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="active-filters">
              {chips.map((c) => (
                <span key={c.label} className="chip">{c.label}<button aria-label={`Remove ${c.label}`} onClick={() => update(c.clear)}>×</button></span>
              ))}
            </div>
          )}

          {products.loading && !data && <PageLoader />}
          {products.error && <ErrorBox message={products.error} onRetry={products.reload} />}
          {data && data.items.length === 0 && (
            <EmptyState emoji="🔍" title="No products found" text="Try different keywords or remove some filters." action={<button className="btn btn--primary" onClick={clear}>Clear filters</button>} />
          )}
          {data && data.items.length > 0 && (
            <div style={{ opacity: products.loading ? 0.6 : 1, transition: 'opacity .15s' }}>
              <ProductGrid products={data.items} className="product-grid--wide-3" />
              <Pagination page={data.page} pages={data.pages} onChange={(p) => { update({ page: String(p) }, true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
