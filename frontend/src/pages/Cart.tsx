import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import { updateCartItem, removeFromCart } from '../store/slices/cartSlice';
import { addressApi } from '../services/api';

const FiTrash2 = Icons.FiTrash2 as any;
const FiMinus = Icons.FiMinus as any;
const FiPlus = Icons.FiPlus as any;
const FiShoppingBag = Icons.FiShoppingBag as any;
const FiArrowRight = Icons.FiArrowRight as any;
const FiShield = Icons.FiShield as any;
const FiTruck = Icons.FiTruck as any;
const FiClock = Icons.FiClock as any;
const FiMapPin = Icons.FiMapPin as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiChevronUp = Icons.FiChevronUp as any;

// AddressRequiredModal Component
interface AddressRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAddress: () => void;
}

const AddressRequiredModal: React.FC<AddressRequiredModalProps> = ({ isOpen, onClose, onAddAddress }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="text-center">
          <FiMapPin className="mx-auto text-orange-500 mb-4" size={48} />
          <h3 className="text-xl font-bold mb-2">Teslimat Adresi Gerekli</h3>
          <p className="text-gray-600 mb-6">
            Sipariş verebilmek için önce bir teslimat adresi eklemelisiniz.
            <br />
            <strong className="text-orange-600">Adresi kaydetmeyi unutmayın!</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition"
            >
              İptal
            </button>
            <button
              onClick={onAddAddress}
              className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition"
            >
              📍 Adres Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

console.log('🔥 CART.TSX LOADED!');

const Cart: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { cart, isLoading } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Toggle item details
  const toggleItemDetails = (itemId: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // localStorage tracking - Adres ekleme kontrolü
  useEffect(() => {
    const wasAddingAddress = localStorage.getItem('addingAddress');
    if (wasAddingAddress === 'true' && user) {
      localStorage.removeItem('addingAddress');
      console.log('🔍 User returned from address page, checking addresses...');
      
      setTimeout(async () => {
        try {
          const addresses = await addressApi.getAddresses();
          console.log('📍 Address recheck result:', addresses.length);
          
          if (addresses.length === 0) {
            alert('⚠️ Adres eklemeyi unuttuğunuz görünüyor. Sipariş için adres gereklidir!');
            setShowAddressModal(true);
          } else {
            console.log('✅ Address successfully added, user can proceed to checkout');
          }
        } catch (error) {
          console.error('Address recheck error:', error);
        }
      }, 1000);
    }
  }, [user]);

  // Sayfa odaklandığında fresh kontrol
  useEffect(() => {
    const handlePageFocus = async () => {
      const wasAddingAddress = localStorage.getItem('addingAddress');
      if (wasAddingAddress === 'true' && user && document.hasFocus()) {
        console.log('📱 Page focused while adding address, will check when component mounts');
      }
    };

    window.addEventListener('focus', handlePageFocus);
    return () => window.removeEventListener('focus', handlePageFocus);
  }, [user]);

  const handleQuantityChange = (cartItemId: number, quantity: number) => {
    if (quantity > 0) {
      dispatch(updateCartItem({ cartItemId, quantity }));
    }
  };

  const handleRemoveItem = (cartItemId: number) => {
    dispatch(removeFromCart(cartItemId));
  };

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    try {
      console.log('🔍 Checking addresses before checkout...');
      const addresses = await addressApi.getAddresses();
      console.log('📍 Fresh address check result:', addresses.length);
      
      if (addresses.length === 0) {
        console.log('❌ No addresses found, showing modal');
        setShowAddressModal(true);
        return;
      }
      
      console.log('✅ Addresses found, proceeding to checkout');
      navigate('/checkout');
    } catch (error) {
      console.error('Address check error:', error);
      navigate('/checkout');
    }
  };

  const handleAddAddress = () => {
    console.log('📍 User clicked Add Address - setting localStorage flag');
    setShowAddressModal(false);
    
    localStorage.setItem('addingAddress', 'true');
    localStorage.setItem('addingAddressTimestamp', Date.now().toString());
    
    navigate('/profile/addresses');
  };

  // Resim URL'ini düzgün formatla
  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `https://scarwey.onrender.com${imageUrl}`;
  };

  // Debug logs
  console.log('🚨 CART DEBUG:');
  console.log('Cart object:', cart);
  console.log('Cart exists:', !!cart);
  console.log('Cart ID:', cart?.id);
  console.log('CartItems array:', cart?.cartItems);
  console.log('CartItems length:', cart?.cartItems?.length);
  console.log('Is array?', Array.isArray(cart?.cartItems));

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
        <div className="container mx-auto px-4 py-8 sm:py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiShoppingBag className="w-10 h-10 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Sepetinizde henüz ürün bulunmuyor.
              Binlerce ürün arasından istediğinizi seçin!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
            >
              <FiShoppingBag className="mr-2" size={16} />
              Alışverişe Başla
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Fiyat hesaplama
  const subtotal = cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 1500 ? 0 : 25;
  const total = subtotal + shipping;

  console.log('🔢 CALCULATIONS:');
  console.log('Subtotal:', subtotal);
  console.log('Shipping check (subtotal >= 1500):', subtotal >= 1500);
  console.log('Shipping:', shipping);
  console.log('Total:', total);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header - Kompakt */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Sepetim ({cart.cartItems.length})
            </h1>
            <Link to="/products" className="text-orange-600 text-sm hover:underline">
              + Ürün Ekle
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {/* Cart Items - Liste Tarzı */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="divide-y divide-gray-100">
              {cart.cartItems.map((item) => (
                <div key={item.id} className="p-4">
                  {/* Ana Ürün Satırı */}
                  <div className="flex items-center gap-3">
                    {/* Küçük Ürün Resmi */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product?.images?.[0]?.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Ürün Bilgileri - Sıkışık Tasarım */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                          <h3 className="font-medium text-gray-900 text-sm truncate">
                            {item.product?.name || 'Ürün'}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Beden Küçük Tag */}
                            {item.productVariant && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {item.productVariant.sizeDisplay || item.productVariant.size}
                              </span>
                            )}
                            {!item.productVariant && item.selectedSize && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                {item.selectedSize}
                              </span>
                            )}
                            {/* Stok Uyarısı */}
                            {item.product?.stockQuantity && item.product.stockQuantity < 10 && (
                              <span className="text-xs text-orange-600">
                                Son {item.product.stockQuantity} adet
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Fiyat - Sağda */}
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            ₺{(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ₺{item.price.toFixed(2)} / adet
                          </div>
                        </div>
                      </div>

                      {/* Miktar Kontrolü ve Aksiyon Butonları */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                          {/* Miktar Seçici - Küçük */}
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              disabled={isLoading || item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <FiMinus size={12} />
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center text-sm font-medium border-x">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              disabled={isLoading || item.quantity >= (item.product?.stockQuantity || 10)}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                            >
                              <FiPlus size={12} />
                            </button>
                          </div>

                          {/* Detay Toggle - Opsiyonel */}
                          <button
                            onClick={() => toggleItemDetails(item.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                          >
                            Detay
                            {expandedItems.has(item.id) ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                          </button>
                        </div>

                        {/* Sil Butonu */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={isLoading}
                          className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Ürünü Sil"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>

                      {/* Genişletilmiş Detaylar */}
                      {expandedItems.has(item.id) && (
                        <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1">
                          {item.product?.brand && <p><strong>Marka:</strong> {item.product.brand}</p>}
                          {item.productVariant?.priceModifier != null && item.productVariant.priceModifier !== 0 && (
                            <p>
                              <strong>Beden Fiyat Farkı:</strong> 
                              <span className={item.productVariant.priceModifier > 0 ? 'text-orange-600' : 'text-green-600'}>
                                {item.productVariant.priceModifier > 0 ? ' +' : ' '}₺{item.productVariant.priceModifier.toFixed(2)}
                              </span>
                            </p>
                          )}
                          {item.product?.description && (
                            <p><strong>Açıklama:</strong> {item.product.description.substring(0, 100)}...</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Özet Kartı - Kompakt */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="space-y-3">
              {/* Ara Toplam */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ara Toplam</span>
                <span className="font-medium">₺{subtotal.toFixed(2)}</span>
              </div>

              {/* Kargo */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Kargo</span>
                <span className="font-medium">
                  {shipping === 0 ? (
                    <span className="text-green-600 font-semibold">Ücretsiz!</span>
                  ) : (
                    `₺${shipping.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* Ücretsiz Kargo İlerlemesi - Sadece Gerektiğinde */}
              {subtotal < 1500 && (
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-orange-800 font-medium">
                      Ücretsiz kargo için
                    </span>
                    <span className="text-xs text-orange-600 font-semibold">
                      ₺{(1500 - subtotal).toFixed(2)} kaldı
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Toplam */}
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Toplam</span>
                <span className="text-xl font-bold text-orange-600">₺{total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500 text-center">KDV dahil</div>

              {/* Checkout Butonu */}
              <button
                onClick={handleCheckout}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg"
              >
                {user ? (
                  <>
                    <FiShield className="mr-2" size={16} />
                    Sepeti Onayla
                  </>
                ) : (
                  <>
                    <FiArrowRight className="mr-2" size={16} />
                    Giriş Yap ve Devam Et
                  </>
                )}
              </button>

              {/* Alt Bilgiler - Mini */}
              <div className="flex justify-center gap-6 text-xs text-gray-500 pt-2">
                <div className="flex items-center gap-1">
                  <FiShield size={12} className="text-green-500" />
                  <span>Güvenli</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiTruck size={12} className="text-blue-500" />
                  <span>Hızlı Kargo</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={12} className="text-purple-500" />
                  <span>Kolay İade</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alışverişe Devam */}
          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center text-orange-600 hover:text-orange-700 font-medium text-sm"
            >
              <FiArrowRight className="mr-2 rotate-180" size={14} />
              Alışverişe Devam Et
            </Link>
          </div>
        </div>

        {/* Address Required Modal */}
        <AddressRequiredModal
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onAddAddress={handleAddAddress}
        />
      </div>
    </div>
  );
};

export default Cart;