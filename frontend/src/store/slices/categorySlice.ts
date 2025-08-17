import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Category } from '../../types';

// 🆕 Hierarchical Category Type
export interface HierarchicalCategory {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  isParent: boolean;
  subCategories: Array<{
    id: number;
    name: string;
    description?: string;
    parentCategoryId: number;
    isParent: boolean;
  }>;
}

interface CategoryState {
  categories: Category[];
  hierarchicalCategories: HierarchicalCategory[]; // 🆕 Yeni alan
  currentCategory: Category | null;
  isLoading: boolean;
  isLoadingHierarchical: boolean; // 🆕 Yeni loading state
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  hierarchicalCategories: [], // 🆕 
  currentCategory: null,
  isLoading: false,
  isLoadingHierarchical: false, // 🆕
  error: null,
};

// Existing async thunks
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async () => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  }
);

// 🆕 NEW: Hierarchical kategorileri fetch et
export const fetchHierarchicalCategories = createAsyncThunk(
  'categories/fetchHierarchicalCategories',
  async () => {
    const response = await api.get<HierarchicalCategory[]>('/categories/hierarchical');
    return response.data;
  }
);

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id: number) => {
    const response = await api.get<Category>(`/categories/${id}`);
    return response.data;
  }
);

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Existing: Fetch Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch categories';
      });

    // 🆕 NEW: Fetch Hierarchical Categories
    builder
      .addCase(fetchHierarchicalCategories.pending, (state) => {
        state.isLoadingHierarchical = true;
        state.error = null;
      })
      .addCase(fetchHierarchicalCategories.fulfilled, (state, action) => {
        state.isLoadingHierarchical = false;
        state.hierarchicalCategories = action.payload;
      })
      .addCase(fetchHierarchicalCategories.rejected, (state, action) => {
        state.isLoadingHierarchical = false;
        state.error = action.error.message || 'Failed to fetch hierarchical categories';
      });

    // Existing: Fetch Category By ID
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch category';
      });
  },
});

export const { clearCurrentCategory, clearError } = categorySlice.actions;
export default categorySlice.reducer;