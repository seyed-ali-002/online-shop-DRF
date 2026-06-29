import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE_URL}/users/token/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/users/token/', data),
  register: (data) => api.post('/users/', data),
  getMe: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data),
};

// Products
export const productAPI = {
  list: (params) => api.get('/products/', { params }),
  detail: (id) => api.get(`/products/${id}/`),
  categories: () => api.get('/products/categories/'),
  search: (q) => api.get('/products/', { params: { search: q } }),
};

// Cart
export const cartAPI = {
  get: () => api.get('/cart/'),
  addItem: (data) => api.post('/cart/items/', data),
  updateItem: (id, data) => api.patch(`/cart/items/${id}/`, data),
  removeItem: (id) => api.delete(`/cart/items/${id}/`),
};

// Orders
export const orderAPI = {
  list: () => api.get('/cart/orders/'),
  detail: (id) => api.get(`/cart/orders/${id}/`),
  create: (data) => api.post('/cart/orders/', data),
};

// Wishlist
export const wishlistAPI = {
  get: () => api.get('/products/wishlists/'),
  add: (data) => api.post('/products/wishlists/', data),
};

// Reviews
export const reviewAPI = {
  list: (productId) => api.get('/products/reviews/', { params: { product: productId } }),
  create: (data) => api.post('/products/reviews/', data),
};

// Coupons
export const couponAPI = {
  validate: (code) => api.get(`/products/coupons/${code}/`),
};

export default api;
