import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const createPaymentOrder = (data) => api.post('/orders/create-payment-order', data);
export const verifyPayment = (data) => api.post('/orders/verify-payment', data);
export const getOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const moveToWishlist = (productId) => api.post(`/wishlist/${productId}`);

export default api;
