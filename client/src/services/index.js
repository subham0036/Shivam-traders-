import API from './api';

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  changePassword: (data) => API.put('/auth/password', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.put(`/auth/reset-password/${token}`, { password }),
  addAddress: (data) => API.post('/auth/addresses', data),
  updateAddress: (id, data) => API.put(`/auth/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/auth/addresses/${id}`),
};

export const productAPI = {
  getAll: (params) => API.get('/products', { params }),
  getBySlug: (slug) => API.get(`/products/${slug}`),
  checkDelivery: (pincode) => API.get(`/products/delivery/${pincode}`),
  adminGetAll: (params) => API.get('/products/admin/all', { params }),
  create: (formData) => API.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/products/${id}`),
  duplicate: (id) => API.post(`/products/${id}/duplicate`),
};

export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getBySlug: (slug) => API.get(`/categories/${slug}`),
  create: (formData) => API.post('/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => API.put(`/categories/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => API.delete(`/categories/${id}`),
};

export const cartAPI = {
  get: (sessionId) => API.get('/cart', { params: { sessionId } }),
  add: (data) => API.post('/cart', data),
  update: (productId, data) => API.put(`/cart/${productId}`, data),
  remove: (productId, sessionId) => API.delete(`/cart/${productId}`, { params: { sessionId } }),
  applyCoupon: (data) => API.post('/cart/coupon', data),
  updateGift: (data) => API.put('/cart/gift', data),
  clear: (sessionId) => API.delete('/cart', { params: { sessionId } }),
};

export const orderAPI = {
  create: (data) => API.post('/orders', data),
  verifyPayment: (data) => API.post('/orders/verify-payment', data),
  getMyOrders: () => API.get('/orders/my'),
  track: (orderNumber) => API.get(`/orders/track/${orderNumber}`),
  getById: (id) => API.get(`/orders/${id}`),
  getAll: (params) => API.get('/orders', { params }),
  updateStatus: (id, data) => API.put(`/orders/${id}/status`, data),
  getInvoice: (id) => API.get(`/orders/${id}/invoice`),
};

export const wishlistAPI = {
  get: () => API.get('/wishlist'),
  add: (productId) => API.post('/wishlist', { productId }),
  remove: (productId) => API.delete(`/wishlist/${productId}`),
};

export const reviewAPI = {
  getByProduct: (productId) => API.get(`/reviews/product/${productId}`),
  create: (data) => API.post('/reviews', data),
  addQuestion: (data) => API.post('/reviews/questions', data),
};

export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getCustomers: () => API.get('/admin/customers'),
  toggleBlock: (id) => API.put(`/admin/customers/${id}/block`),
  getInventory: (params) => API.get('/admin/inventory', { params }),
  stockIn: (data) => API.post('/admin/inventory/stock-in', data),
  stockOut: (data) => API.post('/admin/inventory/stock-out', data),
  getCoupons: () => API.get('/admin/coupons'),
  createCoupon: (data) => API.post('/admin/coupons', data),
  updateCoupon: (id, data) => API.put(`/admin/coupons/${id}`, data),
  deleteCoupon: (id) => API.delete(`/admin/coupons/${id}`),
  getSettings: () => API.get('/admin/settings'),
  updateSettings: (data) => API.put('/admin/settings', data),
  subscribeNewsletter: (data) => API.post('/admin/newsletter', data),
  submitContact: (data) => API.post('/admin/contact', data),
  createStaff: (data) => API.post('/admin/staff', data),
};
