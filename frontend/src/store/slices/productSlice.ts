import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Product, PaginatedResponse, ProductFilters } from '../../types';

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  currentProduct: Product | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  } | null;
  filters: ProductFilters;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  pagination: null,
  filters: {
    page: 1,
    pageSize: 12,
    sortBy: 'name',
  },
  isLoading: false,
  error: null,
};

// ✅ TAM DÜZELTME: CategoryIds array desteği eklendi
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: any) => {
    console.log('🚀 fetchProducts called with filters:', filters);
    
    const params = new URLSearchParams();
    
    // Sayfalama
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    // Arama ve kategori
    if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());
    
    // 🆕 CATEGORYIDS ARRAY DESTEĞİ
    if (filters.categoryIds && Array.isArray(filters.categoryIds) && filters.categoryIds.length > 0) {
      params.append('categoryIds', filters.categoryIds.join(','));
      console.log('📂 CategoryIds filter added:', filters.categoryIds);
    }
    
    // Tekil categoryId (geriye uyumluluk için)
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
      console.log('📂 CategoryId filter added:', filters.categoryId);
    }
    
    // 🆕 SUBCATEGORYIDS ARRAY DESTEĞİ
    if (filters.subCategoryIds && Array.isArray(filters.subCategoryIds) && filters.subCategoryIds.length > 0) {
      params.append('subCategoryIds', filters.subCategoryIds.join(','));
      console.log('📁 SubCategoryIds filter added:', filters.subCategoryIds);
    }
    
    // 🆕 Gender filtresi
    if (filters.gender && filters.gender.trim() && filters.gender !== 'undefined') {
      params.append('gender', filters.gender.trim());
      console.log('🎯 Gender filter added:', filters.gender);
    }
    
    // Fiyat aralığı
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      params.append('minPrice', filters.minPrice.toString());
      console.log('💰 MinPrice filter added:', filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      params.append('maxPrice', filters.maxPrice.toString());
      console.log('💰 MaxPrice filter added:', filters.maxPrice);
    }
    
    // Sıralama
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    
    // Özel filtreler
    if (filters.featured === true) {
      params.append('featured', 'true');
      console.log('⭐ Featured filter activated');
    }
    if (filters.sale === true) {
      params.append('sale', 'true');
      console.log('🔥 Sale filter activated');
    }

    const url = `/products?${params.toString()}`;
    console.log('📤 Final API Request URL:', url);
    console.log('📤 All filters being sent:', filters);

    try {
      const response = await api.get<PaginatedResponse<Product>>(url);
      console.log('📥 API Response received:', {
        productsCount: response.data.products?.length || 0,
        totalItems: response.data.pagination?.totalItems || 0
      });
      return response.data;
    } catch (error) {
      console.error('❌ API Error:', error);
      throw error;
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id: number) => {
    console.log('🔍 Fetching product by ID:', id);
    try {
      const response = await api.get<Product>(`/products/${id}`);
      console.log('✅ Product fetched successfully:', response.data.name);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      throw error;
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async () => {
    console.log('⭐ Fetching featured products...');
    try {
      const response = await api.get<Product[]>('/products/featured');
      console.log('✅ Featured products fetched:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      throw error;
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (query: string) => {
    if (!query || query.length < 2) {
      return [];
    }
    console.log('🔍 Search suggestions for:', query);
    try {
      const response = await api.get<string[]>(`/products/search-suggestions?q=${encodeURIComponent(query)}`);
      console.log('✅ Search suggestions received:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching search suggestions:', error);
      throw error;
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      console.log('🔧 Setting filters:', action.payload);
      state.filters = { ...state.filters, ...action.payload };
      console.log('🔧 Updated filters state:', state.filters);
    },
    resetFilters: (state) => {
      console.log('🔄 Resetting filters to initial state');
      state.filters = {
        page: 1,
        pageSize: 12,
        sortBy: 'name',
      };
    },
    clearCurrentProduct: (state) => {
      console.log('🗑️ Clearing current product');
      state.currentProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // 🆕 YENİ: Hızlı filtre güncelleme actionları
    setGenderFilter: (state, action) => {
      console.log('👤 Setting gender filter:', action.payload);
      state.filters.gender = action.payload;
      state.filters.page = 1; // Sayfa sıfırla
    },
    setCategoryFilter: (state, action) => {
      console.log('📂 Setting category filter:', action.payload);
      state.filters.categoryId = action.payload;
      state.filters.page = 1; // Sayfa sıfırla
    },
    setPriceRange: (state, action) => {
      console.log('💰 Setting price range:', action.payload);
      state.filters.minPrice = action.payload.minPrice;
      state.filters.maxPrice = action.payload.maxPrice;
      state.filters.page = 1; // Sayfa sıfırla
    },
    setSortBy: (state, action) => {
      console.log('📊 Setting sort by:', action.payload);
      state.filters.sortBy = action.payload;
      state.filters.page = 1; // Sayfa sıfırla
    },
  },
  extraReducers: (builder) => {
    // Fetch Products
    builder
      .addCase(fetchProducts.pending, (state) => {
        console.log('⏳ Products loading...');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('✅ Products loaded successfully:', {
          count: action.payload.products?.length || 0,
          totalItems: action.payload.pagination?.totalItems || 0,
          currentPage: action.payload.pagination?.currentPage || 1
        });
        state.isLoading = false;
        state.products = action.payload.products || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('❌ Products loading failed:', action.error.message);
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch products';
        state.products = [];
        state.pagination = null;
      });

    // Fetch Product By ID
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch product';
        state.currentProduct = null;
      });

    // Fetch Featured Products
    builder
      .addCase(fetchFeaturedProducts.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload || [];
      })
      .addCase(fetchFeaturedProducts.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch featured products';
        state.featuredProducts = [];
      });

    // Search Products (suggestions)
    builder
      .addCase(searchProducts.fulfilled, (state, action) => {
        // Search suggestions başka bir state'te tutulabilir
        // Şimdilik sadece log atalım
        console.log('🔍 Search suggestions updated:', action.payload.length);
      })
      .addCase(searchProducts.rejected, (state, action) => {
        console.error('❌ Search suggestions failed:', action.error.message);
      });
  },
});

export const { 
  setFilters, 
  resetFilters, 
  clearCurrentProduct, 
  clearError,
  setGenderFilter,
  setCategoryFilter, 
  setPriceRange,
  setSortBy
} = productSlice.actions;

export default productSlice.reducer;