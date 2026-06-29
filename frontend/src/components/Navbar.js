import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';
import { productAPI } from '../api';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg, setShowSugg] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const debounce = useRef(null);

  const handleSearch = (e) => {
    const val = e.target.value;
    setQ(val);
    clearTimeout(debounce.current);
    if (val.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    debounce.current = setTimeout(async () => {
      try {
        const { data } = await productAPI.search(val);
        const items = data.results || data;
        setSuggestions(items.slice(0, 6));
        setShowSugg(true);
      } catch { setSuggestions([]); }
    }, 280);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?search=${encodeURIComponent(q)}`); setShowSugg(false); }
  };

  useEffect(() => {
    const close = () => { setShowSugg(false); setProfileOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛍</span>
          <span className="logo-text">دیجی<span className="logo-accent">شاپ</span></span>
        </Link>

        {/* Search */}
        <div className="navbar-search" onClick={e => e.stopPropagation()}>
          <form onSubmit={submitSearch}>
            <div className="search-wrap">
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="search-input"
                placeholder="جستجو در دیجی‌شاپ..."
                value={q}
                onChange={handleSearch}
                onFocus={() => suggestions.length && setShowSugg(true)}
              />
              <button type="submit" className="search-btn">جستجو</button>
            </div>
          </form>
          {showSugg && suggestions.length > 0 && (
            <div className="search-dropdown">
              {suggestions.map(p => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="search-item"
                  onClick={() => { setShowSugg(false); setQ(''); }}
                >
                  <div className="search-item-img">
                    {p.images?.[0]?.image
                      ? <img src={p.images[0].image} alt={p.name} />
                      : <span className="placeholder-img">📦</span>}
                  </div>
                  <div>
                    <div className="search-item-name">{p.name}</div>
                    <div className="search-item-brand">{p.brand}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <Link to="/cart" className="nav-btn cart-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            <span className="nav-label">سبد</span>
          </Link>

          {user ? (
            <div className="profile-wrap" onClick={e => { e.stopPropagation(); setProfileOpen(!profileOpen); }}>
              <button className="nav-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="nav-icon">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span className="nav-label">{user.first_name || user.username}</span>
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <Link to="/profile" className="profile-menu-item">👤 پروفایل من</Link>
                  <Link to="/orders" className="profile-menu-item">📦 سفارش‌ها</Link>
                  <Link to="/wishlist" className="profile-menu-item">❤️ علاقه‌مندی‌ها</Link>
                  <div className="profile-divider"/>
                  <button className="profile-menu-item logout" onClick={logout}>🚪 خروج</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-btn login-btn">
              <span>ورود | ثبت‌نام</span>
            </Link>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Secondary nav */}
      <div className="navbar-secondary">
        <div className="container">
          <nav className="secondary-nav">
            <Link to="/products?category=mobile" className="secondary-link">📱 موبایل</Link>
            <Link to="/products?category=laptop" className="secondary-link">💻 لپ‌تاپ</Link>
            <Link to="/products?category=tablet" className="secondary-link">📟 تبلت</Link>
            <Link to="/products?category=audio" className="secondary-link">🎧 هدفون</Link>
            <Link to="/products?category=camera" className="secondary-link">📷 دوربین</Link>
            <Link to="/products?category=tv" className="secondary-link">📺 تلویزیون</Link>
            <Link to="/products?category=game" className="secondary-link">🎮 گیمینگ</Link>
            <Link to="/products" className="secondary-link see-all">همه محصولات ←</Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={() => setMenuOpen(false)} className="mobile-link">خانه</Link>
          <Link to="/products" onClick={() => setMenuOpen(false)} className="mobile-link">محصولات</Link>
          <Link to="/cart" onClick={() => setMenuOpen(false)} className="mobile-link">سبد خرید</Link>
          {user
            ? <><Link to="/profile" onClick={() => setMenuOpen(false)} className="mobile-link">پروفایل</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="mobile-link">سفارش‌ها</Link>
                <button className="mobile-link" onClick={() => { logout(); setMenuOpen(false); }}>خروج</button></>
            : <Link to="/login" onClick={() => setMenuOpen(false)} className="mobile-link">ورود</Link>
          }
        </div>
      )}
    </header>
  );
}
