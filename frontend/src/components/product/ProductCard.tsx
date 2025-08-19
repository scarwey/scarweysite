import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { Product } from '../../types';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, toggleWishlist } from '../../store/slices/wishlistSlice';
import { AppDispatch, RootState } from '../../store';

const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiEye = Icons.FiEye as any;
const FiTag = Icons.FiTag as any;

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useDispatch<AppDispatch>();
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { isLoading: cartLoading } = useSelector((state: RootState) => state.cart);
  
  const isInWishlist = wishlistItems.some(item => item.id === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Eğer ürünün bedenleri varsa ProductDetail sayfasına yönlendir
    if (product.hasSizes && product.variants?.length) {
      // Beden seçimi gerektiği için detail sayfasına git
      window.location.href = `/products/${product.id}`;
      return;
    }
    
    // Normal ürün - doğrudan sepete ekle
    dispatch(addToCart({ productId: product.id, quantity: 1 }));
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const calculateDiscountPercentage = () => {
    if (product.discountPrice && product.price > product.discountPrice) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };

  const discountPercentage = calculateDiscountPercentage();
  const mainImage = product.images?.find(img => img.isMainImage) || product.images?.[0];

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/300x300?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) {
      return `https://scarwey.onrender.com${imageUrl}`;
    }
    return `https://scarwey.onrender.com/${imageUrl}`;
  };

  // Stok durumu hesapla
  const getTotalStock = () => {
    if (product.hasSizes && product.variants) {
      return product.variants
        .filter(v => v.isAvailable)
        .reduce((total, variant) => total + variant.stockQuantity, 0);
    }
    return product.stockQuantity;
  };

  // Mevcut beden sayısı
  const getAvailableSizesCount = () => {
    if (product.hasSizes && product.variants) {
      return product.variants.filter(v => v.isAvailable && v.stockQuantity > 0).length;
    }
    return 0;
  };

  const totalStock = getTotalStock();
  const availableSizesCount = getAvailableSizesCount();

  return (
    <Link to={`/products/${product.id}`} className="group block">
      <div className="bg-white rounded-lg overflow-hidden border border-gray-100 h-full flex flex-col relative">
        <div className="relative overflow-hidden aspect-square">
          {/* Product Image */}
          <img
            src={getImageUrl(mainImage?.imageUrl)}
            alt={mainImage?.altText || product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('⌐ ProductCard image error:', mainImage?.imageUrl);
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
            }}
          />
          
          {/* Badges Container - İnce etiketler */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-lg">
                %{discountPercentage} İNDİRİM
              </span>
            )}
            
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-lg">
                ÖNE ÇIKAN
              </span>
            )}
            
            {totalStock < 10 && totalStock > 0 && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full shadow-lg">
                SON {totalStock} ADET
              </span>
            )}
          </div>

          {/* Stock Status Overlay */}
          {totalStock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="bg-red-600 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm">
                STOKTA YOK
              </span>
            </div>
          )}
        </div>
        
        {/* Mobil Wishlist Button - Her zaman görünür, küçük ve şeffaf */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-1.5 right-1.5 w-6 h-6 rounded-full shadow-md transition-all duration-300 z-20 flex items-center justify-center ${
            isInWishlist 
              ? 'bg-red-500/90 text-white' 
              : 'bg-white/70 backdrop-blur-sm text-gray-600 hover:bg-white/90'
          }`}
          title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        >
          <FiHeart size={10} className={isInWishlist ? 'fill-current' : ''} />
        </button>
        
        {/* Content Area - Minimal ve Kompakt */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col">
          {/* Brand - Sadece desktop'ta göster */}
          {product.brand && (
            <p className="hidden sm:block text-xs text-orange-600 uppercase tracking-wide mb-1 font-semibold">
              {product.brand}
            </p>
          )}
          
          {/* Product Name - Kompakt */}
          <h3 className="font-medium text-xs sm:text-sm mb-1 text-gray-800 hover:text-orange-600 transition-colors break-words overflow-hidden"
              style={{ 
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxHeight: '2rem',
                lineHeight: '1rem'
              }}>
            {product.name}
          </h3>

          {/* Size Info - Çok Kompakt */}
          {product.hasSizes && product.variants && product.variants.length > 0 && (
            <div className="mb-1">
              <div className="flex items-center gap-1">
                <span className="text-[9px] sm:text-xs text-gray-500">Bedenler:</span>
                <div className="flex gap-0.5">
                  {product.variants
                    .filter(v => v.isAvailable && v.stockQuantity > 0)
                    .slice(0, 2)
                    .map((variant, index) => (
                      <span 
                        key={variant.id} 
                        className="text-[9px] sm:text-xs bg-gray-100 text-gray-700 px-1 py-0.5 rounded"
                      >
                        {variant.sizeDisplay || variant.size}
                      </span>
                    ))
                  }
                  {availableSizesCount > 2 && (
                    <span className="text-[9px] sm:text-xs text-gray-500">
                      +{availableSizesCount - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Price Section - Kompakt */}
          <div className="mt-auto">
            <div className="mb-1">
              {product.discountPrice ? (
                <div className="flex items-center gap-1">
                  <span className="text-sm sm:text-base font-bold text-red-600">
                    ₺{product.discountPrice.toFixed(2)}
                  </span>
                  <span className="text-xs text-gray-400 line-through">
                    ₺{product.price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base font-bold text-gray-800">
                  ₺{product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* Minimal Sepete Ekle Butonu */}
            {totalStock > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full bg-orange-400 text-white py-1 px-2 rounded text-xs hover:bg-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sepete Ekle
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 py-1 px-2 rounded text-xs cursor-not-allowed"
              >
                Stokta Yok
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;