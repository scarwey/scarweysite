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
const FiChevronLeft = Icons.FiChevronLeft as any;
const FiUser = Icons.FiUser as any;
const FiPhone = Icons.FiPhone as any;
const FiHome = Icons.FiHome as any;
const FiShield = Icons.FiShield as any;

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

const getImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return 'https://placehold.co/60x60?text=No+Image';
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

  const { register, handleSubmit, formState: { errors }, watch, setValue, getValues } = useForm<CheckoutForm>({
    defaultValues: {
      country: 'Türkiye',
      paymentMethod: 'cash_on_delivery',
      addressTitle: 'Ev'
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
      const defaultAddress = response.data.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  const validateAddressData = (data: CheckoutForm): boolean => {
    if (useNewAddress || !selectedAddressId) {
      const requiredFields = ['firstName', 'lastName', 'phone', 'addressLine1', 'city', 'postalCode', 'addressTitle'];
      for (const field of requiredFields) {
        if (!data[field as keyof CheckoutForm] || String(data[field as keyof CheckoutForm]).trim() === '') {
          alert(`${field} alanı zorunludur!`);
          return false;
        }
      }
      
      if (!data.saveAddress) {
        alert('Yeni adres girdiğinizde "Bu adresi kaydet" seçeneğini işaretlemeniz zorunludur!');
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (data: CheckoutForm) => {
    if (step < 3) {
      if (step === 1) {
        if (!validateAddressData(data)) {
          return;
        }
        if (!selectedAddressId && !useNewAddress) {
          alert('Lütfen bir adres seçin veya yeni adres ekleyin!');
          return;
        }
      }
      setStep(step + 1);
      return;
    }

    setIsProcessing(true);
    try {
      let addressId = selectedAddressId;
      let finalAddressData = null;

      if (useNewAddress || !selectedAddressId) {
        if (!validateAddressData(data)) {
          setIsProcessing(false);
          return;
        }

        const addressData = {
          title: data.addressTitle?.trim() || 'Ev',
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          phone: data.phone.trim(),
          addressLine1: data.addressLine1.trim(),
          addressLine2: data.addressLine2?.trim() || '',
          city: data.city.trim(),
          state: data.state?.trim() || '',
          postalCode: data.postalCode.trim(),
          country: data.country || 'Türkiye',
          isDefault: savedAddresses.length === 0,
        };

        finalAddressData = addressData;

        if (data.saveAddress && user) {
          try {
            const response = await api.post<Address>('/user/addresses', addressData);
            addressId = response.data.id;
            console.log('Adres kaydedildi:', response.data);
          } catch (error) {
            console.error('Adres kaydetme hatası:', error);
            alert('Adres kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
            setIsProcessing(false);
            return;
          }
        } else {
          alert('Adres kaydetme zorunludur!');
          setIsProcessing(false);
          return;
        }
      }

      const orderData: CreateOrderRequest = {
        addressId: addressId!,
        paymentMethod: 'cash_on_delivery'
      };

      console.log('Sipariş verisi:', orderData);

      const response = await api.post('/orders', orderData);

      dispatch(clearCart());
      navigate(`/order-success/${response.data.orderNumber}`);
    } catch (error: any) {
      console.error('Checkout failed:', error);
      const errorMessage = error?.response?.data?.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.';
      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!cart) return null;

  // Fiyat hesaplama
  const subtotal = cart.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 1500 ? 0 : 25;
  const total = subtotal + shipping;

  const selectedAddress = savedAddresses.find(addr => addr.id === selectedAddressId);

  const stepTitles = ['Teslimat', 'Ödeme', 'Onay'];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        {/* Header - Kompakt */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Sipariş Ver
          </h1>
          
          {/* Progress Steps - Mobil Optimized */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step > index + 1 ? 'bg-green-500 text-white' :
                      step === index + 1 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {step > index + 1 ? <FiCheck size={16} /> : index + 1}
                    </div>
                    <span className={`text-xs mt-1 ${
                      step === index + 1 ? 'text-purple-600 font-medium' : 'text-gray-500'
                    }`}>
                      {title}
                    </span>
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 sm:mx-4 ${
                      step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FiMapPin className="mr-2 text-purple-600" size={20} />
                  Teslimat Adresi
                </h2>

                {/* Saved Addresses - Kompakt Tasarım */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3 text-sm text-gray-700">Kayıtlı Adreslerim</h3>
                    <div className="space-y-2">
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
                          <div className={`border rounded-lg p-3 transition text-sm ${
                            selectedAddressId === address.id && !useNewAddress
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FiHome className="text-purple-600" size={14} />
                                  <span className="font-medium text-gray-900">{address.title}</span>
                                  {address.isDefault && (
                                    <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                      Varsayılan
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-700 font-medium">
                                  {address.firstName} {address.lastName}
                                </p>
                                <p className="text-gray-600 truncate">
                                  {address.addressLine1}
                                  {address.addressLine2 && `, ${address.addressLine2}`}
                                </p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-gray-600">{address.city}, {address.postalCode}</span>
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <FiPhone size={10} className="mr-1" />
                                    {address.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setUseNewAddress(true);
                          setSelectedAddressId(null);
                        }}
                        className={`w-full border-2 border-dashed rounded-lg p-3 transition text-sm ${
                          useNewAddress 
                            ? 'border-purple-400 bg-purple-50 text-purple-700' 
                            : 'border-purple-300 text-purple-600 hover:border-purple-400 hover:bg-purple-50'
                        }`}
                      >
                        + Yeni Adres Ekle
                      </button>
                    </div>
                  </div>
                )}

                {/* New Address Form - Kompakt */}
                {(useNewAddress || savedAddresses.length === 0) && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiHome className="inline mr-1" size={14} />
                        Adres Başlığı *
                      </label>
                      <input
                        {...register('addressTitle', { required: 'Adres başlığı zorunludur' })}
                        placeholder="Ev, İş, Ofis"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      {errors.addressTitle && (
                        <p className="text-red-500 text-xs mt-1">{errors.addressTitle.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <FiUser className="inline mr-1" size={14} />
                          Ad *
                        </label>
                        <input
                          {...register('firstName', { required: 'Ad zorunludur' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="Ad"
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Soyad *
                        </label>
                        <input
                          {...register('lastName', { required: 'Soyad zorunludur' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="Soyad"
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <FiPhone className="inline mr-1" size={14} />
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres *
                      </label>
                      <input
                        {...register('addressLine1', { required: 'Adres zorunludur' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Mahalle, sokak, bina no"
                      />
                      {errors.addressLine1 && (
                        <p className="text-red-500 text-xs mt-1">{errors.addressLine1.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adres 2 (İsteğe bağlı)
                      </label>
                      <input
                        {...register('addressLine2')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Daire, kat, apartman"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İl *</label>
                        <input
                          {...register('city', { required: 'İl zorunludur' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="İl"
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İlçe</label>
                        <input
                          {...register('state')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="İlçe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu *</label>
                        <input
                          {...register('postalCode', { required: 'Posta kodu zorunludur' })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="34000"
                        />
                        {errors.postalCode && (
                          <p className="text-red-500 text-xs mt-1">{errors.postalCode.message}</p>
                        )}
                      </div>
                    </div>

                    {/* Kaydet checkbox'ı - Kompakt */}
                    {user && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <label className="flex items-start">
                          <input
                            type="checkbox"
                            {...register('saveAddress', {
                              required: 'Yeni adres girdiğinizde bu adresi kaydetmeniz zorunludur'
                            })}
                            className="mr-2 mt-0.5 text-purple-600 focus:ring-purple-500"
                          />
                          <div>
                            <span className="text-sm font-medium text-yellow-800">
                              Bu adresi kaydet <span className="text-red-500">*</span>
                            </span>
                            <p className="text-xs text-yellow-700 mt-1">
                              Güvenlik nedeniyle yeni adresler kaydedilmek zorundadır.
                            </p>
                          </div>
                        </label>
                        {errors.saveAddress && (
                          <p className="text-red-500 text-xs mt-1">{errors.saveAddress.message}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center text-sm"
                  >
                    Devam Et
                    <FiChevronRight className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FiCreditCard className="mr-2 text-purple-600" size={20} />
                  Ödeme Bilgileri
                </h2>

                <div className="space-y-4">
                  <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value="cash_on_delivery"
                        checked={true}
                        readOnly
                        className="mr-3 text-purple-600"
                      />
                      <div>
                        <p className="font-medium text-purple-800">💵 Kapıda Ödeme</p>
                        <p className="text-sm text-purple-600">Ürün teslim edilirken nakit ödeme</p>
                      </div>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <FiCheck className="text-blue-600 mr-3 mt-0.5" size={18} />
                      <div>
                        <h4 className="font-medium text-blue-800 mb-2 text-sm">Kapıda Ödeme Bilgileri:</h4>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Siparişiniz hazırlandıktan sonra kargoya verilir</li>
                          <li>• Ürün tesliminde nakit ödeme yapacaksınız</li>
                          <li>• Kargo görevlisi fatura ve makbuz verir</li>
                          <li>• Para üstü için hazırlıklı olmanızı öneririz</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm"
                  >
                    <FiChevronLeft className="mr-1" size={16} />
                    Geri
                  </button>
                  <button
                    type="submit"
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition flex items-center text-sm"
                  >
                    Siparişi Onayla
                    <FiChevronRight className="ml-2" size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FiCheck className="mr-2 text-green-600" size={20} />
                  Sipariş Özeti
                </h2>

                {/* Address Summary - Kompakt */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-sm text-gray-700">📍 Teslimat Adresi</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {selectedAddress && !useNewAddress ? (
                      <>
                        <p className="font-medium text-gray-900">{selectedAddress.title}</p>
                        <p className="text-gray-800">{selectedAddress.firstName} {selectedAddress.lastName}</p>
                        <p className="text-gray-600">{selectedAddress.addressLine1}</p>
                        {selectedAddress.addressLine2 && <p className="text-gray-600">{selectedAddress.addressLine2}</p>}
                        <p className="text-gray-600">{selectedAddress.city}, {selectedAddress.postalCode}</p>
                        <p className="text-gray-600 flex items-center">
                          <FiPhone size={12} className="mr-1" />
                          {selectedAddress.phone}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-gray-900">{watch('addressTitle') || 'Yeni Adres'}</p>
                        <p className="text-gray-800">{watch('firstName')} {watch('lastName')}</p>
                        <p className="text-gray-600">{watch('addressLine1')}</p>
                        {watch('addressLine2') && <p className="text-gray-600">{watch('addressLine2')}</p>}
                        <p className="text-gray-600">{watch('city')}, {watch('postalCode')}</p>
                        <p className="text-gray-600 flex items-center">
                          <FiPhone size={12} className="mr-1" />
                          {watch('phone')}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2 text-sm text-gray-700">💳 Ödeme Yöntemi</h3>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">💵 Kapıda Ödeme</span>
                    </div>
                    <p className="text-gray-600 mt-1">
                      Ürün tesliminde nakit ödeme yapacaksınız
                    </p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center text-sm"
                  >
                    <FiChevronLeft className="mr-1" size={16} />
                    Geri
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center text-sm"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <FiShield className="mr-2" size={16} />
                        Siparişi Tamamla
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Order Summary Card - Kompakt */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="font-semibold mb-3 text-gray-800">🛒 Sepet Özeti</h3>

              {/* Items - Liste Tarzı */}
              <div className="space-y-2 mb-4">
                {cart.cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.images && item.product.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.product.images[0]?.imageUrl)}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FiCreditCard size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                      
                      {/* Beden bilgisi */}
                      {item.productVariant && (
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                            Beden: {item.productVariant.sizeDisplay || item.productVariant.size}
                          </span>
                          {item.productVariant.priceModifier != null && item.productVariant.priceModifier !== 0 && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                              item.productVariant.priceModifier > 0
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {item.productVariant.priceModifier > 0 ? '+' : ''}₺{item.productVariant.priceModifier.toFixed(2)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Fallback - Eğer productVariant yoksa ama selectedSize varsa */}
                      {!item.productVariant && item.selectedSize && (
                        <div className="mb-1">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            📏 Beden: {item.selectedSize}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {item.quantity} adet
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          ₺{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiyat hesaplama - Kompakt */}
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam ({cart.cartItems.length} ürün)</span>
                  <span>₺{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kargo</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-semibold">Ücretsiz!</span>
                    ) : (
                      `₺${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>

                {/* Ücretsiz kargo için bilgilendirme */}
                {subtotal < 1500 && (
                  <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                    <strong>₺{(1500 - subtotal).toFixed(2)}</strong> daha alışveriş yapın, kargo ücretsiz olsun!
                  </div>
                )}

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Toplam</span>
                    <span className="text-purple-600">₺{total.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 text-center">
                    💵 Kapıda ödeme ile güvenli alışveriş
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