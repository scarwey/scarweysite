import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../store';
import api from '../services/api';
import { Address } from '../types';

const FiUser = Icons.FiUser as any;
const FiMail = Icons.FiMail as any;
const FiPhone = Icons.FiPhone as any;
const FiLock = Icons.FiLock as any;
const FiMapPin = Icons.FiMapPin as any;
const FiEdit2 = Icons.FiEdit2 as any;
const FiTrash2 = Icons.FiTrash2 as any;
const FiPlus = Icons.FiPlus as any;
const FiCheck = Icons.FiCheck as any;
const FiX = Icons.FiX as any;
const FiHome = Icons.FiHome as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiEye = Icons.FiEye as any;
const FiEyeOff = Icons.FiEyeOff as any;

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AddressForm {
  title: string;
  firstName: string;
  lastName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'addresses'>('profile');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Form hooks
  const profileForm = useForm<ProfileForm>();
  const passwordForm = useForm<PasswordForm>();
  const addressForm = useForm<AddressForm>({
    defaultValues: {
      country: 'Türkiye',
      isDefault: false
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/profile');
      return;
    }
    
    profileForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber || ''
    });

    fetchAddresses();
  }, [user, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get<Address[]>('/user/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleProfileUpdate = async (data: ProfileForm) => {
    try {
      setLoading(true);
      await api.put('/user/profile', data);
      setMessage({ type: 'success', text: 'Profil bilgileriniz güncellendi.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Profil güncellenirken bir hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data: PasswordForm) => {
    try {
      setLoading(true);
      setMessage(null);
      
      const response = await api.put('/user/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
      passwordForm.reset();
      
    } catch (error: any) {
      let errorMessage = 'Şifre değiştirilemedi.';
      
      if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Mevcut şifreniz yanlış veya yeni şifre uygun değil.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (data: AddressForm) => {
    try {
      setLoading(true);
      if (editingAddressId) {
        await api.put(`/user/addresses/${editingAddressId}`, data);
        setMessage({ type: 'success', text: 'Adres güncellendi.' });
      } else {
        await api.post('/user/addresses', data);
        setMessage({ type: 'success', text: 'Adres eklendi.' });
      }
      addressForm.reset();
      setIsAddingAddress(false);
      setEditingAddressId(null);
      fetchAddresses();
    } catch (error) {
      setMessage({ type: 'error', text: 'Adres kaydedilemedi.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) return;
    
    try {
      await api.delete(`/user/addresses/${id}`);
      setMessage({ type: 'success', text: 'Adres silindi.' });
      fetchAddresses();
    } catch (error) {
      setMessage({ type: 'error', text: 'Adres silinemedi.' });
    }
  };

  const handleEditAddress = (address: Address) => {
    addressForm.reset({
      title: address.title,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setIsAddingAddress(true);
  };

  if (!user) return null;

  const tabConfig = [
    { key: 'profile', icon: FiUser, label: 'Profil', shortLabel: 'Profil' },
    { key: 'password', icon: FiLock, label: 'Şifre', shortLabel: 'Şifre' },
    { key: 'addresses', icon: FiMapPin, label: 'Adresler', shortLabel: 'Adresler' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">Hesabım</h1>
          <p className="text-sm sm:text-base text-gray-600">Hesap bilgilerinizi yönetin</p>
        </div>

        {/* Mobile Tab Selector */}
        <div className="lg:hidden mb-6">
          <div className="relative">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between text-left shadow-sm"
            >
              <div className="flex items-center">
                {React.createElement(tabConfig.find(tab => tab.key === activeTab)?.icon || FiUser, {
                  className: "mr-3 text-purple-600",
                  size: 18
                })}
                <span className="font-medium">
                  {tabConfig.find(tab => tab.key === activeTab)?.label}
                </span>
              </div>
              <FiChevronDown className={`transform transition-transform ${showMobileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {showMobileMenu && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveTab(tab.key as any);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center transition ${
                      activeTab === tab.key
                        ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {React.createElement(tab.icon, {
                      className: "mr-3",
                      size: 18
                    })}
                    {tab.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {tabConfig.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`w-full px-6 py-4 text-left flex items-center transition ${
                    activeTab === tab.key
                      ? 'bg-purple-50 text-purple-700 border-r-4 border-purple-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {React.createElement(tab.icon, {
                    className: "mr-3",
                    size: 20
                  })}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Message */}
            {message && (
              <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                <div className="flex items-center">
                  {message.type === 'success' ? <FiCheck className="mr-2 flex-shrink-0" /> : <FiX className="mr-2 flex-shrink-0" />}
                  {message.text}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Profil Bilgileri</h2>
                  <p className="text-sm text-gray-600 mt-1">Kişisel bilgilerinizi güncelleyin</p>
                </div>
                <div className="p-4 sm:p-6">
                  <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline mr-2 text-purple-600" size={16} />
                          Ad
                        </label>
                        <input
                          {...profileForm.register('firstName', { required: 'Ad zorunludur' })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                          placeholder="Adınızı giriniz"
                        />
                        {profileForm.formState.errors.firstName && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                            <FiX className="mr-1" size={12} />
                            {profileForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <FiUser className="inline mr-2 text-purple-600" size={16} />
                          Soyad
                        </label>
                        <input
                          {...profileForm.register('lastName', { required: 'Soyad zorunludur' })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                          placeholder="Soyadınızı giriniz"
                        />
                        {profileForm.formState.errors.lastName && (
                          <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                            <FiX className="mr-1" size={12} />
                            {profileForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiMail className="inline mr-2 text-purple-600" size={16} />
                        E-posta
                      </label>
                      <input
                        {...profileForm.register('email', { 
                          required: 'E-posta zorunludur',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Geçerli bir e-posta adresi giriniz'
                          }
                        })}
                        type="email"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                        placeholder="ornek@email.com"
                      />
                      {profileForm.formState.errors.email && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <FiX className="mr-1" size={12} />
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiPhone className="inline mr-2 text-purple-600" size={16} />
                        Telefon
                      </label>
                      <input
                        {...profileForm.register('phoneNumber', {
                          pattern: {
                            value: /^[0-9]{10,11}$/,
                            message: 'Geçerli bir telefon numarası giriniz'
                          }
                        })}
                        placeholder="5XXXXXXXXX"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                      />
                      {profileForm.formState.errors.phoneNumber && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <FiX className="mr-1" size={12} />
                          {profileForm.formState.errors.phoneNumber.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Güncelleniyor...
                          </div>
                        ) : (
                          'Bilgileri Güncelle'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-4 sm:p-6 border-b border-gray-100">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Şifre Değiştir</h2>
                  <p className="text-sm text-gray-600 mt-1">Hesap güvenliğiniz için şifrenizi güncelleyin</p>
                </div>
                <div className="p-4 sm:p-6">
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiLock className="inline mr-2 text-purple-600" size={16} />
                        Mevcut Şifre
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('currentPassword', { required: 'Mevcut şifre zorunludur' })}
                          type={showPasswords.current ? 'text' : 'password'}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                          placeholder="Mevcut şifrenizi giriniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showPasswords.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.currentPassword && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <FiX className="mr-1" size={12} />
                          {passwordForm.formState.errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiLock className="inline mr-2 text-purple-600" size={16} />
                        Yeni Şifre
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('newPassword', {
                            required: 'Yeni şifre zorunludur',
                            minLength: {
                              value: 8,
                              message: 'Şifre en az 8 karakter olmalıdır'
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[a-zA-Z\d@$!%*?&._-]{8,}$/,
                              message: 'Şifre en az bir büyük harf, bir küçük harf, bir rakam ve bir özel karakter içermelidir'
                            }
                          })}
                          type={showPasswords.new ? 'text' : 'password'}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                          placeholder="Yeni şifrenizi giriniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showPasswords.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.newPassword && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <FiX className="mr-1" size={12} />
                          {passwordForm.formState.errors.newPassword.message}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Şifre gereksinimleri:</p>
                        <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                          <li>En az 8 karakter</li>
                          <li>En az bir büyük harf (A-Z)</li>
                          <li>En az bir küçük harf (a-z)</li>
                          <li>En az bir rakam (0-9)</li>
                          <li>En az bir özel karakter (@$!%*?&._-)</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FiLock className="inline mr-2 text-purple-600" size={16} />
                        Yeni Şifre Tekrar
                      </label>
                      <div className="relative">
                        <input
                          {...passwordForm.register('confirmPassword', {
                            required: 'Şifre tekrarı zorunludur',
                            validate: value => value === passwordForm.watch('newPassword') || 'Şifreler eşleşmiyor'
                          })}
                          type={showPasswords.confirm ? 'text' : 'password'}
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm sm:text-base"
                          placeholder="Yeni şifrenizi tekrar giriniz"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                        >
                          {showPasswords.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                        </button>
                      </div>
                      {passwordForm.formState.errors.confirmPassword && (
                        <p className="text-red-500 text-xs sm:text-sm mt-1 flex items-center">
                          <FiX className="mr-1" size={12} />
                          {passwordForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-purple-800 transform hover:scale-[1.02] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                      >
                        {loading ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Değiştiriliyor...
                          </div>
                        ) : (
                          'Şifreyi Değiştir'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-white rounded-xl shadow-sm">
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Adreslerim</h2>
                        <p className="text-sm text-gray-600 mt-1">Teslimat adreslerinizi yönetin</p>
                      </div>
                      {!isAddingAddress && (
                        <button
                          onClick={() => setIsAddingAddress(true)}
                          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition flex items-center gap-2 text-sm font-medium shadow-lg transform hover:scale-[1.02]"
                        >
                          <FiPlus size={16} />
                          Yeni Adres
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Address Form */}
                  {isAddingAddress && (
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50">
                      <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">
                        {editingAddressId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                      </h3>
                      <form onSubmit={addressForm.handleSubmit(handleAddressSubmit)} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Adres Başlığı *
                          </label>
                          <input
                            {...addressForm.register('title', { required: 'Adres başlığı zorunludur' })}
                            placeholder="Ev, İş, vb."
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                          />
                          {addressForm.formState.errors.title && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <FiX className="mr-1" size={12} />
                              {addressForm.formState.errors.title.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ad *</label>
                            <input
                              {...addressForm.register('firstName', { required: 'Ad zorunludur' })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                              placeholder="Ad"
                            />
                            {addressForm.formState.errors.firstName && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <FiX className="mr-1" size={12} />
                                {addressForm.formState.errors.firstName.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Soyad *</label>
                            <input
                              {...addressForm.register('lastName', { required: 'Soyad zorunludur' })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                              placeholder="Soyad"
                            />
                            {addressForm.formState.errors.lastName && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <FiX className="mr-1" size={12} />
                                {addressForm.formState.errors.lastName.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
                          <input
                            {...addressForm.register('phone', { 
                              required: 'Telefon zorunludur',
                              pattern: {
                                value: /^[0-9]{10,11}$/,
                                message: 'Geçerli bir telefon numarası giriniz'
                              }
                            })}
                            placeholder="5XXXXXXXXX"
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                          />
                          {addressForm.formState.errors.phone && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <FiX className="mr-1" size={12} />
                              {addressForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adres *</label>
                          <input
                            {...addressForm.register('addressLine1', { required: 'Adres zorunludur' })}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                            placeholder="Mahalle, sokak, bina no"
                          />
                          {addressForm.formState.errors.addressLine1 && (
                            <p className="text-red-500 text-xs mt-1 flex items-center">
                              <FiX className="mr-1" size={12} />
                              {addressForm.formState.errors.addressLine1.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adres 2 (İsteğe bağlı)</label>
                          <input
                            {...addressForm.register('addressLine2')}
                            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                            placeholder="Apartman, daire no, vb."
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İl *</label>
                            <input
                              {...addressForm.register('city', { required: 'İl zorunludur' })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                              placeholder="İl"
                            />
                            {addressForm.formState.errors.city && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <FiX className="mr-1" size={12} />
                                {addressForm.formState.errors.city.message}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                            <input
                              {...addressForm.register('state')}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                              placeholder="İlçe"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu *</label>
                            <input
                              {...addressForm.register('postalCode', { required: 'Posta kodu zorunludur' })}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                              placeholder="34000"
                            />
                            {addressForm.formState.errors.postalCode && (
                              <p className="text-red-500 text-xs mt-1 flex items-center">
                                <FiX className="mr-1" size={12} />
                                {addressForm.formState.errors.postalCode.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              {...addressForm.register('isDefault')}
                              className="mr-3 text-purple-600 focus:ring-purple-500 rounded"
                            />
                            <span className="text-sm font-medium text-gray-700">Varsayılan adres olarak ayarla</span>
                          </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 text-sm font-medium shadow-lg transform hover:scale-[1.02]"
                          >
                            {loading ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Kaydediliyor...
                              </div>
                            ) : (
                              'Kaydet'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingAddress(false);
                              setEditingAddressId(null);
                              addressForm.reset();
                            }}
                            className="bg-gray-200 text-gray-800 px-4 py-2.5 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                          >
                            İptal
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* Address List */}
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="p-4 sm:p-6 relative">
                          {address.isDefault && (
                            <div className="absolute top-4 right-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                <FiCheck className="mr-1" size={12} />
                                Varsayılan
                              </span>
                            </div>
                          )}
                          
                          <div className="mb-4">
                            <h3 className="font-semibold text-base sm:text-lg mb-2 flex items-center gap-2 text-gray-800">
                              <FiHome className="text-purple-600 flex-shrink-0" size={18} />
                              <span className="truncate">{address.title}</span>
                            </h3>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <p className="font-medium text-gray-800">
                                {address.firstName} {address.lastName}
                              </p>
                              <p>{address.addressLine1}</p>
                              {address.addressLine2 && <p>{address.addressLine2}</p>}
                              <p>
                                {address.city}
                                {address.state && `, ${address.state}`}
                                {address.postalCode && ` ${address.postalCode}`}
                              </p>
                              <p className="flex items-center">
                                <FiPhone className="mr-1 text-purple-600" size={12} />
                                {address.phone}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm font-medium transition"
                            >
                              <FiEdit2 size={14} />
                              Düzenle
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition"
                            >
                              <FiTrash2 size={14} />
                              Sil
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !isAddingAddress ? (
                  <div className="bg-white rounded-xl shadow-sm">
                    <div className="p-8 sm:p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiMapPin className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz adres yok</h3>
                      <p className="text-gray-500 mb-6 text-sm sm:text-base">
                        Hızlı teslimat için adres ekleyin
                      </p>
                      <button
                        onClick={() => setIsAddingAddress(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition flex items-center gap-2 mx-auto text-sm font-medium shadow-lg transform hover:scale-[1.02]"
                      >
                        <FiPlus size={16} />
                        İlk Adresini Ekle
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;