import { useEffect, useState } from 'react';
import type { CategoryTree } from '@/types';

interface Props {
  categories: CategoryTree[];
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock: boolean;
  open: boolean;
  onChange: (patch: Record<string, string | undefined>) => void;
  onClear: () => void;
}

export default function ProductFilters({ categories, category, minPrice, maxPrice, inStock, open, onChange, onClear }: Props) {
  const [min, setMin] = useState(minPrice ?? '');
  const [max, setMax] = useState(maxPrice ?? '');
  useEffect(() => {
    setMin(minPrice ?? '');
    setMax(maxPrice ?? '');
  }, [minPrice, maxPrice]);

  const applyPrice = () => onChange({ min_price: min || undefined, max_price: max || undefined });

  return (
    <aside className={`filters${open ? ' open' : ''}`} aria-label="Filters">
      <h4>Category</h4>
      <label className="opt"><input type="radio" name="cat" checked={!category} onChange={() => onChange({ category: undefined })} /> All categories</label>
      {categories.map((c) => (
        <div key={c.id}>
          <label className="opt"><input type="radio" name="cat" checked={category === c.slug} onChange={() => onChange({ category: c.slug })} /> {c.name}</label>
          {c.children.map((s) => (
            <label key={s.id} className="opt sub"><input type="radio" name="cat" checked={category === s.slug} onChange={() => onChange({ category: s.slug })} /> {s.name}</label>
          ))}
        </div>
      ))}

      <h4>Price (Rs.)</h4>
      <div className="price-row">
        <input className="input" type="number" min={0} placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} onBlur={applyPrice} aria-label="Minimum price" />
        <span>–</span>
        <input className="input" type="number" min={0} placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} onBlur={applyPrice} aria-label="Maximum price" />
      </div>
      <button className="btn btn--outline btn--sm" style={{ marginTop: 8 }} onClick={applyPrice}>Apply</button>

      <h4>Availability</h4>
      <label className="opt"><input type="checkbox" checked={inStock} onChange={(e) => onChange({ in_stock: e.target.checked ? '1' : undefined })} /> In stock only</label>

      <button className="btn btn--ghost btn--sm btn--block" style={{ marginTop: 16 }} onClick={onClear}>Clear all filters</button>
    </aside>
  );
}
