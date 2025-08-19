import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import { removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';

const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiX = Icons.FiX as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiTag = Icons.FiTag as any;
const FiPercent = Icons.FiPercent as any;

const Wishlist: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items } = useSelector((state: RootState) => state.wishlist);

  const handleRemoveFromWishlist = (productId: number) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleAddToCart = (productId: number) => {
    dispatch(addToCart({ productId, quantity: 1 }));
    dispatch(removeFromWishlist(productId));
  };

  const handleAddAllToCart = () => {
    items.forEach(product => {
      dispatch(addToCart({ productId: product.id, quantity: 1 }));
    });
    dispatch(clearWishlist());
  };

  const handleClearWishlist = () => {
    if (window.confirm('Tüm favorileri kaldırmak istediğinizden emin misiniz?')) {
      dispatch(clearWishlist());
    }
  };

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://scarwey.onrender.com${imageUrl}`;
  };

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Favorilerim</h1>
              <p className="text-sm text-gray-500">Beğendiğiniz ürünler burada görünür</p>
            </div>

            {/* Empty State */}
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHeart className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Favorileriniz Boş</h3>
              <p className="text-gray-600 mb-6 text-sm">
                Henüz favori ürün eklemediniz. Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilere ekleyin!
              </p>
              <Link
                to="/products"
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Ürünleri Keşfet
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Header - Compact */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Favorilerim</h1>
              <p className="text-sm text-gray-500">{items.length} ürün</p>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="flex gap-2">
            <button
              onClick={handleAddAllToCart}
              className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
            >
              <FiShoppingCart size={16} />
              Tümünü Sepete Ekle
            </button>
            <button
              onClick={handleClearWishlist}
              className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
              title="Tümünü Kaldır"
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        </div>

        {/* Products List - Mobile Optimized */}
        <div className="space-y-2">
          {items.map((product) => {
            const mainImage = product.images?.find(img => img.isMainImage) || product.images?.[0];
            const hasDiscount = product.discountPrice && product.discountPrice < product.price;
            const finalPrice = hasDiscount ? product.discountPrice : product.price;
            const discountPercentage = hasDiscount 
              ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
              : 0;

            return (
              <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 transition-all hover:shadow-md">
                <div className="flex gap-3">
                  {/* Product Image - Clickable */}
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-shrink-0 group"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-200">
                      <img
                        src={getImageUrl(mainImage?.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                        }}
                      />
                    </div>
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="font-semibold text-gray-900 hover:text-orange-600 transition-colors text-sm line-clamp-2 pr-2"
                      >
                        {product.name}
                      </Link>
                      <button
                        onClick={() => handleRemoveFromWishlist(product.id)}
                        className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
                        title="Favorilerden Kaldır"
                      >
                        <FiX size={14} />
                      </button>
                    </div>

                    {/* Brand ve Category */}
                    <div className="flex items-center gap-1 mb-2">
                      {product.brand && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {product.brand}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-xs text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                          <FiTag size={8} className="inline mr-1" />
                          {product.category.name}
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                          <FiPercent size={8} className="inline mr-1" />
                          %{discountPercentage}
                        </span>
                      )}
                    </div>

                    {/* Price ve Action */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-sm">
                            ₺{finalPrice?.toFixed(2)}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">
                              ₺{product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {product.stockQuantity && product.stockQuantity <= 5 && (
                          <p className="text-xs text-orange-600 mt-0.5">
                            Son {product.stockQuantity} adet!
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="bg-orange-400 text-white px-3 py-1.5 rounded-lg hover:bg-orange-500 transition-colors flex items-center gap-1 font-medium text-xs"
                      >
                        <FiShoppingBag size={12} />
                        Sepete Ekle
                      </button>
                    </div>

                    {/* Product Description - Truncated */}
                    {product.description && (
                      <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;