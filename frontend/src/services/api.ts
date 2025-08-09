import axios, { AxiosError, AxiosResponse } from 'axios';
import { 
  Product, 
  ProductVariant, 
  ProductFilters, 
  CreateProductVariantRequest,
  AddToCartRequest,
  UpdateCartItemRequest,
  Cart,
  Order,
  CreateOrderRequest,
  Address,
  Category,
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse
} from '../types';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5288/api';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Session ID'yi de ekle (guest users için)
    const sessionId = localStorage.getItem('sessionId') || `session-${Date.now()}`;
    if (!token) {
      config.headers['X-Session-Id'] = sessionId;
      localStorage.setItem('sessionId', sessionId);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// =============================================
// PRODUCT API FUNCTIONS (🆕 GÜNCELLENMIŞ)
// =============================================

export const productApi = {
  // Mevcut metotlar (güncellendi)
  getProducts: async (filters: ProductFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.sale !== undefined) params.append('sale', filters.sale.toString());
    if (filters.gender) params.append('gender', filters.gender); // 🆕 YENİ
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await api.get(`/products/search-suggestions?q=${query}`);
    return response.data;
  },

  // 🆕 YENİ METOTLAR - GENDER VE SIZE ENDPOİNTLERİ
  getGenders: async (): Promise<string[]> => {
    const response = await api.get('/products/genders');
    return response.data;
  },

  getClothingSizes: async (): Promise<string[]> => {
    const response = await api.get('/products/sizes/clothing');
    return response.data;
  },

  getMaleShoeSizes: async (): Promise<string[]> => {
    const response = await api.get('/products/sizes/shoes/male');
    return response.data;
  },

  getFemaleShoeSizes: async (): Promise<string[]> => {
    const response = await api.get('/products/sizes/shoes/female');
    return response.data;
  },

  getKidsSizes: async (): Promise<string[]> => {
    const response = await api.get('/products/sizes/kids');
    return response.data;
  },

  // CRUD operations
  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<void> => {
    await api.put(`/products/${id}`, product);
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// =============================================
// 🆕 PRODUCT VARIANT API FUNCTIONS
// =============================================

export const productVariantApi = {
  getProductVariants: async (productId: number): Promise<ProductVariant[]> => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  },

  createProductVariant: async (productId: number, variant: CreateProductVariantRequest): Promise<ProductVariant> => {
    const response = await api.post(`/products/${productId}/variants`, variant);
    return response.data;
  },

  updateProductVariant: async (variantId: number, variant: Partial<ProductVariant>): Promise<void> => {
    await api.put(`/products/variants/${variantId}`, variant);
  },

  deleteProductVariant: async (variantId: number): Promise<void> => {
    await api.delete(`/products/variants/${variantId}`);
  },

  getVariantPrice: async (variantId: number): Promise<{ price: number }> => {
    const response = await api.get(`/products/variants/${variantId}/price`);
    return response.data;
  },

  checkVariantStock: async (variantId: number, quantity: number): Promise<{ isAvailable: boolean }> => {
    const response = await api.get(`/products/variants/${variantId}/stock/${quantity}`);
    return response.data;
  },
};

// =============================================
// MEVCUT API FUNCTIONS (Korundu)
// =============================================

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
};

// Cart API (🆕 GÜNCELLENMIŞ - Variant desteği)
export const cartApi = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (request: AddToCartRequest): Promise<void> => {
    await api.post('/cart/items', request);
  },

  updateCartItem: async (request: UpdateCartItemRequest): Promise<void> => {
    await api.put('/cart/items', request);
  },

  removeFromCart: async (cartItemId: number): Promise<void> => {
    await api.delete(`/cart/items/${cartItemId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },
};

// Order API
export const orderApi = {
  createOrder: async (request: CreateOrderRequest): Promise<Order> => {
    const response = await api.post('/orders', request);
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  cancelOrder: async (id: number): Promise<void> => {
    await api.post(`/orders/${id}/cancel`);
  },
};

// Address API
export const addressApi = {
  getAddresses: async (): Promise<Address[]> => {
    const response = await api.get('/addresses');
    return response.data;
  },

  createAddress: async (address: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
    const response = await api.post('/addresses', address);
    return response.data;
  },

  updateAddress: async (id: number, address: Partial<Address>): Promise<void> => {
    await api.put(`/addresses/${id}`, address);
  },

  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await api.post(`/addresses/${id}/set-default`);
  },
};

// Category API
export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (category: Omit<Category, 'id' | 'isActive'>): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  updateCategory: async (id: number, category: Partial<Category>): Promise<void> => {
    await api.put(`/categories/${id}`, category);
  },

  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export default api;