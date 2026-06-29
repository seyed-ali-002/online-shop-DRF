import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">🛍 دیجی<span>شاپ</span></div>
            <p className="footer-desc">بهترین تجربه خرید آنلاین با قیمت‌های رقابتی و ارسال سریع به سراسر کشور</p>
            <div className="footer-social">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">📸</a>
              <a href="#" className="social-link">🐦</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>خدمات مشتریان</h4>
            <Link to="#">راهنمای خرید</Link>
            <Link to="#">پیگیری سفارش</Link>
            <Link to="#">بازگشت کالا</Link>
            <Link to="#">تماس با ما</Link>
          </div>
          <div className="footer-col">
            <h4>دسته‌بندی‌ها</h4>
            <Link to="/products?category=mobile">موبایل</Link>
            <Link to="/products?category=laptop">لپ‌تاپ</Link>
            <Link to="/products?category=audio">هدفون</Link>
            <Link to="/products?category=camera">دوربین</Link>
          </div>
          <div className="footer-col">
            <h4>دیجی‌شاپ</h4>
            <Link to="#">درباره ما</Link>
            <Link to="#">فرصت‌های شغلی</Link>
            <Link to="#">حریم خصوصی</Link>
            <Link to="#">قوانین و مقررات</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© ۱۴۰۳ دیجی‌شاپ. تمام حقوق محفوظ است.</p>
          <div className="payment-icons">💳 پرداخت امن</div>
        </div>
      </div>
    </footer>
  );
}
