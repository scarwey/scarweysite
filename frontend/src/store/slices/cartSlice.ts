import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import { Cart, AddToCartRequest, UpdateCartItemRequest } from '../../types';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isCartOpen: boolean;
}

const initialState: CartState = {
  cart: null,
  isLoading: false,
  error: null,
  isCartOpen: false,
};

// Helper function to get session ID
const getSessionId = () => {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Helper function to get headers based on auth status
const getRequestHeaders = () => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    // User logged in - sadece Authorization header gönder
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Guest user - sessionId gönder
    headers['X-Session-Id'] = getSessionId();
  }
  
  return headers;
};

// 🆕 GÜNCELLENMIŞ - Variant desteği ile birlikte
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (data: AddToCartRequest, { rejectWithValue }) => {
    try {
      const headers = getRequestHeaders();
      console.log('🛒 ADD TO CART Headers:', headers);
      console.log('🛒 ADD TO CART Data:', data);

      // 🆕 Validation - Eğer variant ID varsa kontrol et
      if (data.productVariantId) {
        console.log(`🛒 Adding variant product: ProductID=${data.productId}, VariantID=${data.productVariantId}, Quantity=${data.quantity}`);
      } else {
        console.log(`🛒 Adding regular product: ProductID=${data.productId}, Quantity=${data.quantity}`);
      }
      
      const response = await api.post<Cart>('/cart/add', data, { headers });
      console.log('🛒 ADD TO CART Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ ADD TO CART Error:', error);
      
      // Hata mesajını kullanıcı dostu hale getir
      if (error.response?.data?.message) {
        return rejectWithValue(error.response.data.message);
      }
      
      if (error.response?.status === 400) {
        return rejectWithValue('Ürün sepete eklenirken bir hata oluştu. Lütfen beden seçiminizi kontrol edin.');
      }
      
      return rejectWithValue('Ürün sepete eklenirken bir hata oluştu.');
    }
  }
);

// Async thunks - Diğerleri aynı kalıyor
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getRequestHeaders();
      console.log('🛒 FETCH CART Headers:', headers);
      
      const response = await api.get<Cart>('/cart', { headers });
      console.log('🛒 FETCH CART Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ FETCH CART Error:', error);
      return rejectWithValue('Sepet yüklenirken bir hata oluştu.');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async (data: UpdateCartItemRequest, { rejectWithValue }) => {
    try {
      const headers = getRequestHeaders();
      console.log('🛒 UPDATE CART ITEM:', data);
      
      const response = await api.put<Cart>('/cart/update', data, { headers });
      console.log('🛒 UPDATE CART ITEM Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ UPDATE CART ITEM Error:', error);
      return rejectWithValue('Sepet güncellenirken bir hata oluştu.');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId: number, { rejectWithValue }) => {
    try {
      const headers = getRequestHeaders();
      console.log('🛒 REMOVE FROM CART:', cartItemId);
      
      await api.delete(`/cart/remove/${cartItemId}`, { headers });
      console.log('🛒 REMOVE FROM CART Success');
      
      return cartItemId;
    } catch (error: any) {
      console.error('❌ REMOVE FROM CART Error:', error);
      return rejectWithValue('Ürün sepetten çıkarılırken bir hata oluştu.');
    }
  }
);

export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      const headers = getRequestHeaders();
      console.log('🛒 CLEAR CART');
      
      await api.delete('/cart/clear', { headers });
      console.log('🛒 CLEAR CART Success');
      
      return true;
    } catch (error: any) {
      console.error('❌ CLEAR CART Error:', error);
      return rejectWithValue('Sepet temizlenirken bir hata oluştu.');
    }
  }
);

// 🆕 YENİ - Variant stock kontrolü
export const checkVariantStock = createAsyncThunk(
  'cart/checkVariantStock',
  async ({ variantId, quantity }: { variantId: number; quantity: number }, { rejectWithValue }) => {
    try {
      console.log('🛒 CHECK VARIANT STOCK:', { variantId, quantity });
      
      const response = await api.get<{ isAvailable: boolean }>(`/products/variants/${variantId}/stock/${quantity}`);
      console.log('🛒 CHECK VARIANT STOCK Response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('❌ CHECK VARIANT STOCK Error:', error);
      return rejectWithValue('Stok kontrolü yapılırken bir hata oluştu.');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    // 🆕 YENİ - Success mesajları için
    showSuccessMessage: (state, action) => {
      // Bu reducer UI tarafında toast göstermek için kullanılabilir
      console.log('✅ Cart Success:', action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch Cart
    builder
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        console.log('✅ Cart fetched successfully:', action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Sepet yüklenemedi';
        console.error('❌ Failed to fetch cart:', action.payload);
      });

    // 🆕 GÜNCELLENMIŞ - Add to Cart with better error handling
    builder
      .addCase(addToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        state.isCartOpen = true; // Open cart drawer after adding
        console.log('✅ Added to cart successfully:', action.payload);
        
        // 🆕 Son eklenen ürünü logla
        const lastItem = action.payload.cartItems[action.payload.cartItems.length - 1];
        if (lastItem?.productVariant) {
          console.log(`✅ Added variant product: ${lastItem.product?.name} - ${lastItem.productVariant.sizeDisplay || lastItem.productVariant.size}`);
        } else {
          console.log(`✅ Added regular product: ${lastItem?.product?.name}`);
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ürün sepete eklenemedi';
        console.error('❌ Failed to add to cart:', action.payload);
      });

    // Update Cart Item
    builder
      .addCase(updateCartItem.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
        console.log('✅ Cart item updated successfully');
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Sepet güncellenemedi';
        console.error('❌ Failed to update cart item:', action.payload);
      });

    // Remove from Cart
    builder
      .addCase(removeFromCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.cart) {
          // Ürünü sepetten çıkar
          const removedItemId = action.payload;
          const removedItem = state.cart.cartItems.find(item => item.id === removedItemId);
          
          state.cart.cartItems = state.cart.cartItems.filter(
            (item) => item.id !== removedItemId
          );
          
          // Toplam tutarı yeniden hesapla
          state.cart.totalAmount = state.cart.cartItems.reduce(
            (total, item) => total + item.price * item.quantity,
            0
          );

          console.log(`✅ Removed from cart: ${removedItem?.product?.name}`);
        }
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Ürün sepetten çıkarılamadı';
        console.error('❌ Failed to remove from cart:', action.payload);
      });

    // Clear Cart
    builder
      .addCase(clearCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.isLoading = false;
        state.cart = null;
        state.isCartOpen = false;
        console.log('✅ Cart cleared successfully');
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'Sepet temizlenemedi';
        console.error('❌ Failed to clear cart:', action.payload);
      });

    // 🆕 YENİ - Check Variant Stock
    builder
      .addCase(checkVariantStock.fulfilled, (state, action) => {
        console.log('✅ Variant stock check:', action.payload);
      })
      .addCase(checkVariantStock.rejected, (state, action) => {
        console.error('❌ Variant stock check failed:', action.payload);
      });
  },
});

export const { 
  toggleCart, 
  openCart, 
  closeCart, 
  clearError, 
  showSuccessMessage 
} = cartSlice.actions;

export default cartSlice.reducer;