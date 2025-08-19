import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import api from '../services/api';
import { Address, CreateOrderRequest } from '../types';
import { clearCart } from '../store/slices/cartSlice';

const FiCreditCard = Icons.FiCreditCard as any;
const FiMapPin = Icons.FiMapPin as any;
const FiCheck = Icons.FiCheck as any;
const FiChevronRight = Icons.FiChevronRight as any;


interface CheckoutForm {
  // Address fields
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  saveAddress: boolean;
  addressTitle?: string;

  // Payment - Sadece kapıda ödeme
  paymentMethod: 'cash_on_delivery';
}

// ProductCard'tan import et ya da direkt fonksiyonu ekle:
const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/80x80?text=No+Image';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `https://scarwey.onrender.com${imageUrl}`;
};

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { cart } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutForm>({
    defaultValues: {
      country: 'Türkiye',
      paymentMethod: 'cash_on_delivery', // Varsayılan olarak kapıda ödeme
    }
  });

  const paymentMethod = watch('paymentMethod');
  const saveAddress = watch('saveAddress');

  // Redirect if no cart or not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    }
    if (!cart || cart.cartItems.length === 0) {
      navigate('/cart');
    }
  }, [user, cart, navigate]);

  // Fetch saved addresses
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
    }
  }, [user]);

  const fetchSavedAddresses = async () => {
    try {
      const response = await api.get<Address[]>('/user/addresses');
      setSavedAddresses(response.data);
      // Select default address if exists
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsProcessing(true);
    try {
      let addressId = selectedAddressId;

      // Create new address if needed
      if (useNewAddress || !addressId) {
        const addressData = {
          title: data.addressTitle || 'Ev',
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
          isDefault: savedAddresses.length === 0,
        };

        if (data.saveAddress && user) {
          const response = await api.post<Address>('/user/addresses', addressData);
          addressId = response.data.id;
        }
      }

      // Create order
      const orderData: CreateOrderRequest = {
        addressId: addressId!,
        paymentMethod: 'cash_on_delivery', // Her zaman kapıda ödeme
      };

      const response = await api.post('/orders', orderData);

      // Clear cart
      dispatch(clearCart());

      // Redirect to success page
      navigate(`/order-success/${response.data.orderNumber}`);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart) return null;

  // İYİLEŞTİRİLMİŞ: Arkadaşınızın fiyat hesaplama mantığı - KDV zaten fiyatlara dahil
  const subtotal = cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 1500 ? 0 : 25; // 1500 TL üzeri ücretsiz kargo (arkadaşınızın güncellemesi)
  const total = subtotal + shipping;          // Sadece subtotal + kargo (KDV zaten dahil)

  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {step > 1 ? <FiCheck /> : '1'}
            </div>
            <span className={`ml-2 ${step >= 1 ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
              Teslimat
            </span>
          </div>

          <div className="w-20 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-purple-600 transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              {step > 2 ? <FiCheck /> : '2'}
            </div>
            <span className={`ml-2 ${step >= 2 ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
              Ödeme
            </span>
          </div>

          <div className="w-20 h-1 bg-gray-200 mx-4">
            <div className={`h-full bg-purple-600 transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              3
            </div>
            <span className={`ml-2 ${step >= 3 ? 'text-purple-600 font-medium' : 'text-gray-600'}`}>
              Onay
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Step 1: Address */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <FiMapPin className="mr-2 text-purple-600" />
                    Teslimat Adresi
                  </h2>

                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold mb-3">Kayıtlı Adreslerim</h3>
                      <div className="space-y-3">
                        {savedAddresses.map((address) => (
                          <label key={address.id} className="block cursor-pointer">
                            <input
                              type="radio"
                              name="savedAddress"
                              value={address.id}
                              checked={selectedAddressId === address.id && !useNewAddress}
                              onChange={() => {
                                setSelectedAddressId(address.id);
                                setUseNewAddress(false);
                              }}
                              className="sr-only"
                            />
                            <div className={`border rounded-lg p-4 transition ${selectedAddressId === address.id && !useNewAddress
                              ? 'border-purple-600 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                              }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-semibold">{address.title}</p>
                                  <p className="text-sm text-gray-600">
                                    {address.firstName} {address.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.addressLine1}
                                    {address.addressLine2 && `, ${address.addressLine2}`}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {address.city}, {address.postalCode}
                                  </p>
                                  <p className="text-sm text-gray-600">{address.phone}</p>
                                </div>
                                {address.isDefault && (
                                  <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                                    Varsayılan
                                  </span>
                                )}
                              </div>
                            </div>
                          </label>
                        ))}

                        <button
                          type="button"
                          onClick={() => setUseNewAddress(true)}
                          className="w-full border-2 border-dashed border-purple-300 rounded-lg p-4 text-purple-600 hover:border-purple-400 hover:bg-purple-50 transition"
                        >
                          + Yeni Adres Ekle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* New Address Form */}
{(useNewAddress || savedAddresses.length === 0) && (
  <div className="space-y-4">
    {/* ✅ ADRES BAŞLIĞI - HER ZAMAN GÖSTER */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Adres Başlığı *
      </label>
      <input
        {...register('addressTitle', { 
          required: 'Adres başlığı zorunludur',
          value: 'Ev' // Varsayılan değer
        })}
        placeholder="Adres başlığı (örn: Ev, İş, Ofis)"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      {errors.addressTitle && (
        <p className="text-red-500 text-sm mt-1">{errors.addressTitle.message}</p>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ad *
        </label>
                          <input
                            {...register('firstName', { required: 'Ad zorunludur' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Soyad *
                          </label>
                          <input
                            {...register('lastName', { required: 'Soyad zorunludur' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon *
                        </label>
                        <input
                          {...register('phone', {
                            required: 'Telefon zorunludur',
                            pattern: {
                              value: /^[0-9]{10,11}$/,
                              message: 'Geçerli bir telefon numarası giriniz'
                            }
                          })}
                          placeholder="5XXXXXXXXX"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adres *
                        </label>
                        <input
                          {...register('addressLine1', { required: 'Adres zorunludur' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        {errors.addressLine1 && (
                          <p className="text-red-500 text-sm mt-1">{errors.addressLine1.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adres 2 (İsteğe bağlı)
                        </label>
                        <input
                          {...register('addressLine2')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            İl *
                          </label>
                          <input
                            {...register('city', { required: 'İl zorunludur' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.city && (
                            <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            İlçe
                          </label>
                          <input
                            {...register('state')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Posta Kodu *
                          </label>
                          <input
                            {...register('postalCode', { required: 'Posta kodu zorunludur' })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          {errors.postalCode && (
                            <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
                          )}
                        </div>
                      </div>

                       {/* Kaydet checkbox'ı en sona */}
    {user && (
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('saveAddress')}
            className="mr-2 text-purple-600 focus:ring-purple-500"
          />
          <span className="text-sm">Bu adresi kaydet</span>
        </label>
      </div>
    )}
  </div>
)}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 flex items-center"
                    >
                      Ödeme Adımına Geç
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Payment - Sadece Kapıda Ödeme */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                  
                    Ödeme Bilgileri
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Ödeme Yöntemi
                      </label>

                      {/* Sadece Kapıda Ödeme Seçeneği */}
                      <div className="space-y-2">
                        <label className="flex items-center p-4 border-2 border-purple-600 bg-purple-50 rounded-lg cursor-pointer">
                          <input
                            type="radio"
                            {...register('paymentMethod')}
                            value="cash_on_delivery"
                            checked={true}
                            readOnly
                            className="mr-3 text-purple-600"
                          />
                          <div className="flex items-center">
                            <div>
                              <p className="font-medium text-purple-800">Kapıda Ödeme</p>
                              <p className="text-sm text-purple-600">Ürününüz teslim edilirken nakit olarak ödeyebilirsiniz</p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Kapıda Ödeme Bilgi Notu */}
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <FiCheck className="text-blue-600 mr-3 mt-0.5" size={20} />
                          <div>
                            <h4 className="font-medium text-blue-800 mb-2">Kapıda Ödeme ile İlgili Bilgiler:</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Siparişiniz hazırlandıktan sonra kargoya verilecektir</li>
                              <li>• Ürün teslim edilirken nakit olarak ödeme yapacaksınız</li>
                              <li>• Kargo görevlisi size fatura ve makbuz verecektir</li>
                              <li>• Para üstü için hazırlıklı olmanızı öneririz</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      ← Geri
                    </button>
                    <button
                      type="submit"
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 flex items-center"
                    >
                      Siparişi Onayla
                      <FiChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold mb-6">Sipariş Özeti</h2>

                  {/* Delivery Address */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Teslimat Adresi</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                    
{selectedAddress && !useNewAddress ? (
  <>
    <p className="font-medium">{selectedAddress.title}</p>
    <p>{selectedAddress.firstName} {selectedAddress.lastName}</p>
    <p>{selectedAddress.addressLine1}</p>
    {selectedAddress.addressLine2 && <p>{selectedAddress.addressLine2}</p>}
    <p>{selectedAddress.city}, {selectedAddress.postalCode}</p>
    <p>{selectedAddress.phone}</p>
  </>
) : (
  <>
    <p className="font-medium">{watch('addressTitle') || 'Yeni Adres'}</p>
    <p>{watch('firstName')} {watch('lastName')}</p>
    <p>{watch('addressLine1')}</p>
    {watch('addressLine2') && <p>{watch('addressLine2')}</p>}
    <p>{watch('city')}, {watch('postalCode')}</p>
    <p>{watch('phone')}</p>
  </>
)}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Ödeme Yöntemi</h3>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                      
                        <p className="font-medium">Kapıda Ödeme</p>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Ürün teslim edilirken nakit olarak ödeme yapacaksınız
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-purple-600 hover:text-purple-700 font-medium"
                    >
                      ← Geri
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transform hover:scale-105 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isProcessing ? 'İşleniyor...' : 'Siparişi Tamamla'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary Sidebar - İYİLEŞTİRİLMİŞ */}
            {/* Order Summary Sidebar - İYİLEŞTİRİLMİŞ + BEDEN BİLGİSİ */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-lg font-bold mb-4">Sipariş Özeti</h3>

                {/* Cart Items */}
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {cart.cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.product?.images && item.product.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.product.images[0]?.imageUrl)}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <FiCreditCard />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.product?.name}</p>

                        {/* 🆕 BEDEN BİLGİSİ EKLENDİ */}
                        {/* 🆕 BEDEN BİLGİSİ EKLENDİ - DÜZELTİLMİŞ */}
                        {item.productVariant && (
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                               Beden: {item.productVariant.sizeDisplay || item.productVariant.size}
                            </span>
                            {/* Fiyat farkı varsa göster */}
                            {item.productVariant.priceModifier != null && item.productVariant.priceModifier !== 0 && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${item.productVariant.priceModifier > 0
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                                }`}>
                                {item.productVariant.priceModifier > 0 ? '+' : ''}₺{item.productVariant.priceModifier.toFixed(2)}
                              </span>
                            )}
                          </div>
                        )}

                        {/* 🆕 FALLBACK - Eğer productVariant yoksa ama selectedSize varsa */}
                        {!item.productVariant && item.selectedSize && (
                          <div className="mb-1">
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                              📏 Beden: {item.selectedSize}
                            </span>
                          </div>
                        )}

                        <p className="text-sm text-gray-600">
                          {item.quantity} adet x ₺{item.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* İYİLEŞTİRİLMİŞ: Arkadaşınızın fiyat hesaplama sistemi */}
                <div className="space-y-2 py-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Ara Toplam ({cart.cartItems.length} ürün)</span>
                    <span>₺{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Kargo</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Ücretsiz!</span>
                      ) : (
                        `₺${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  {/* İYİLEŞTİRİLMİŞ: Ücretsiz kargo için bilgilendirme */}
                  {subtotal < 1500 && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <strong>₺{(1500 - subtotal).toFixed(2)}</strong> daha alışveriş yapın, kargo ücretsiz olsun!
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span className="text-purple-600">₺{total.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 text-center">
                     Kapıda ödeme ile güvenli alışveriş
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-center">
                    KDV dahil fiyatlardır
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;