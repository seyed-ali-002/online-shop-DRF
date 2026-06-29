import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { useAuth } from '../AuthContext';
import './ProductCard.css';

function Stars({ rate = 0 }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${i <= rate ? '' : 'empty'}`}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [wished, setWished] = useState(false);

  if (!product) return null;

  const { id, name, brand, price, discount_percent, images, stock_quantity, is_active } = product;
  const image = images?.[0]?.image;
  const discountedPrice = discount_percent > 0 ? Math.round(price * (1 - discount_percent / 100)) : price;
  const inStock = stock_quantity > 0 && is_active;

  const handleAdd = async (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!user) { addToast('برای افزودن به سبد ابتدا وارد شوید', 'error'); return; }
    if (!inStock) return;
    setAdding(true);
    try {
      await addToCart(id, 1, price);
      addToast(`${name} به سبد اضافه شد`, 'success');
    } catch { addToast('خطا در افزودن به سبد', 'error'); }
    finally { setAdding(false); }
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    setWished(!wished);
    addToast(wished ? 'از علاقه‌مندی‌ها حذف شد' : 'به علاقه‌مندی‌ها اضافه شد');
  };

  return (
    <Link to={`/products/${id}`} className="product-card card">
      <div className="product-img-wrap">
        {image
          ? <img src={image} alt={name} className="product-img" loading="lazy" />
          : <div className="product-img-placeholder">📦</div>}
        {discount_percent > 0 && (
          <span className="discount-badge">%{discount_percent}</span>
        )}
        {!inStock && <div className="out-of-stock-overlay">ناموجود</div>}
        <button className={`wish-btn ${wished ? 'wished' : ''}`} onClick={handleWish}>
          {wished ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="product-info">
        <p className="product-brand">{brand}</p>
        <h3 className="product-name">{name}</h3>
        <Stars rate={4} />

        <div className="product-price-wrap">
          {discount_percent > 0 && (
            <span className="price-old">{price.toLocaleString()} تومان</span>
          )}
          <span className="price">{discountedPrice.toLocaleString()} تومان</span>
        </div>

        <button
          className={`add-to-cart-btn ${!inStock ? 'disabled' : ''} ${adding ? 'loading' : ''}`}
          onClick={handleAdd}
          disabled={!inStock || adding}
        >
          {adding ? '...' : inStock ? '+ افزودن به سبد' : 'ناموجود'}
        </button>
      </div>
    </Link>
  );
}
