import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../api';
import ProductCard from '../components/ProductCard';
import './ProductsPage.css';

const SORT_OPTIONS = [
  { value: '', label: 'پیش‌فرض' },
  { value: 'price', label: 'ارزان‌ترین' },
  { value: '-price', label: 'گران‌ترین' },
  { value: '-created_at', label: 'جدیدترین' },
  { value: 'name', label: 'الفبایی' },
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

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const search = searchParams.get('search') || '';
  const catFilter = searchParams.get('category') || '';
  const sort = searchParams.get('ordering') || '';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (catFilter) params.category__slug = catFilter;
      if (sort) params.ordering = sort;
      if (minPrice) params.price__gte = minPrice;
      if (maxPrice) params.price__lte = maxPrice;
      const { data } = await productAPI.list(params);
      setProducts(data.results || data);
      setTotal(data.count || (data.results || data).length);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, catFilter, sort, minPrice, maxPrice, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => {
    productAPI.categories().then(({ data }) => setCategories(data.results || data)).catch(() => {});
  }, []);

  const updateParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setPage(1);
    setSearchParams(next);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="page products-page">
      <div className="container">
        <div className="products-layout">
          {/* Sidebar filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h4 className="filter-title">دسته‌بندی</h4>
              <div className="filter-list">
                <label className={`filter-item ${!catFilter ? 'active' : ''}`}>
                  <input type="radio" name="cat" checked={!catFilter} onChange={() => updateParam('category', '')} />
                  همه محصولات
                </label>
                {categories.map(cat => (
                  <label key={cat.id} className={`filter-item ${catFilter === cat.slug ? 'active' : ''}`}>
                    <input type="radio" name="cat" checked={catFilter === cat.slug} onChange={() => updateParam('category', cat.slug)} />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4 className="filter-title">محدوده قیمت</h4>
              <div className="price-range">
                <input
                  className="input" type="number" placeholder="حداقل قیمت"
                  value={minPrice} onChange={e => updateParam('min_price', e.target.value)}
                />
                <input
                  className="input" type="number" placeholder="حداکثر قیمت"
                  value={maxPrice} onChange={e => updateParam('max_price', e.target.value)}
                />
              </div>
            </div>

            <button className="btn btn-ghost filter-reset" onClick={() => { setSearchParams({}); setPage(1); }}>
              پاک کردن فیلترها
            </button>
          </aside>

          {/* Main */}
          <main className="products-main">
            {/* Top bar */}
            <div className="products-topbar">
              <div className="products-info">
                {search && <span className="search-tag">نتایج: "{search}"</span>}
                {!loading && <span className="total-count">{total} محصول</span>}
              </div>
              <select
                className="sort-select"
                value={sort}
                onChange={e => updateParam('ordering', e.target.value)}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            {/* Grid */}
            <div className="product-grid">
              {loading
                ? Array(PAGE_SIZE).fill(0).map((_, i) => <Skeleton key={i} />)
                : products.map(p => <ProductCard key={p.id} product={p} />)
              }
            </div>

            {!loading && products.length === 0 && (
              <div className="empty-state" style={{ padding: '80px 0' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <p style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>محصولی پیدا نشد</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const n = i + 1;
                  return (
                    <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
                  );
                })}
                <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>→</button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
