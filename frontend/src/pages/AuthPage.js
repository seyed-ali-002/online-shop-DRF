import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import './AuthPage.css';

export default function AuthPage({ mode = 'login' }) {
  const { login, register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '', phone: '', email: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login({ username: form.username, password: form.password });
      } else {
        await register(form);
      }
      addToast(isLogin ? 'خوش آمدید!' : 'ثبت‌نام موفق');
      navigate('/');
    } catch (err) {
      const data = err.response?.data;
      const msg = data?.detail || data?.username?.[0] || data?.password?.[0] || (isLogin ? 'اطلاعات نادرست است' : 'خطا در ثبت‌نام');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card">
        <div className="auth-logo">🛍 دیجی<span>شاپ</span></div>
        <h2 className="auth-title">{isLogin ? 'ورود به حساب' : 'ثبت‌نام'}</h2>
        <p className="auth-sub">{isLogin ? 'با حساب کاربری وارد شوید' : 'حساب جدید بسازید'}</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-row">
              <div className="form-group">
                <label>نام</label>
                <input className="input" placeholder="نام" value={form.first_name} onChange={update('first_name')} />
              </div>
              <div className="form-group">
                <label>نام خانوادگی</label>
                <input className="input" placeholder="نام خانوادگی" value={form.last_name} onChange={update('last_name')} />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>نام کاربری</label>
            <input className="input" placeholder="نام کاربری" value={form.username} onChange={update('username')} required />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>ایمیل</label>
                <input className="input" type="email" placeholder="ایمیل" value={form.email} onChange={update('email')} />
              </div>
              <div className="form-group">
                <label>شماره موبایل</label>
                <input className="input" placeholder="09..." value={form.phone} onChange={update('phone')} required />
              </div>
            </>
          )}

          <div className="form-group">
            <label>رمز عبور</label>
            <input className="input" type="password" placeholder="رمز عبور" value={form.password} onChange={update('password')} required />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'در حال پردازش...' : (isLogin ? 'ورود' : 'ثبت‌نام')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? (
            <p>حساب ندارید؟ <button className="switch-btn" onClick={() => setIsLogin(false)}>ثبت‌نام کنید</button></p>
          ) : (
            <p>حساب دارید؟ <button className="switch-btn" onClick={() => setIsLogin(true)}>وارد شوید</button></p>
          )}
        </div>
      </div>
    </div>
  );
}
