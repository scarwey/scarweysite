import React, { useState, useEffect } from 'react';
import { ProductVariant } from '../../types';
import { productVariantApi } from '../../services/api';

interface SizeSelectorProps {
  productId: number;
  selectedVariantId?: number;
  onSizeSelect: (variant: ProductVariant | null) => void;
  className?: string;
}

export const SizeSelector: React.FC<SizeSelectorProps> = ({
  productId,
  selectedVariantId,
  onSizeSelect,
  className = "",
}) => {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const variantList = await productVariantApi.getProductVariants(productId);
        setVariants(variantList.filter(v => v.isAvailable));
        setError(null);
      } catch (err) {
        setError('Beden seçenekleri yüklenirken hata oluştu');
        console.error('Error fetching variants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  const handleSizeClick = (variant: ProductVariant) => {
    if (variant.stockQuantity === 0) return;
    
    if (selectedVariantId === variant.id) {
      onSizeSelect(null); // Deselect
    } else {
      onSizeSelect(variant);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded mb-2 w-16"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  if (variants.length === 0) {
    return null; // Beden seçeneği yok
  }

  return (
    <div className={className}>
      <h3 className="text-sm font-medium text-gray-900 mb-2">Beden</h3>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stockQuantity === 0;
          
          return (
            <button
              key={variant.id}
              onClick={() => handleSizeClick(variant)}
              disabled={isOutOfStock}
              className={`
                px-3 py-2 text-sm border rounded-md font-medium transition-colors duration-200
                ${isSelected
                  ? 'border-purple-600 bg-purple-600 text-white'
                  : isOutOfStock
                  ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-purple-600 hover:text-purple-600'
                }
              `}
              title={isOutOfStock ? 'Stokta yok' : `${variant.stockQuantity} adet stokta`}
            >
              {variant.sizeDisplay || variant.size}
              {isOutOfStock && (
                <span className="block text-xs">Tükendi</span>
              )}
            </button>
          );
        })}
      </div>
      
      {selectedVariantId && (
        <div className="mt-2 text-sm text-gray-500">
          {(() => {
            const selectedVariant = variants.find(v => v.id === selectedVariantId);
            return selectedVariant ? `${selectedVariant.stockQuantity} adet stokta` : '';
          })()}
        </div>
      )}
    </div>
  );
};