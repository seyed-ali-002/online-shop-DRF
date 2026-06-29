import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { orderAPI, authAPI } from '../api';
import './ProfilePage.css';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { addToast } = useToast();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({ first_name: user.first_name || '', last_name: user.last_name || '', email: user.email || '' });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authAPI.updateMe(form);
      await refreshUser();
      addToast('پروفایل بروز شد');
    } catch { addToast('خطا', 'error'); }
    finally { setSaving(false); }
  };

  if (!user) return null;

  return (
    <div className="page">
      <div className="container profile-container">
        <div className="profile-header card">
          <div className="profile-avatar">{user.username?.[0]?.toUpperCase()}</div>
          <div>
            <h2 className="profile-username">{user.username}</h2>
            <p className="profile-email">{user.email}</p>
            <span className="badge badge-muted">{user.phone || 'شماره ثبت نشده'}</span>
          </div>
        </div>

        <div className="card profile-form-card">
          <h3 className="section-title" style={{ marginBottom: '24px' }}>ویرایش اطلاعات</h3>
          <form onSubmit={handleSave} className="profile-form">
            <div className="form-row2">
              <div className="form-group">
                <label>نام</label>
                <input className="input" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="نام" />
              </div>
              <div className="form-group">
                <label>نام خانوادگی</label>
                <input className="input" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} placeholder="نام خانوادگی" />
              </div>
            </div>
            <div className="form-group">
              <label>ایمیل</label>
              <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ایمیل" />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const STATUS_MAP = {
  pending: { label: 'در انتظار', color: '#f5a623' },
  paid: { label: 'پرداخت شده', color: '#25b97a' },
  processing: { label: 'در حال پردازش', color: '#3b82f6' },
  shipped: { label: 'ارسال شده', color: '#8b5cf6' },
  delivered: { label: 'تحویل داده شده', color: '#25b97a' },
  cancelled: { label: 'لغو شده', color: '#e84560' },
  returned: { label: 'مرجوع شده', color: '#e84560' },
};

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.list().then(({ data }) => setOrders(data.results || data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-heading">سفارش‌های من</h1>
        {loading
          ? <div className="skeleton" style={{ height: '120px', borderRadius: 'var(--radius)' }} />
          : orders.length === 0
            ? (
              <div className="empty-state card" style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                <p>هنوز سفارشی ندارید</p>
              </div>
            )
            : (
              <div className="orders-list">
                {orders.map(order => {
                  const s = STATUS_MAP[order.status] || { label: order.status, color: 'var(--text-muted)' };
                  return (
                    <div key={order.id} className="order-card card">
                      <div className="order-header">
                        <div>
                          <span className="order-id">سفارش #{order.id}</span>
                          <span className="order-date">{new Date(order.created_at).toLocaleDateString('fa-IR')}</span>
                        </div>
                        <span className="order-status" style={{ color: s.color, borderColor: s.color }}>
                          {s.label}
                        </span>
                      </div>
                      <div className="order-prices">
                        <div className="order-price-row">
                          <span>مبلغ کل</span>
                          <span>{order.total_price?.toLocaleString()} تومان</span>
                        </div>
                        <div className="order-price-row">
                          <span>هزینه ارسال</span>
                          <span>{order.shipping_cost?.toLocaleString()} تومان</span>
                        </div>
                        <div className="order-price-row total">
                          <span>مبلغ نهایی</span>
                          <span>{order.final_price?.toLocaleString()} تومان</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
        }
      </div>
    </div>
  );
}
