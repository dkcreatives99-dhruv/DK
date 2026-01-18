import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
    return Promise.reject(error);
  }
);

// ==================== AUTH ====================
export const authAPI = {
  signup: async (email, password, name) => {
    const response = await api.post('/auth/signup', { email, password, name });
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ==================== BUSINESS ====================
export const businessAPI = {
  get: async () => {
    const response = await api.get('/business');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/business', data);
    return response.data;
  },
  
  update: async (data) => {
    const response = await api.put('/business', data);
    return response.data;
  },
};

// ==================== BANK ACCOUNTS ====================
export const bankAccountsAPI = {
  getAll: async () => {
    const response = await api.get('/bank-accounts');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/bank-accounts', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/bank-accounts/${id}`, data);
    return response.data;
  },
  
  setOpeningBalance: async (id, openingBalance) => {
    const response = await api.put(`/bank-accounts/${id}/opening-balance?opening_balance=${openingBalance}`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/bank-accounts/${id}`);
    return response.data;
  },
};

// ==================== CUSTOMERS ====================
export const customersAPI = {
  getAll: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },
};

// ==================== PRODUCTS ====================
export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/products', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

// ==================== INVOICES ====================
export const invoicesAPI = {
  getAll: async (includeDeleted = false) => {
    const response = await api.get(`/invoices?include_deleted=${includeDeleted}`);
    return response.data;
  },
  
  getOne: async (id) => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },
  
  getNextNumber: async () => {
    const response = await api.get('/invoices/next-number/get');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/invoices', data);
    return response.data;
  },
  
  updatePayment: async (id, data) => {
    const response = await api.put(`/invoices/${id}/payment`, data);
    return response.data;
  },
  
  updateStatus: async (id, status) => {
    const response = await api.put(`/invoices/${id}/status?status=${status}`);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },
  
  restore: async (id) => {
    const response = await api.put(`/invoices/${id}/restore`);
    return response.data;
  },
};

// ==================== INCOME (NEW) ====================
export const incomeAPI = {
  getAll: async () => {
    const response = await api.get('/income');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/income', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/income/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/income/${id}`);
    return response.data;
  },
};

// ==================== EXPENSES ====================
export const expensesAPI = {
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/expenses', data);
    return response.data;
  },
  
  update: async (id, data) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },
};

// ==================== LEDGER SETTINGS ====================
export const ledgerSettingsAPI = {
  get: async () => {
    const response = await api.get('/ledger-settings');
    return response.data;
  },
  
  create: async (data) => {
    const response = await api.post('/ledger-settings', data);
    return response.data;
  },
  
  update: async (data) => {
    const response = await api.put('/ledger-settings', data);
    return response.data;
  },
};

// ==================== DASHBOARD & LEDGER ====================
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const ledgerAPI = {
  getData: async () => {
    const response = await api.get('/ledger');
    return response.data;
  },
};

// ==================== REPORTS ====================
export const reportsAPI = {
  getOutstanding: async () => {
    const response = await api.get('/reports/outstanding');
    return response.data;
  },
  
  getIncomeExpense: async () => {
    const response = await api.get('/reports/income-expense');
    return response.data;
  },
  
  getAuditLog: async (limit = 100) => {
    const response = await api.get(`/reports/audit-log?limit=${limit}`);
    return response.data;
  },
};

export default api;
