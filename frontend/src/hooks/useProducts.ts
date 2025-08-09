// =============================================
// DÜZELTILMIŞ HOOKS (src/hooks/useProducts.ts)
// =============================================

import { useState, useEffect } from 'react';
import { Product, ProductFilters, ProductVariant } from '../types';  // 🆕 ProductVariant eklendi
import { productApi, productVariantApi } from '../services/api';  // 🆕 productVariantApi eklendi

export const useProducts = (filters: ProductFilters = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productApi.getProducts(filters);
      setProducts(response.products);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError('Ürünler yüklenirken hata oluştu');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
};

// 🆕 Variant için özel hook
export const useProductVariants = (productId: number) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const variantList = await productVariantApi.getProductVariants(productId);
        setVariants(variantList);
        setError(null);
      } catch (err) {
        setError('Varyantlar yüklenirken hata oluştu');
        console.error('Error fetching variants:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  return {
    variants,
    loading,
    error,
    refetch: async () => {
      const variantList = await productVariantApi.getProductVariants(productId);
      setVariants(variantList);
    },
  };
};