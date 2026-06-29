import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productAPI, reviewAPI } from '../api';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { useAuth } from '../AuthContext';
import './ProductDetail.css';

function Stars({ rate = 0, size = 16 }) {
  return (
    <div className="stars" style={{ fontSize: size }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= rate ? '#f5a623' : 'var(--border-light)' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rate: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      productAPI.detail(id),
      reviewAPI.list(id)
    ]).then(([{ data: p }, { data: r }]) => {
      setProduct(p);
      setReviews(r.results || r);
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return (
    <div className="page">
      <div className="container">
        <div className="detail-layout">
          <div className="skeleton" style={{ height: '400px', borderRadius: 'var(--radius)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[80, 200, 100, 150, 60].map((w, i) => (
              <div key={i} className="skeleton" style={{ height: '20px', width: `${w}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return null;

  const { name, brand, price, discount_percent, images, stock_quantity, description, category, is_active } = product;
  const discountedPrice = discount_percent > 0 ? Math.round(price * (1 - discount_percent / 100)) : price;
  const inStock = stock_quantity > 0 && is_active;
  const avgRate = reviews.length ? Math.round(reviews.reduce((s, r) => s + r.rate, 0) / reviews.length) : 0;

  const handleAdd = async () => {
    if (!user) { addToast('ابتدا وارد شوید', 'error'); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty, price);
      addToast(`${name} به سبد اضافه شد`);
    } catch { addToast('خطا در افزودن', 'error'); }
    finally { setAdding(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) { addToast('ابتدا وارد شوید', 'error'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewAPI.create({ product: product.id, ...reviewForm });
      setReviews(prev => [data, ...prev]);
      setReviewForm({ rate: 5, comment: '' });
      addToast('نظر شما ثبت شد');
    } catch { addToast('خطا در ثبت نظر', 'error'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/">خانه</a>
          <span>›</span>
          <a href="/products">محصولات</a>
          {category && <><span>›</span><span>{category.name}</span></>}
          <span>›</span>
          <span className="bread-current">{name}</span>
        </div>

        {/* Detail */}
        <div className="detail-layout card" style={{ padding: '28px', gap: '40px' }}>
          {/* Images */}
          <div className="detail-images">
            <div className="main-image-wrap">
              {images?.[imgIdx]?.image
                ? <img src={images[imgIdx].image} alt={name} className="main-image" />
                : <div className="main-image-placeholder">📦</div>}
              {discount_percent > 0 && (
                <span className="detail-discount-badge">%{discount_percent} تخفیف</span>
              )}
            </div>
            {images?.length > 1 && (
              <div className="thumbnail-strip">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`thumb ${i === imgIdx ? 'active' : ''}`}
                    onClick={() => setImgIdx(i)}
                  >
                    <img src={img.image} alt={`${name} ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="detail-info">
            <p className="detail-brand">{brand}</p>
            <h1 className="detail-name">{name}</h1>

            <div className="detail-rating">
              <Stars rate={avgRate} size={18} />
              <span className="review-count">({reviews.length} نظر)</span>
            </div>

            <div className="detail-price-section">
              {discount_percent > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="price-old">{price.toLocaleString()} تومان</span>
                  <span className="badge badge-orange">%{discount_percent} تخفیف</span>
                </div>
              )}
              <div className="detail-price">{discountedPrice.toLocaleString()} تومان</div>
            </div>

            <div className="detail-stock">
              {inStock
                ? <span className="in-stock">✓ موجود در انبار ({stock_quantity} عدد)</span>
                : <span className="out-stock">✕ ناموجود</span>}
            </div>

            <div className="detail-actions">
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span className="qty-val">{qty}</span>
                <button className="qty-btn" onClick={() => setQty(q => Math.min(stock_quantity, q + 1))}>+</button>
              </div>
              <button
                className={`btn btn-primary add-btn ${!inStock ? 'disabled' : ''}`}
                onClick={handleAdd}
                disabled={!inStock || adding}
              >
                {adding ? 'در حال افزودن...' : '🛒 افزودن به سبد'}
              </button>
            </div>

            {description && (
              <div className="detail-desc">
                <h4>توضیحات</h4>
                <p>{description}</p>
              </div>
            )}

            <div className="detail-features">
              <div className="feature">🚚 ارسال رایگان بالای ۵۰۰ هزار تومان</div>
              <div className="feature">↩️ ۷ روز ضمانت بازگشت</div>
              <div className="feature">🔒 پرداخت امن</div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="reviews-section">
          <h2 className="section-title" style={{ marginBottom: '24px' }}>نظرات کاربران</h2>

          {user && (
            <form className="review-form card" onSubmit={handleReview}>
              <h4 style={{ marginBottom: '16px' }}>ثبت نظر</h4>
              <div className="star-picker">
                {[1,2,3,4,5].map(n => (
                  <button key={n} type="button"
                    className={`star-pick ${reviewForm.rate >= n ? 'on' : ''}`}
                    onClick={() => setReviewForm(f => ({ ...f, rate: n }))}>★</button>
                ))}
              </div>
              <textarea
                className="input review-textarea"
                placeholder="نظر خود را بنویسید..."
                value={reviewForm.comment}
                onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                rows={4}
              />
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
              </button>
            </form>
          )}

          <div className="reviews-list">
            {reviews.length === 0
              ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>هنوز نظری ثبت نشده</p>
              : reviews.map((r, i) => (
                <div key={i} className="review-card card">
                  <div className="review-header">
                    <div className="review-user">
                      <div className="user-avatar">{r.user?.username?.[0]?.toUpperCase() || 'U'}</div>
                      <span className="user-name">{r.user?.username}</span>
                    </div>
                    <Stars rate={r.rate} size={14} />
                  </div>
                  {r.comment && <p className="review-comment">{r.comment}</p>}
                  <span className="review-date">{new Date(r.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
              ))
            }
          </div>
        </section>
      </div>
    </div>
  );
}
