import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';

const FiTrash2 = Icons.FiTrash2 as any;
const FiMinus = Icons.FiMinus as any;
const FiPlus = Icons.FiPlus as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiArrowRight = Icons.FiArrowRight as any;
const FiShield = Icons.FiShield as any;
const FiTruck = Icons.FiTruck as any;
const FiClock = Icons.FiClock as any;

// İYİLEŞTİRİLMİŞ: Debug logları arkadaşınızın kodundan korundu
console.log('🔥 CART.TSX LOADED!');

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const handleQuantityChange = (cartItemId: number, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ cartItemId, quantity }));
    }
  };

  const handleRemoveItem = (cartItemId: number) => {
    dispatch(removeFromCart(cartItemId));
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://scarwey.onrender.com${imageUrl}`;
  };

  // İYİLEŞTİRİLMİŞ: Arkadaşınızın debug log'ları korundu
 console.log('🚨 CART DEBUG:');
console.log('Cart object:', cart);
console.log('Cart exists:', !!cart);
console.log('Cart ID:', cart?.id);
console.log('CartItems array:', cart?.cartItems);
console.log('CartItems length:', cart?.cartItems?.length);
console.log('Is array?', Array.isArray(cart?.cartItems));

// 🆕 YENİ DEBUG - HER CART ITEM'I İNCELE
if (cart?.cartItems) {
  cart.cartItems.forEach((item, index) => {
    console.log(`🔍 CartItem [${index}]:`, {
      id: item.id,
      productId: item.productId,
      productVariantId: item.productVariantId,
      productVariant: item.productVariant,
      selectedSize: item.selectedSize,
      productName: item.product?.name,
      quantity: item.quantity,
      price: item.price
    });
  });
}

  // Empty cart view
  if (!cart || cart.cartItems.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
              <FiShoppingBag className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Sepetinizde henüz ürün bulunmuyor.<br />
              Binlerce ürün arasından istediğinizi seçin!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FiShoppingBag className="mr-2" size={20} />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // İYİLEŞTİRİLMİŞ: Arkadaşınızın fiyat hesaplama sistemi - KDV zaten dahil
  const subtotal = cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 1500 ? 0 : 25; // 1500 TL üzeri ücretsiz kargo (arkadaşın güncellemesi)
  const total = subtotal + shipping;          // KDV zaten dahil olduğu için ekstra eklenmez

  // İYİLEŞTİRİLMİŞ: Arkadaşınızın debug hesaplamaları korundu
  console.log('🔢 CALCULATIONS:');
  console.log('Subtotal:', subtotal);
  console.log('Shipping check (subtotal >= 1500):', subtotal >= 1500);
  console.log('Shipping:', shipping);
  console.log('Total:', total);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-gray-500 hover:text-orange-600 transition-colors">Ana Sayfa</Link></li>
            <li className="text-gray-300">/</li>
            <li className="text-gray-800 font-medium">Sepetim</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sepetim ({cart.cartItems.length} ürün)</h1>
          <div className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FiShield className="text-green-500" size={16} />
              <span>Güvenli Alışveriş</span>
            </div>
            <div className="flex items-center gap-2">
              <FiTruck className="text-blue-500" size={16} />
              <span>Hızlı Kargo</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="space-y-6">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row gap-6 pb-6 border-b last:border-b-0 last:pb-0">
                    {/* Product Image */}
                    <div className="w-full sm:w-40 h-40 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 relative group">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product?.images?.[0]?.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                   
<div className="flex-1">
  <div className="flex justify-between items-start mb-3">
    <div>
      <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
        {item.product?.name || 'Ürün'}
      </h3>
      {item.product?.brand && (
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Marka:</span> {item.product.brand}
        </p>
      )}
      
     {/* 🆕 BEDEN BİLGİSİ - DÜZELTİLMİŞ VERSİYON */}
{item.productVariant && (
  <div className="flex items-center gap-2 mb-2">
    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
      📏 Beden: {item.productVariant.sizeDisplay || item.productVariant.size}
    </span>
    {/* ❌ SORUN: Bu kısım 0 değerini de gösteriyor */}
    {item.productVariant.priceModifier != null && item.productVariant.priceModifier !== 0 && (
      <span className={`text-xs px-2 py-1 rounded-full ${
        item.productVariant.priceModifier > 0 
          ? 'bg-orange-100 text-orange-800' 
          : 'bg-green-100 text-green-800'
      }`}>
        {item.productVariant.priceModifier > 0 ? '+' : ''}₺{item.productVariant.priceModifier.toFixed(2)}
      </span>
    )}
  </div>
)}
      
      {/* 🆕 SELECTED SIZE (Eğer productVariant yoksa ama selectedSize varsa) */}
      {!item.productVariant && item.selectedSize && (
        <div className="mb-2">
          <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            📏 Beden: {item.selectedSize}
          </span>
        </div>
      )}
    </div>
    <button
      onClick={() => handleRemoveItem(item.id)}
      disabled={isLoading}
      className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
      title="Ürünü Sil"
    >
      <FiTrash2 className="w-5 h-5" />
    </button>
  </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 font-medium">Adet:</span>
                          <div className="flex items-center border border-gray-200 rounded-lg">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-10 h-10 rounded-l-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiMinus className="w-4 h-4 text-gray-600" />
                            </button>
                            <span className="w-12 h-10 flex items-center justify-center font-bold text-gray-800 bg-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= (item.product?.stockQuantity || 10)}
                              className="w-10 h-10 rounded-r-lg bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <FiPlus className="w-4 h-4 text-gray-600" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-2xl text-gray-800">
                            ₺{(item.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₺{item.price.toFixed(2)} / adet
                          </p>
                        </div>
                      </div>

                      {/* Stock Warning */}
                      {item.product?.stockQuantity && item.product.stockQuantity < 10 && (
                        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-700 font-medium flex items-center gap-2">
                            <FiClock size={14} />
                            Son {item.product.stockQuantity} adet! Hemen sipariş verin.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  to="/products"
                  className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium"
                >
                  <FiArrowRight className="mr-2 rotate-180" size={16} />
                  Alışverişe Devam Et
                </Link>
              </div>
            </div>
          </div>

          {/* Order Summary - İYİLEŞTİRİLMİŞ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiShoppingBag className="text-orange-500" size={20} />
                Sipariş Özeti
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam ({cart.cartItems.length} ürün)</span>
                  <span className="font-semibold">₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="flex items-center gap-2">
                    <FiTruck size={14} />
                    Kargo
                  </span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600 font-bold">Ücretsiz!</span>
                    ) : (
                      `₺${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* İYİLEŞTİRİLMİŞ: Arkadaşınızın ücretsiz kargo sistemi - 1500₺ limiti */}
                {subtotal < 1500 && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
                    <p className="text-sm text-orange-800 font-semibold mb-2">
                      <strong>₺{(1500 - subtotal).toFixed(2)}</strong> daha alışveriş yapın, kargo ücretsiz!
                    </p>
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-orange-600 mt-1">
                      %{Math.min(Math.round((subtotal / 1500) * 100), 100)} tamamlandı
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">Toplam Tutar</span>
                  <span className="text-3xl font-bold text-orange-600">₺{total.toFixed(2)}</span>
                </div>
                {/* İYİLEŞTİRİLMİŞ: KDV dahil notu eklendi */}
                <div className="mt-1 text-xs text-gray-500 text-center">
                  KDV dahil fiyatlardır
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {user ? (
                  <>
                    <FiShield className="mr-2" size={20} />
                    Güvenli Ödeme
                  </>
                ) : (
                  <>
                    <FiArrowRight className="mr-2" size={20} />
                    Giriş Yap ve Devam Et
                  </>
                )}
              </button>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                      <FiShield className="text-green-600" size={14} />
                    </div>
                    <p className="text-xs text-gray-600">Güvenli<br />Ödeme</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                      <FiTruck className="text-blue-600" size={14} />
                    </div>
                    <p className="text-xs text-gray-600">Hızlı<br />Kargo</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                      <FiClock className="text-purple-600" size={14} />
                    </div>
                    <p className="text-xs text-gray-600">Kolay<br />İade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;