import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './HomePage.css';

const BANNERS = [
  { id: 1, title: 'جدیدترین موبایل‌ها', subtitle: 'با بهترین قیمت در بازار', emoji: '📱', bg: 'linear-gradient(135deg,#1a1d24,#2d1020)' },
  { id: 2, title: 'لپ‌تاپ‌های حرفه‌ای', subtitle: 'برای کار و بازی', emoji: '💻', bg: 'linear-gradient(135deg,#1a1d24,#1a2032)' },
  { id: 3, title: 'تخفیف‌های ویژه', subtitle: 'تا ۵۰٪ تخفیف', emoji: '🎉', bg: 'linear-gradient(135deg,#2d1020,#1a2032)' },
];

const CATS = [
  { name: 'موبایل', emoji: '📱', key: 'mobile' },
  { name: 'لپ‌تاپ', emoji: '💻', key: 'laptop' },
  { name: 'تبلت', emoji: '📟', key: 'tablet' },
  { name: 'هدفون', emoji: '🎧', key: 'audio' },
  { name: 'دوربین', emoji: '📷', key: 'camera' },
  { name: 'تلویزیون', emoji: '📺', key: 'tv' },
  { name: 'گیمینگ', emoji: '🎮', key: 'game' },
  { name: 'ساعت هوشمند', emoji: '⌚', key: 'watch' },
];

function Skeleton() {
  return (
    <div className="card skeleton-card">
      <div className="skeleton" style={{ paddingTop: '72%' }} />
      <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        <div className="skeleton" style={{ height: '14px', width: '90%' }} />
        <div className="skeleton" style={{ height: '14px', width: '75%' }} />
        <div className="skeleton" style={{ height: '36px', marginTop: '8px' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.list({ page_size: 12 }).then(({ data }) => {
      setProducts(data.results || data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const banner = BANNERS[bannerIdx];

  return (
    <div className="homepage">
      {/* Hero Banner */}
      <section className="hero" style={{ background: banner.bg }}>
        <div className="container hero-inner">
          <div className="hero-text">
            <h1 className="hero-title">{banner.title}</h1>
            <p className="hero-subtitle">{banner.subtitle}</p>
            <div className="hero-actions">
              <button className="btn btn-primary hero-cta" onClick={() => navigate('/products')}>
                مشاهده محصولات
              </button>
              <button className="btn btn-outline hero-cta" onClick={() => navigate('/products')}>
                تخفیف‌ها
              </button>
            </div>
          </div>
          <div className="hero-emoji">{banner.emoji}</div>
        </div>
        <div className="banner-dots">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              className={`banner-dot ${i === bannerIdx ? 'active' : ''}`}
              onClick={() => setBannerIdx(i)}
            />
          ))}
        </div>
      </section>

      <div className="container">
        {/* Trust Strip */}
        <div className="trust-strip">
          {[
            { icon: '🚚', text: 'ارسال رایگان بالای ۵۰۰ هزار تومان' },
            { icon: '🔒', text: 'پرداخت امن ۱۰۰٪' },
            { icon: '↩️', text: '۷ روز ضمانت بازگشت' },
            { icon: '🎁', text: 'جوایز و تخفیف ویژه اعضا' },
          ].map((item, i) => (
            <div key={i} className="trust-item">
              <span className="trust-icon">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Categories */}
        <section className="section">
          <h2 className="section-title">دسته‌بندی‌ها</h2>
          <div className="cats-grid">
            {CATS.map(cat => (
              <Link key={cat.key} to={`/products?category=${cat.key}`} className="cat-card card">
                <span className="cat-emoji">{cat.emoji}</span>
                <span className="cat-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Products */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">پیشنهادات ویژه</h2>
            <Link to="/products" className="see-more">مشاهده همه ←</Link>
          </div>
          <div className="product-grid">
            {loading
              ? Array(8).fill(0).map((_, i) => <Skeleton key={i} />)
              : products.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
          {!loading && products.length === 0 && (
            <div className="empty-state">
              <p>هنوز محصولی اضافه نشده</p>
              <p className="empty-hint">بک‌اند را اجرا کنید تا محصولات نمایش داده شوند</p>
            </div>
          )}
        </section>

        {/* Promo Banner */}
        <section className="promo-banner">
          <div className="promo-content">
            <div>
              <h3 className="promo-title">تا ۵۰٪ تخفیف روی محصولات منتخب</h3>
              <p className="promo-sub">فرصت محدود — همین الان خرید کنید</p>
            </div>
            <Link to="/products" className="btn btn-primary">مشاهده تخفیف‌ها</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
