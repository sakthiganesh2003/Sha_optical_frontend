import axios from 'axios';
import {
  Customer,
  Order,
  MasterDataGrouped,
  DashboardStats,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('optical_shop_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to handle token expiry (401 errors)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('optical_shop_token');
      localStorage.removeItem('optical_shop_admin');
      // Redirect to login only if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('optical_shop_token', res.data.token);
      localStorage.setItem('optical_shop_admin', JSON.stringify(res.data.admin));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('optical_shop_token');
    localStorage.removeItem('optical_shop_admin');
    window.location.href = '/login';
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

export const dashboardService = {
  getStats: async (range: string = 'all'): Promise<DashboardStats> => {
    const res = await api.get('/dashboard/stats', { params: { range } });
    return res.data;
  },
};

export const customerService = {
  search: async (query: string): Promise<Customer[]> => {
    const res = await api.get('/customers/search', { params: { query } });
    return res.data;
  },
  getDetails: async (id: string): Promise<{ customer: Customer; orders: Order[] }> => {
    const res = await api.get(`/customers/${id}`);
    return res.data;
  },
  add: async (formData: FormData): Promise<{ customer: Customer; order: Order }> => {
    const res = await api.post('/customers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData): Promise<Customer> => {
    const res = await api.put(`/customers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

export const orderService = {
  get: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  create: async (formData: FormData): Promise<Order> => {
    const res = await api.post('/orders', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  update: async (id: string, formData: FormData): Promise<Order> => {
    const res = await api.put(`/orders/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },
};

export const masterDataService = {
  getAll: async (): Promise<MasterDataGrouped> => {
    const res = await api.get('/master-data');
    return res.data;
  },
  add: async (item: { type: string; value: string }) => {
    const res = await api.post('/master-data', item);
    return res.data;
  },
  update: async (id: string, value: string) => {
    const res = await api.put(`/master-data/${id}`, { value });
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/master-data/${id}`);
    return res.data;
  },
};
