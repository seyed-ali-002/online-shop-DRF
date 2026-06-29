import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../CartContext';
import { useToast } from '../ToastContext';
import { useAuth } from '../AuthContext';
import { couponAPI } from '../api';
import './CartPage.css';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { addToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  if (!user) return (
    <div className="page">
      <div className="container">
        <div className="empty-cart card">
          <div className="empty-icon">🛒</div>
          <h2>سبد خرید شما خالی است</h2>
          <p>برای مشاهده سبد خرید ابتدا وارد شوید</p>
          <Link to="/login" className="btn btn-primary">ورود به حساب</Link>
        </div>
      </div>
    </div>
  );

  const items = cart || [];
  const subtotal = items.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0);
  const shipping = subtotal > 500000 ? 0 : 49000;
  const discountAmt = Math.round(subtotal * discount / 100);
  const total = subtotal + shipping - discountAmt;

  const handleRemove = async (id) => {
    try { await removeFromCart(id); addToast('از سبد حذف شد'); }
    catch { addToast('خطا در حذف', 'error'); }
  };

  const handleQty = async (id, qty) => {
    if (qty < 1) return;
    try { await updateQuantity(id, qty); }
    catch { addToast('خطا', 'error'); }
  };

  const handleCoupon = async () => {
    if (!coupon.trim()) return;
    setCheckingCoupon(true);
    try {
      const { data } = await couponAPI.validate(coupon);
      setDiscount(data.discount_percent || 0);
      addToast(`کد تخفیف اعمال شد: ${data.discount_percent}٪`);
    } catch { addToast('کد تخفیف نامعتبر است', 'error'); }
    finally { setCheckingCoupon(false); }
  };

  if (items.length === 0) return (
    <div className="page">
      <div className="container">
        <div className="empty-cart card">
          <div className="empty-icon">🛒</div>
          <h2>سبد خرید شما خالی است</h2>
          <p>محصولات مورد نظر خود را اضافه کنید</p>
          <Link to="/products" className="btn btn-primary">ادامه خرید</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">سبد خرید</h1>
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item card">
                <div className="cart-item-img">
                  {item.product?.images?.[0]?.image
                    ? <img src={item.product.images[0].image} alt={item.product?.name} />
                    : <span>📦</span>}
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${item.product?.id}`} className="cart-item-name">
                    {item.product?.name}
                  </Link>
                  <p className="cart-item-brand">{item.product?.brand}</p>
                  <div className="cart-item-bottom">
                    <div className="qty-control">
                      <button className="qty-btn" onClick={() => handleQty(item.id, item.quantity - 1)}>−</button>
                      <span className="qty-val">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => handleQty(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="cart-item-price">
                      {((item.price || 0) * (item.quantity || 1)).toLocaleString()} تومان
                    </span>
                    <button className="remove-btn" onClick={() => handleRemove(item.id)}>🗑 حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary card">
            <h3 className="summary-title">خلاصه سفارش</h3>

            <div className="coupon-row">
              <input
                className="input" placeholder="کد تخفیف"
                value={coupon} onChange={e => setCoupon(e.target.value)}
              />
              <button className="btn btn-outline coupon-btn" onClick={handleCoupon} disabled={checkingCoupon}>
                {checkingCoupon ? '...' : 'اعمال'}
              </button>
            </div>

            <div className="summary-rows">
              <div className="summary-row">
                <span>جمع کل</span>
                <span>{subtotal.toLocaleString()} تومان</span>
              </div>
              <div className="summary-row">
                <span>هزینه ارسال</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--green)' }}>رایگان</span> : `${shipping.toLocaleString()} تومان`}</span>
              </div>
              {discount > 0 && (
                <div className="summary-row discount-row">
                  <span>تخفیف کوپن ({discount}٪)</span>
                  <span>- {discountAmt.toLocaleString()} تومان</span>
                </div>
              )}
              <div className="divider" />
              <div className="summary-row total-row">
                <span>مبلغ نهایی</span>
                <span className="final-price">{total.toLocaleString()} تومان</span>
              </div>
            </div>

            <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              ادامه و پرداخت ←
            </button>

            <Link to="/products" className="continue-shopping">← ادامه خرید</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
