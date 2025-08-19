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
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiTruck = Icons.FiTruck as any;

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
      {/* Backdrop - Modern gradient overlay */}
      <div
        className="fixed inset-0 bg-gradient-to-r from-black/60 to-black/40 backdrop-blur-sm z-50 transition-all duration-300"
        onClick={handleClose}
      />

      {/* Drawer - Modern slide-in */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        <div className="flex flex-col h-full">
          {/* Header - Clean white design */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <FiShoppingBag className="text-purple-600" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Sepetim</h2>
                  <p className="text-gray-500 text-sm">
                    {cart?.cartItems?.length || 0} ürün
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 text-gray-600"
              >
                <FiX size={22} />
              </button>
            </div>
          </div>

          {/* Cart Items - Modern scroll area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {!cart || cart.cartItems?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <FiShoppingCart size={32} className="text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sepetiniz Boş</h3>
                <p className="text-gray-500 mb-6 text-sm">
                  Harika ürünlerimizi keşfedin ve sepetinizi doldurun!
                </p>
                <Link
                  to="/products"
                  onClick={handleClose}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Alışverişe Başla
                </Link>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {cart.cartItems.map((item) => {
                  const mainImage = item.product?.images?.find(img => img.isMainImage) || item.product?.images?.[0];
                  const stockQuantity = item.productVariant?.stockQuantity || item.product?.stockQuantity || 0;
                  
                  return (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all hover:shadow-md">
                      <div className="flex gap-4">
                        {/* Product Image - Modern rounded */}
                        <Link
                          to={`/products/${item.productId}`}
                          onClick={handleClose}
                          className="flex-shrink-0 group"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 group-hover:scale-105 transition-transform duration-200">
                            <img
                              src={getImageUrl(mainImage?.imageUrl)}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://placehold.co/80x80?text=No+Image';
                              }}
                            />
                          </div>
                        </Link>

                        {/* Product Details - Modern layout */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-2">
                            <Link
                              to={`/products/${item.productId}`}
                              onClick={handleClose}
                              className="font-semibold text-gray-900 hover:text-purple-600 transition-colors text-sm sm:text-base line-clamp-2 pr-2"
                            >
                              {item.product?.name}
                            </Link>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLoading}
                              className="text-gray-400 hover:text-red-500 p-1 hover:bg-red-50 rounded-full transition-all duration-200 flex-shrink-0"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>

                          {/* Brand ve Beden */}
                          <div className="flex items-center gap-2 mb-3">
                            {item.product?.brand && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                {item.product.brand}
                              </span>
                            )}
                            {item.productVariant && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                                Beden: {item.productVariant.sizeDisplay || item.productVariant.size}
                              </span>
                            )}
                          </div>

                          {/* Quantity ve Price - Modern controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={isLoading || item.quantity <= 1}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                disabled={isLoading || stockQuantity <= item.quantity}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-gray-900">
                                ₺{(item.price * item.quantity).toFixed(2)}
                              </div>
                              {item.quantity > 1 && (
                                <div className="text-xs text-gray-500">
                                  ₺{item.price.toFixed(2)} / adet
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stock Warning - Modern alert */}
                          {stockQuantity <= 5 && stockQuantity > 0 && (
                            <div className="mt-2 bg-orange-50 border border-orange-200 rounded-lg p-2">
                              <p className="text-xs text-orange-700 font-medium">
                                ⚠️ {item.productVariant ? 'Bu bedende' : 'Stokta'} sadece {stockQuantity} adet kaldı!
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer - Compact pricing section */}
          {cart && cart.cartItems?.length > 0 && (
            <div className="bg-white border-t border-gray-200">
              {/* Free shipping progress - Compact */}
              {shipping > 0 && (
                <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
                  <div className="flex items-center mb-1">
                    <FiTruck className="text-orange-600 mr-1" size={14} />
                    <span className="text-xs font-medium text-orange-800">
                      ₺{(1500 - subtotal).toFixed(2)} daha ekleyin, kargo ücretsiz!
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-1.5">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="p-3 space-y-2">
                {/* Price breakdown - Very Compact */}
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Ara Toplam</span>
                    <span>₺{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kargo</span>
                    <span className={shipping === 0 ? 'text-green-600 font-medium flex items-center' : 'text-gray-600'}>
                      {shipping === 0 ? (
                        <>
                          <FiTruck className="mr-1" size={10} />
                          Ücretsiz!
                        </>
                      ) : (
                        `₺${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Total - Very Compact */}
                <div className="flex justify-between items-center py-1 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Toplam</span>
                  <span className="font-bold text-lg text-purple-600">₺{total.toFixed(2)}</span>
                </div>

                {/* Action Buttons - Compact */}
                <div className="space-y-2 pt-1">
                  <Link
                    to="/checkout"
                    onClick={handleClose}
                    className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white text-center py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                  >
                    Sepeti Onayla
                  </Link>
                  <button
                    onClick={handleClose}
                    className="block w-full bg-gray-100 text-gray-700 text-center py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Alışverişe Devam Et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;