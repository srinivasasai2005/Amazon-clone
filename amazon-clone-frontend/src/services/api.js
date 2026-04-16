import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  throw new Error('Missing VITE_API_URL. Set it in your Vite environment configuration.');
}

const api = axios.create({
  baseURL: baseURL.replace(/\/$/, ''),
  timeout: 15000,
});

// Interceptor to inject JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('amazon_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// ── API Services ───────────────────────────────────────────────────────────────

export const getProducts = async (params) => {
  const { data } = await api.get('/products', { params });
  return data;
};

export const getProduct = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};

export const getCategories = async () => {
  const { data } = await api.get('/categories');
  return data.categories;
};

// ── Cart ───────────────────────────────────────────────────────────────────────
export const getCart = async () => {
  const { data } = await api.get('/cart');
  return data;
};

export const addToCart = async (productId, quantity = 1) => {
  const { data } = await api.post('/cart', { product_id: productId, quantity });
  return data;
};

export const updateCartItem = async (productId, quantity) => {
  const { data } = await api.put(`/cart/${productId}`, { quantity });
  return data;
};

export const removeCartItem = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete('/cart');
  return data;
};

// ── Orders ─────────────────────────────────────────────────────────────────────
export const placeOrder = async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
};

export const getOrders = async () => {
  const { data } = await api.get('/orders');
  return data.orders;
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.order;
};

// ── Prime ─────────────────────────────────────────────────────────────────────
export const getPrimeStatus = async () => {
  const { data } = await api.get('/prime/status');
  return data.prime;
};

export const createPrimePaymentIntent = async (plan = 'monthly') => {
  const { data } = await api.post('/prime/create-payment-intent', { plan });
  return data;
};

export const subscribePrime = async (plan = 'monthly', paymentIntentId) => {
  const { data } = await api.post('/prime/subscribe', {
    plan,
    payment_intent_id: paymentIntentId,
  });
  return data;
};

// ── Support ───────────────────────────────────────────────────────────────────
export const getSupportFaqs = async () => {
  const { data } = await api.get('/support/faqs');
  return data.faqs ?? [];
};

// ── Wishlist ───────────────────────────────────────────────────────────────────
export const getWishlist = async () => {
  const { data } = await api.get('/wishlist');
  return data.items;
};

export const addToWishlist = async (productId) => {
  const { data } = await api.post('/wishlist', { product_id: productId });
  return data;
};

export const removeFromWishlist = async (productId) => {
  const { data } = await api.delete(`/wishlist/${productId}`);
  return data;
};

export default api;
