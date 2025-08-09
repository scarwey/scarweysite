// User Types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  role: string[];
}

// 🆕 REFUND TYPES - types.ts dosyasının sonuna ekleyin:

// İade için sipariş ürünü tipi
export interface OrderItemForRefund {
  id: number;
  productName: string;
  productImage?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  canRefund: boolean;
  alreadyRefundedQuantity: number;
}

// Kullanıcının seçtiği iade ürünü
export interface RefundItemSelection {
  orderItemId: number;
  quantity: number;
  reason: string;
  refundAmount: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Product Types (🆕 GÜNCELLENMIŞ)
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stockQuantity: number;
  sku: string;
  brand: string;
  categoryId: number;
  category?: Category;
  images?: ProductImage[];
  isFeatured: boolean;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // 🆕 YENİ ALANLAR
  gender?: string; // "Erkek", "Kadın", "Uniseks", "Çocuk"
  hasSizes: boolean; // Bu ürünün beden seçenekleri var mı?
  variants?: ProductVariant[]; // 🆕 Beden varyantları
}

// 🆕 YENİ TİP - PRODUCT VARIANT
export interface ProductVariant {
  id: number;
  productId: number;
  size: string;
  sizeDisplay?: string;
  stockQuantity: number;
  priceModifier?: number;
  isAvailable: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  altText?: string;
  isMainImage: boolean;
  displayOrder: number;
}

// Category Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number;
  parentCategory?: Category;
  subCategories?: Category[];
  products?: Product[];
  isActive: boolean;
}

// Cart Types (🆕 GÜNCELLENMIŞ)
export interface Cart {
  id: number;
  userId?: number;
  sessionId?: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  productVariantId?: number; // 🆕 YENİ - Beden seçimi için
  product?: Product;
  productVariant?: ProductVariant; // 🆕 YENİ
  selectedSize?: string; // 🆕 YENİ - Seçilen beden bilgisi (fallback)
  quantity: number;
  price: number;
}

export interface AddToCartRequest {
  productId: number;
  productVariantId?: number; // 🆕 YENİ - Beden seçimi için
  quantity: number;
}

export interface UpdateCartItemRequest {
  cartItemId: number;
  quantity: number;
}

// Order Types (🆕 GÜNCELLENMIŞ)
// types.ts'deki Order interface'ine ekleyin:

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  taxAmount: number;
  shippingFirstName: string;
  shippingLastName: string;
  shippingEmail: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  paymentMethod: 'cash_on_delivery';
  paymentTransactionId?: string;
  paymentDate?: string;
  orderItems: OrderItem[];
  // 🆕 YENİ EKLENEN:
  hasActiveRefundRequest?: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productVariantId?: number; // 🆕 YENİ - Siparişteki beden bilgisi
  product?: Product;
  productVariant?: ProductVariant; // 🆕 YENİ
  productName: string;
  selectedSize?: string; // 🆕 YENİ - Sipariş anındaki beden bilgisi
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Shipped = 2,
  Delivered = 3,
  Cancelled = 4,
  Refunded = 5
}

export interface CreateOrderRequest {
  addressId: number;
  paymentMethod: 'cash_on_delivery';
}

// Address Types
export interface Address {
  id: number;
  userId: number;
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  products: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

// Filter Types (🆕 GÜNCELLENMIŞ VE İYİLEŞTİRİLMİŞ)
export interface ProductFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'name_desc' | 'price' | 'price_desc' | 'newest' | 'popular' | 'discount';
  featured?: boolean; // 🆕 YENİ
  sale?: boolean; // 🆕 YENİ
  gender?: string; // 🆕 YENİ - "Erkek", "Kadın", "Uniseks", "Çocuk"
}

// 🆕 YENİ TİPLER - VARIANT İŞLEMLERİ İÇİN
export interface CreateProductVariantRequest {
  size: string;
  sizeDisplay?: string;
  stockQuantity: number;
  priceModifier?: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface UpdateProductVariantRequest extends Partial<CreateProductVariantRequest> {
  id: number;
}

// Admin Types - 🆕 GÜNCELLENMIŞ (orderItems eklendi)
export interface AdminOrdersResponse {
  orders: AdminOrder[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  paymentMethod: string;
  itemCount: number;
  shippingAddress?: {
    fullAddress: string;
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    postalCode: string;
    country: string;
  };
  customer: {
    id: number;
    name: string;
    email: string;
  };
  // 🆕 YENİ EKLENDİ - Sipariş detaylarında gerekli
  orderItems?: AdminOrderItem[];
}

// 🆕 YENİ TİP - Admin Order Item (Detail modal için)
export interface AdminOrderItem {
  id: number;
  orderId: number;
  productId: number;
  productVariantId?: number; // 🆕 Beden bilgisi için
  product?: {
    id: number;
    name: string;
    images?: ProductImage[];
  };
  productVariant?: ProductVariant; // 🆕 Beden detayları
  productName: string;
  selectedSize?: string; // 🆕 Fallback beden bilgisi
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

// Sort seçenekleri için enum:
export const SortOptions = {
  NAME: 'name',
  NAME_DESC: 'name_desc', 
  PRICE: 'price',
  PRICE_DESC: 'price_desc',
  NEWEST: 'newest',
  POPULAR: 'popular',
  DISCOUNT: 'discount'
} as const;

export type SortOption = typeof SortOptions[keyof typeof SortOptions];