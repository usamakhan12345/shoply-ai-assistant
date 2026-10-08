import { useSearchParams } from 'react-router-dom';
import type { ProductQuery, SortKey } from '@/types';

const SORTS: SortKey[] = ['newest', 'price_asc', 'price_desc', 'rating', 'popular', 'discount'];

/** The URL is the single source of truth for filters: shareable links, working back button, no extra state. */
export function useProductQuery() {
  const [params, setParams] = useSearchParams();

  const sortParam = params.get('sort') as SortKey | null;
  const query: ProductQuery = {
    q: params.get('q') || undefined,
    category: params.get('category') || undefined,
    min_price: params.get('min_price') ? Number(params.get('min_price')) : undefined,
    max_price: params.get('max_price') ? Number(params.get('max_price')) : undefined,
    in_stock: params.get('in_stock') === '1' || undefined,
    sort: sortParam && SORTS.includes(sortParam) ? sortParam : 'newest',
    page: Math.max(1, Number(params.get('page')) || 1),
    page_size: 12,
  };

  /** Merge a patch into the URL. Any filter change resets to page 1. */
  const update = (patch: Record<string, string | undefined>, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === undefined || v === '') next.delete(k);
      else next.set(k, v);
    }
    if (!keepPage && !('page' in patch)) next.delete('page');
    setParams(next);
  };

  const clear = () => setParams(new URLSearchParams());
  return { query, update, clear, params };
}
