import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/common/EmptyState';
import ErrorBox from '@/components/common/ErrorBox';
import Pagination from '@/components/common/Pagination';
import { PageLoader } from '@/components/common/Spinner';
import { useAsync } from '@/hooks/useAsync';
import { useDebounce } from '@/hooks/useDebounce';
import { sellerApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import { imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

export default function SellerProductsPage() {
  const dispatch = useAppDispatch();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const dq = useDebounce(q);
  const { data, loading, error, reload } = useAsync(() => sellerApi.products({ q: dq || undefined, page, page_size: 10 }), [dq, page]);

  const remove = async (id: number) => {
    try {
      await sellerApi.deleteProduct(id);
      dispatch(pushToast('success', 'Product deleted'));
      setConfirmId(null);
      reload();
    } catch (e) {
      dispatch(pushToast('error', errorMessage(e)));
    }
  };

  return (
    <>
      <div className="row-between page-title">
        <h1 style={{ margin: 0 }}>My products</h1>
        <Link to="/seller/products/new" className="btn btn--primary">➕ Add product</Link>
      </div>
      <input className="input" style={{ maxWidth: 360, marginBottom: 16 }} placeholder="Search your products…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} aria-label="Search your products" />
      {loading && !data && <PageLoader />}
      {error && <ErrorBox message={error} onRetry={reload} />}
      {data?.items.length === 0 && <EmptyState emoji="📦" title="No products" text={dq ? 'No products match your search.' : 'Add your first product to start selling.'} />}
      {data && data.items.length > 0 && (
        <>
          <div className="table-wrap">
            <table className="table">
              <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th /></tr></thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id}>
                    <td><div className="cell-product"><img className="thumb" src={imgUrl(p.image)} alt="" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} /><Link to={`/products/${p.id}`}>{p.title}</Link></div></td>
                    <td>{p.subcategory?.name ?? p.category.name}</td>
                    <td>{money(p.price)}{p.discount > 0 && <span className="badge badge--warn" style={{ marginLeft: 6 }}>-{p.discount}%</span>}</td>
                    <td>{p.stock <= 5 ? <span className="badge badge--danger">{p.stock}</span> : p.stock}</td>
                    <td>{p.review_count ? `★ ${p.rating.toFixed(1)} (${p.review_count})` : '—'}</td>
                    <td className="text-right">
                      {confirmId === p.id ? (
                        <span className="confirm-row">Delete? <button className="btn btn--danger btn--sm" onClick={() => remove(p.id)}>Yes</button><button className="btn btn--outline btn--sm" onClick={() => setConfirmId(null)}>No</button></span>
                      ) : (
                        <span className="confirm-row"><Link to={`/seller/products/${p.id}/edit`} className="btn btn--outline btn--sm">Edit</Link><button className="btn btn--danger btn--sm" onClick={() => setConfirmId(p.id)}>Delete</button></span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}
