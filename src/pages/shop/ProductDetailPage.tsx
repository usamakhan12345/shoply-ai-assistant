import { FormEvent, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ErrorBox from '@/components/common/ErrorBox';
import QtyControl from '@/components/common/QtyControl';
import { PageLoader } from '@/components/common/Spinner';
import Stars from '@/components/common/Stars';
import { useAddToCart } from '@/features/cart/useAddToCart';
import { useAsync } from '@/hooks/useAsync';
import { productApi } from '@/services/api';
import { errorMessage } from '@/services/http';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { pushToast } from '@/store/uiSlice';
import { dateOnly, imgUrl, money, PLACEHOLDER_IMG } from '@/utils/format';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const role = useAppSelector((s) => s.auth.user?.role);
  const add = useAddToCart();
  const product = useAsync(() => productApi.get(id!), [id]);
  const reviews = useAsync(() => productApi.reviews(id!), [id]);
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (product.loading && !product.data) return <div className="container page"><PageLoader /></div>;
  if (product.error || !product.data) return <div className="container page"><ErrorBox message={product.error ?? 'Product not found'} onRetry={product.reload} /> <p><Link to="/products">← Back to products</Link></p></div>;

  const p = product.data;
  const images = p.images.length ? p.images.map((i) => i.url) : [null];
  const soldOut = p.stock <= 0;

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await productApi.addReview(p.id, { rating, comment });
      dispatch(pushToast('success', 'Thanks for your review!'));
      setComment('');
      reviews.reload();
      product.reload();
    } catch (err) {
      dispatch(pushToast('error', errorMessage(err)));
    }
  };

  return (
    <div className="container page">
      <p className="muted"><Link to="/products">Products</Link> / <Link to={`/products?category=${p.category.slug}`}>{p.category.name}</Link>{p.subcategory && <> / <Link to={`/products?category=${p.subcategory.slug}`}>{p.subcategory.name}</Link></>}</p>
      <div className="pdp">
        <div className="pdp__gallery">
          <div className="main"><img src={imgUrl(images[img])} alt={p.title} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMG; }} /></div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((u, i) => <button key={i} aria-current={i === img} onClick={() => setImg(i)}><img src={imgUrl(u)} alt={`View ${i + 1}`} /></button>)}
            </div>
          )}
        </div>

        <div className="pdp__info">
          <h1>{p.title}</h1>
          <div className="row"><Stars rating={p.rating} count={p.review_count} /><span className="muted">· {p.sales_count} sold</span></div>
          <div className="pdp__price">
            <strong>{money(p.price)}</strong>
            {p.original_price && p.original_price > p.price && <><s>{money(p.original_price)}</s><span className="off">{p.discount}% OFF</span></>}
          </div>
          <p>{p.description}</p>

          {p.colors.length > 0 && <div><div className="label"><strong>Colors</strong></div><div className="opts">{p.colors.map((c) => <span key={c}>{c}</span>)}</div></div>}
          {p.sizes.length > 0 && <div><div className="label"><strong>Sizes</strong></div><div className="opts">{p.sizes.map((s) => <span key={s}>{s}</span>)}</div></div>}

          <div>
            {soldOut ? <span className="badge badge--danger">Out of stock</span> : p.stock <= 5 ? <span className="badge badge--warn">Only {p.stock} left</span> : <span className="badge badge--success">In stock</span>}
            <span className="muted"> · Sold by {p.seller.store_name ?? p.seller.full_name}{p.location ? ` · ${p.location}` : ''}</span>
          </div>

          {role !== 'seller' && (
            <div className="qty-row">
              <QtyControl value={qty} max={Math.max(1, p.stock)} onChange={setQty} disabled={soldOut} />
              <button className="btn btn--primary btn--lg" disabled={soldOut} onClick={() => add(p, qty)}>🛒 Add to Cart</button>
            </div>
          )}

          {p.specs.length > 0 && (
            <>
              <h3 style={{ marginTop: 16 }}>Specifications</h3>
              <table className="specs"><tbody>{p.specs.map((s) => <tr key={s.name}><td>{s.name}</td><td>{s.value}</td></tr>)}</tbody></table>
            </>
          )}
        </div>
      </div>

      <section className="section">
        <h2>Customer reviews</h2>
        {role === 'customer' && (
          <form className="form-card" onSubmit={submitReview}>
            <h3>Write a review</h3>
            <p className="muted">You can review a product once it has been delivered to you.</p>
            <div className="row" style={{ marginBottom: 12 }}>
              <label htmlFor="rating">Rating</label>
              <select id="rating" className="select" style={{ width: 'auto' }} value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </div>
            <textarea className="textarea" placeholder="Share your experience…" maxLength={2000} value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Review" />
            <div style={{ marginTop: 12 }}><button className="btn btn--primary">Submit review</button></div>
          </form>
        )}
        {reviews.data?.length === 0 && <p className="muted">No reviews yet.</p>}
        {reviews.data?.map((r) => (
          <div key={r.id} className="review">
            <div className="row"><span className="who">{r.reviewer}</span><Stars rating={r.rating} count={1} /><span className="muted">{dateOnly(r.created_at)}</span></div>
            <p>{r.comment}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
