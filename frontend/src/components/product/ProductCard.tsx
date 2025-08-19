import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { Product } from '../../types';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist } from '../../store/slices/wishlistSlice';
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
    
    // 🆕 Eğer ürünün bedenleri varsa ProductDetail sayfasına yönlendir
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

  // 🆕 Stok durumu hesapla
  const getTotalStock = () => {
    if (product.hasSizes && product.variants) {
      return product.variants
        .filter(v => v.isAvailable)
        .reduce((total, variant) => total + variant.stockQuantity, 0);
    }
    return product.stockQuantity;
  };

  // 🆕 Mevcut beden sayısı
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
      <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
        <div className="relative overflow-hidden aspect-square">
          {/* Product Image */}
          <img
            src={getImageUrl(mainImage?.imageUrl)}
            alt={mainImage?.altText || product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              console.log('⌐ ProductCard image error:', mainImage?.imageUrl);
              (e.target as HTMLImageElement).src = 'https://placehold.co/300x300?text=No+Image';
            }}
          />
          
          {/* Overlay for hover effects */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
          
          {/* Badges Container - Yazılar geri eklendi */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                %{discountPercentage} İNDİRİM
              </span>
            )}
            
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                ÖNE ÇIKAN
              </span>
            )}
            
            {totalStock < 10 && totalStock > 0 && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                SON {totalStock} ADET
              </span>
            )}
          </div>
          
          {/* 📱 MOBİL ACTION BUTTONS - Sadece desktop'ta görünür */}
          <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleToggleWishlist}
              className={`p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 ${
                isInWishlist 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
              }`}
              title={isInWishlist ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            >
              <FiHeart size={14} className={isInWishlist ? 'fill-current' : ''} />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/products/${product.id}`;
              }}
              className="p-1.5 sm:p-2 rounded-full shadow-lg bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white transition-all duration-300 transform hover:scale-110"
              title="Detaya Git"
            >
              <FiEye size={14} />
            </button>
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
        
        {/* 📱 MOBİL OPTİMİZE CONTENT AREA */}
        <div className="p-2 sm:p-3 flex-1 flex flex-col">
          {/* Brand - Sadece desktop'ta göster */}
          {product.brand && (
            <p className="hidden sm:block text-xs text-orange-600 uppercase tracking-wide mb-1 font-semibold">
              {product.brand}
            </p>
          )}
          
          {/* 📱 Product Name - Mobilde tek satır */}
         <h3 className="font-medium text-xs sm:text-sm mb-1 text-gray-800 group-hover:text-orange-600 transition-colors flex-1 break-words overflow-hidden"
    style={{ 
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      maxHeight: '2.5rem',
      lineHeight: '1.25rem'
    }}>
  {product.name}
</h3>

          {/* 📱 Size Info - Mobilde daha kompakt */}
          {product.hasSizes && product.variants && product.variants.length > 0 && (
            <div className="mb-1 sm:mb-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="text-[10px] sm:text-xs text-gray-500">Bedenler:</span>
                <div className="flex gap-0.5 sm:gap-1">
                  {product.variants
                    .filter(v => v.isAvailable && v.stockQuantity > 0)
                    .slice(0, 2) // Mobilde sadece 2 beden göster
                    .map((variant, index) => (
                      <span 
                        key={variant.id} 
                        className="text-[10px] sm:text-xs bg-gray-100 text-gray-700 px-1 py-0.5 sm:px-2 sm:py-1 rounded"
                      >
                        {variant.sizeDisplay || variant.size}
                      </span>
                    ))
                  }
                  {availableSizesCount > 2 && (
                    <span className="text-[10px] sm:text-xs text-gray-500">
                      +{availableSizesCount - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 📱 PRICE SECTION - Mobilde kompakt */}
          <div className="mt-auto">
            <div className="mb-1 sm:mb-2">
              {product.discountPrice ? (
                <div className="space-y-0.5 sm:space-y-1">
                  <div className="flex items-center gap-1 sm:gap-2">
                   <span className="text-sm sm:text-base font-bold text-red-600">
  ₺{product.discountPrice.toFixed(2)}
</span>
                  <span className="text-sm sm:text-base font-bold text-gray-800">
  ₺{product.price.toFixed(2)}
</span>
                  </div>
                  {/* Tasarruf bilgisi sadece desktop'ta */}
                  <p className="hidden sm:block text-xs text-green-600 font-medium">
                    ₺{(product.price - product.discountPrice).toFixed(2)} tasarruf!
                  </p>
                </div>
              ) : (
                <span className="text-sm sm:text-xl font-bold text-gray-800">
                  ₺{product.price.toFixed(2)}
                </span>
              )}
            </div>
            
            {/* 📱 MOBİL OPTİMİZE ACTION BUTTON - Turuncu Renklerde */}
            {totalStock > 0 ? (
              <button
                onClick={handleAddToCart}
                disabled={cartLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-xs sm:text-sm font-medium transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 sm:gap-2"
              >
                <FiShoppingCart size={12} className="sm:size-4" />
                <span className="hidden sm:inline">Sepete Ekle</span>
                <span className="sm:hidden">Sepet</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg cursor-not-allowed text-xs sm:text-sm font-medium"
              >
                Stokta Yok
              </button>
            )}
          </div>
          
          {/* 📱 Stock & Shipping Info - Sadece desktop'ta */}
          <div className="hidden sm:block mt-3 space-y-1">
            {totalStock > 0 && totalStock < 10 && (
              <p className="text-xs text-orange-600 font-medium">
                ⚡ Son {totalStock} ürün - Hemen sipariş ver!
              </p>
            )}
            
            <p className="text-xs text-gray-500">
              🚚 Ücretsiz kargo (₺1500 üzeri)
            </p>
          </div>

        
          {/* 📱 MOBİL WISHLIST BUTTON - HER ZAMAN GÖRÜNÜR */}
{/* 📱 MOBİL WISHLIST BUTTON - HER ZAMAN GÖRÜNÜR */}
<button
  onClick={handleToggleWishlist}
  className={`absolute top-2 right-2 p-1.5 rounded-full shadow-lg transition-all duration-300 z-20 ${
    isInWishlist 
      ? 'bg-red-500 text-white' 
      : 'bg-white/90 backdrop-blur-sm text-gray-700'
  }`}
>
  <FiHeart size={12} className={isInWishlist ? 'fill-current' : ''} />
</button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;