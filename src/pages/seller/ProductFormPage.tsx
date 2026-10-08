import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorBox from '@/components/common/ErrorBox';
import { PageLoader } from '@/components/common/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { productApi, sellerApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import { csv, imgUrl, PLACEHOLDER_IMG } from '@/utils/format';

interface FormState {
  title: string;
  description: string;
  category_id: string;
  subcategory_id: string;
  price: string;
  original_price: string;
  stock: string;
  location: string;
  image_urls: string[];
  specs: { name: string; value: string }[];
  colors: string;
  sizes: string;
}

const EMPTY: FormState = { title: '', description: '', category_id: '', subcategory_id: '', price: '', original_price: '', stock: '0', location: '', image_urls: [], specs: [], colors: '', sizes: '' };

/** One page for both "Add product" (/new) and "Edit product" (/:id/edit). */
export default function ProductFormPage() {
  const { id } = useParams();
  const editing = !!id;
  const nav = useNavigate();
  const dispatch = useAppDispatch();
  const cats = useAsync(() => productApi.categories(), []);
  const existing = useAsync(() => (editing ? productApi.get(id!) : Promise.resolve(null)), [id]);
  const [f, setF] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const p = existing.data;
    if (!p) return;
    setF({
      title: p.title, description: p.description, category_id: String(p.category.id), subcategory_id: p.subcategory ? String(p.subcategory.id) : '',
      price: String(p.price), original_price: p.original_price ? String(p.original_price) : '', stock: String(p.stock), location: p.location ?? '',
      image_urls: p.images.map((i) => i.url), specs: p.specs, colors: p.colors.join(', '), sizes: p.sizes.join(', '),
    });
  }, [existing.data]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((s) => ({ ...s, [k]: v }));
  const subs = cats.data?.find((c) => String(c.id) === f.category_id)?.children ?? [];

  const upload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of files) urls.push(await sellerApi.uploadImage(file));
      setF((s) => ({ ...s, image_urls: [...s.image_urls, ...urls].slice(0, 8) }));
    } catch (err) {
      dispatch(pushToast('error', errorMessage(err)));
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!f.category_id) return setError('Please choose a category.');
    const body = {
      title: f.title.trim(),
      description: f.description,
      category_id: Number(f.category_id),
      subcategory_id: f.subcategory_id ? Number(f.subcategory_id) : null,
      price: Number(f.price),
      original_price: f.original_price ? Number(f.original_price) : null,
      stock: Number(f.stock),
      location: f.location.trim() || null,
      image_urls: f.image_urls,
      specs: f.specs.filter((s) => s.name.trim() && s.value.trim()),
      colors: csv(f.colors),
      sizes: csv(f.sizes),
    };
    setSaving(true);
    try {
      if (editing) await sellerApi.updateProduct(Number(id), body);
      else await sellerApi.createProduct(body);
      dispatch(pushToast('success', editing ? 'Product updated' : 'Product created'));
      nav('/seller/products');
    } catch (err) {
      setError(errorMessage(err));
      setSaving(false);
    }
  };

  if (editing && existing.loading && !existing.data) return <PageLoader />;
  if (editing && existing.error) return <ErrorBox message={existing.error} onRetry={existing.reload} />;

  const discount = f.original_price && f.price && Number(f.original_price) > Number(f.price) ? Math.round((1 - Number(f.price) / Number(f.original_price)) * 100) : 0;

  return (
    <form onSubmit={submit}>
      <h1>{editing ? 'Edit product' : 'Add product'}</h1>
      {error && <div className="alert alert--error" role="alert" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="form-card">
        <h3>Basics</h3>
        <div className="fields">
          <div className="field full"><label htmlFor="title">Title</label><input id="title" className="input" required minLength={2} maxLength={200} value={f.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="field"><label htmlFor="cat">Category</label>
            <select id="cat" className="select" required value={f.category_id} onChange={(e) => setF((s) => ({ ...s, category_id: e.target.value, subcategory_id: '' }))}>
              <option value="">Select…</option>{cats.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="field"><label htmlFor="sub">Subcategory</label>
            <select id="sub" className="select" value={f.subcategory_id} onChange={(e) => set('subcategory_id', e.target.value)} disabled={!subs.length}>
              <option value="">None</option>{subs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select></div>
          <div className="field full"><label htmlFor="desc">Description</label><textarea id="desc" className="textarea" value={f.description} onChange={(e) => set('description', e.target.value)} /></div>
        </div>
      </div>

      <div className="form-card">
        <h3>Pricing &amp; stock</h3>
        <div className="fields">
          <div className="field"><label htmlFor="price">Price (Rs.)</label><input id="price" className="input" type="number" min={0} step="0.01" required value={f.price} onChange={(e) => set('price', e.target.value)} /></div>
          <div className="field"><label htmlFor="orig">Original price (Rs.)</label><input id="orig" className="input" type="number" min={0} step="0.01" value={f.original_price} onChange={(e) => set('original_price', e.target.value)} /><span className="hint">{discount > 0 ? `Customers will see ${discount}% off.` : 'Leave empty for no discount. The discount % is calculated automatically.'}</span></div>
          <div className="field"><label htmlFor="stock">Stock</label><input id="stock" className="input" type="number" min={0} step={1} required value={f.stock} onChange={(e) => set('stock', e.target.value)} /></div>
          <div className="field"><label htmlFor="loc">Ships from</label><input id="loc" className="input" maxLength={120} value={f.location} onChange={(e) => set('location', e.target.value)} placeholder="City" /></div>
        </div>
      </div>

      <div className="form-card">
        <h3>Images <span className="muted" style={{ fontWeight: 400 }}>(first image is the cover, max 8)</span></h3>
        <div className="img-uploader">
          {f.image_urls.map((u, i) => (
            <div key={u + i} className="tile"><img src={imgUrl(u)} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} /><button type="button" aria-label="Remove image" onClick={() => set('image_urls', f.image_urls.filter((_, j) => j !== i))}>×</button></div>
          ))}
          {f.image_urls.length < 8 && (
            <label className="tile add">{uploading ? 'Uploading…' : '+ Upload'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={upload} disabled={uploading} /></label>
          )}
        </div>
      </div>

      <div className="form-card">
        <h3>Options &amp; specifications</h3>
        <div className="fields">
          <div className="field"><label htmlFor="colors">Colors</label><input id="colors" className="input" placeholder="Black, Blue" value={f.colors} onChange={(e) => set('colors', e.target.value)} /><span className="hint">Comma separated</span></div>
          <div className="field"><label htmlFor="sizes">Sizes</label><input id="sizes" className="input" placeholder="S, M, L" value={f.sizes} onChange={(e) => set('sizes', e.target.value)} /><span className="hint">Comma separated</span></div>
          <div className="field full">
            <span className="label">Specifications</span>
            {f.specs.map((s, i) => (
              <div key={i} className="spec-row">
                <input className="input" placeholder="Name (e.g. RAM)" value={s.name} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Specification name" />
                <input className="input" placeholder="Value (e.g. 8 GB)" value={s.value} onChange={(e) => set('specs', f.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} aria-label="Specification value" />
                <button type="button" className="btn btn--danger btn--sm" onClick={() => set('specs', f.specs.filter((_, j) => j !== i))}>×</button>
              </div>
            ))}
            <div><button type="button" className="btn btn--outline btn--sm" onClick={() => set('specs', [...f.specs, { name: '', value: '' }])}>+ Add specification</button></div>
          </div>
        </div>
      </div>

      <div className="row">
        <button className="btn btn--primary btn--lg" disabled={saving || uploading}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button>
        <Link to="/seller/products" className="btn btn--outline btn--lg">Cancel</Link>
      </div>
    </form>
  );
}
