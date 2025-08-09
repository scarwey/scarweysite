import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';
import { closeCart, updateCartItem, removeFromCart } from '../../store/slices/cartSlice';

const FiX = Icons.FiX as any;
const FiMinus = Icons.FiMinus as any;
const FiPlus = Icons.FiPlus as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiShoppingCart = Icons.FiShoppingCart as any;

const CartDrawer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cart, isCartOpen, isLoading } = useSelector((state: RootState) => state.cart);

  const handleClose = () => {
    dispatch(closeCart());
  };

  const handleUpdateQuantity = (cartItemId: number, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ cartItemId, quantity }));
    }
  };

  const handleRemoveItem = (cartItemId: number) => {
    dispatch(removeFromCart(cartItemId));
  };

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://scarwey.onrender.com${imageUrl}`;
  };

  const subtotal = cart?.cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
  const shipping = subtotal > 0 ? (subtotal >= 1500 ? 0 : 25) : 0;
  const total = subtotal + shipping;

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold flex items-center">
              <FiShoppingCart className="mr-2" />
              Sepetim ({cart?.cartItems?.length || 0} Ürün)
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <FiX size={24} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {!cart || cart.cartItems?.length === 0 ? (
              <div className="text-center py-12">
                <FiShoppingCart size={64} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">Sepetiniz boş</p>
                <Link
                  to="/products"
                  onClick={handleClose}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  Alışverişe başla
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.cartItems.map((item) => {
                  const mainImage = item.product?.images?.find(img => img.isMainImage) || item.product?.images?.[0];
                  
                  return (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex space-x-4">
                        {/* Product Image */}
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={handleClose}
                          className="flex-shrink-0"
                        >
                          <img
                            src={getImageUrl(mainImage?.imageUrl)}
                            alt={item.product?.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => {
                              console.log('❌ CartDrawer image error:', mainImage?.imageUrl);
                              (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                            }}
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1">
                          <Link
                            to={`/products/${item.productId}`}
                            onClick={handleClose}
                            className="font-medium text-gray-800 hover:text-purple-600 line-clamp-2"
                          >
                            {item.product?.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.product?.brand}
                          </p>

                          {/* 🆕 Size Display */}
                          {item.productVariant && (
                            <div className="mt-1">
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Beden: {item.productVariant.sizeDisplay || item.productVariant.size}
                              </span>
                            </div>
                          )}

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={isLoading || item.quantity <= 1}
                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiMinus size={16} />
                              </button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={isLoading || (item.productVariant?.stockQuantity || item.product?.stockQuantity || 0) <= item.quantity}
                                className="p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FiPlus size={16} />
                              </button>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="font-bold text-lg">
                                ₺{(item.price * item.quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isLoading}
                                className="text-red-500 hover:text-red-600 p-1"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>

                          {/* 🆕 Stock Warning - Variant aware */}
                          {(() => {
                            const stockQuantity = item.productVariant?.stockQuantity || item.product?.stockQuantity || 0;
                            if (stockQuantity <= 5 && stockQuantity > 0) {
                              return (
                                <p className="text-xs text-orange-600 mt-2">
                                  {item.productVariant ? 'Bu bedende' : 'Stokta'} {stockQuantity} adet kaldı!
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Unchanged */}
          {cart && cart.cartItems?.length > 0 && (
            <div className="border-t p-4 space-y-4">
              {/* Subtotal */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kargo</span>
                  <span className={shipping === 0 ? 'text-green-600 font-bold' : ''}>
                    {shipping === 0 ? 'Ücretsiz!' : `₺${shipping.toFixed(2)}`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-orange-800 font-medium">
                      <strong>₺{(1500 - subtotal).toFixed(2)}</strong> daha alışveriş yapın, kargo ücretsiz!
                    </p>
                    <div className="w-full bg-orange-200 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      %{Math.min(Math.round((subtotal / 1500) * 100), 100)} tamamlandı
                    </p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Toplam</span>
                <span className="text-purple-600">₺{total.toFixed(2)}</span>
              </div>

              <div className="text-xs text-gray-500 text-center">
                KDV dahil fiyatlardır
              </div>

              {/* Checkout Buttons */}
              <div className="space-y-2">
                <Link
                  to="/checkout"
                  onClick={handleClose}
                  className="block w-full bg-purple-600 text-white text-center py-3 rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Sepeti Onayla
                </Link>
                <button
                  onClick={handleClose}
                  className="block w-full bg-gray-200 text-gray-800 text-center py-3 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Alışverişe Devam Et
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;