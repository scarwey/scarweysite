import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as Icons from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleCart } from '../../store/slices/cartSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { isSeller, isAdmin, debugAuth } from '../../utils/auth';

const FiSearch = Icons.FiSearch as any;
const FiUser = Icons.FiUser as any;
const FiHeart = Icons.FiHeart as any;
const FiShoppingCart = Icons.FiShoppingCart as any;
const FiMenu = Icons.FiMenu as any;
const FiX = Icons.FiX as any;
const FiChevronDown = Icons.FiChevronDown as any;
const FiPackage = Icons.FiPackage as any;
const FiSettings = Icons.FiSettings as any;
const FiTrendingUp = Icons.FiTrendingUp as any;
const FiHome = Icons.FiHome as any;
const FiZap = Icons.FiZap as any;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    debugAuth();
    dispatch(fetchCategories());
    
    // Dışarıya tıklayınca profil menüsünü kapat
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-dropdown-container')) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dispatch]);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { categories } = useSelector((state: RootState) => state.categories);

  const cartItemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Menülerin çakışmasını önlemek için toggle fonksiyonları
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsProfileMenuOpen(false); // Diğer menüyü kapat
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
    setIsMobileMenuOpen(false); // Diğer menüyü kapat
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout() as any);
    navigate('/');
  };

  const genderCategories = [
    { 
      id: 'kadin', 
      name: 'Kadın', 
      path: '/products?gender=Kadın'
    },
    { 
      id: 'erkek', 
      name: 'Erkek', 
      path: '/products?gender=Erkek'
    },
    { 
      id: 'cocuk', 
      name: 'Çocuk', 
      path: '/products?gender=Çocuk'
    },
    { 
      id: 'unisex', 
      name: 'Unisex', 
      path: '/products?gender=Unisex'
    },
  ];

  return (
    <>
      {/* Kayan yazı için CSS tanımı */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
        `}
      </style>
      
     
     
      {/* ÜST NAVBAR - Sabit pozisyon */}
      <header className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md shadow-xl fixed top-0 left-0 right-0 z-40 border-b border-gray-200/50">
        {/* Top Banner - Profesyonel ve Açık */}
        <div className="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 text-gray-800 text-center py-2.5 text-sm font-semibold relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          <div className="relative z-10">
            <div className="whitespace-nowrap" style={{
              animation: 'marquee 10s linear infinite'
            }}>
              <span className="mx-8">Ücretsiz kargo 1500₺ ve üzeri alışverişlerde!</span>
              <span className="mx-8">Hızlı teslimat garantisi!</span>
              <span className="mx-8">14 gün koşulsuz iade!</span>
              <span className="mx-8">Ücretsiz kargo 1500₺ ve üzeri alışverişlerde!</span>
              <span className="mx-8">Hızlı teslimat garantisi!</span>
              <span className="mx-8">14 gün koşulsuz iade!</span>
            </div>
          </div>
        </div>

        <div className="w-full px-1 sm:px-4">
          {/* ULTRA KOMPAKT NAVBAR - Tam genişlik kullan */}
          <div className="flex items-center justify-between gap-1 py-2 min-h-[55px] w-full">
            {/* Logo + Scarwey İsmi - Sadece Logo Animasyonu Kaldırıldı */}
            <Link to="/" className="flex items-center space-x-1 group flex-shrink-0 min-w-[60px]">
              <div>
                <img                  
                  src="/swlogo.png"                  
                  alt="Scarwey"                  
                  className="h-5 w-5 sm:h-7 sm:w-7"               
                />
              </div>               
              <span className="text-xs sm:text-lg font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 transition-all duration-300 drop-shadow-sm truncate">                 
                Scarwey               
              </span>
            </Link>

            {/* Arama Motoru - Orta alan */}
            <div className="flex-1 mx-2 min-w-0 md:max-w-md lg:max-w-lg">
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative flex w-full">
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-l-md focus:border-gray-400 focus:outline-none bg-white transition-all min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-2 py-1.5 bg-white border border-l-0 border-gray-200 text-gray-800 rounded-r-md hover:bg-gray-50 transition-colors flex-shrink-0"
                  >
                    <FiSearch size={14} />
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Profil/Sepet/Favoriler - Mobil Navbar Tarzı */}
            <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
              {/* Profil Dropdown - Desktop - Mobil Tarzı */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 px-2 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300">
                    <FiUser className="text-gray-800" size={16} />
                    <span className="text-xs font-semibold text-gray-700 hidden lg:block">{user?.firstName}</span>
                    <FiChevronDown className="text-gray-400" size={12} />
                  </button>
                  
                  {/* Desktop Profil Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                      <p className="font-bold text-gray-800 text-sm">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-all border-b border-gray-50">
                        <FiUser className="mr-3 text-blue-500" size={16} />
                        Profil Bilgileri
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-all border-b border-gray-50">
                        <FiPackage className="mr-3 text-blue-500" size={16} />
                        Siparişlerim
                      </Link>
                      {(isAdmin() || isSeller()) && (
                        <Link 
                          to={isAdmin() ? "/admin/dashboard" : "/seller/dashboard"} 
                          className="flex items-center px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-all border-b border-gray-50"
                        >
                          <FiSettings className="mr-3 text-blue-500" size={16} />
                          {isAdmin() ? 'Admin Panel' : 'Seller Panel'}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-1">
                  <Link to="/login" className="px-2 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition-colors">
                    Giriş
                  </Link>
                  <Link to="/register" className="px-2 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                    Kayıt
                  </Link>
                </div>
              )}

              {/* Favoriler - Desktop - Mobil Navbar Tarzı */}
              <Link to="/wishlist" className="relative p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300">
                <FiHeart className="text-gray-800" size={16} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Sepet - Desktop - Mobil Navbar Tarzı */}
              <Link
                to="/cart"
                className="relative p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-300"
              >
                <FiShoppingCart className="text-gray-800" size={16} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Hamburger Menü - Sadece mobilde */}
            <div className="relative flex-shrink-0 min-w-[40px] md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-all duration-300"
              >
                {isMobileMenuOpen ? <FiX size={16} className="text-gray-600" /> : <FiMenu size={16} className="text-gray-600" />}
              </button>

              {/* NAVBAR İÇİNDE Hamburger Dropdown */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden max-h-[50vh] overflow-y-auto">
                  <div className="p-2">
                    {/* Kullanıcı Bölümü - Kompakt */}
                    <div className="border-b border-gray-200 pb-2 mb-2">
                      {isAuthenticated ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center">
                            <FiUser className="text-white" size={12} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-gray-800 text-xs truncate">{user?.firstName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <Link
                            to="/login"
                            className="block w-full text-center py-1.5 bg-orange-500 text-white rounded-md text-xs font-semibold hover:bg-orange-600 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Giriş
                          </Link>
                          <Link
                            to="/register"
                            className="block w-full text-center py-1.5 bg-gray-100 text-gray-700 rounded-md text-xs font-semibold hover:bg-gray-200 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            Kayıt
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Ana Navigasyon - Ultra Kompakt */}
                    <div className="space-y-0.5 mb-2 border-b border-gray-200 pb-2">
                      <Link
                        to="/"
                        className="flex items-center py-1.5 px-2 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all text-xs"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FiHome className="mr-2" size={12} />
                        Ana Sayfa
                      </Link>
                      <Link
                        to="/products?sale=true"
                        className="flex items-center py-1.5 px-2 text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-md font-bold text-xs"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <FiTrendingUp className="mr-2" size={12} />
                        İndirimler
                      </Link>
                    </div>

                    {/* Kategoriler - Ultra Kompakt */}
                    <div className="space-y-0.5 mb-2 border-b border-gray-200 pb-2">
                      <p className="text-xs font-bold text-gray-500 mb-1">KATEGORİ</p>
                      {genderCategories.map((gender) => (
                        <Link
                          key={gender.id}
                          to={gender.path}
                          className="block py-1 px-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all text-xs"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {gender.name}
                        </Link>
                      ))}
                    </div>

                    {/* Hesap İşlemleri - Ultra Kompakt */}
                    {isAuthenticated && (
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-gray-500 mb-1">HESAP</p>
                        <Link
                          to="/orders"
                          className="flex items-center py-1 px-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-all text-xs"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <FiPackage className="mr-2" size={10} />
                          Siparişler
                        </Link>
                        {(isAdmin() || isSeller()) && (
                          <Link
                            to={isAdmin() ? "/admin/dashboard" : "/seller/dashboard"}
                            className="flex items-center py-1 px-2 text-blue-600 hover:bg-blue-50 rounded-md transition-all text-xs"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <FiSettings className="mr-2" size={10} />
                            {isAdmin() ? 'Admin Panel' : 'Seller Panel'}
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center w-full py-1 px-2 text-red-600 hover:bg-red-50 rounded-md transition-all text-xs"
                        >
                          Çıkış
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block border-t border-gray-200/50 py-4 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent">
            <div className="flex items-center justify-between">
              <ul className="flex space-x-8 items-center">
                {/* Kategoriler Dropdown */}
                <li className="relative group">
                  <button className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-orange-100 hover:to-red-100 rounded-xl transition-all duration-300 border border-gray-300 hover:border-orange-300 shadow-md hover:shadow-lg font-semibold">
                    <FiMenu className="text-gray-600" size={18} />
                    <span className="text-gray-700">Kategoriler</span>
                    <FiChevronDown className="text-gray-500" size={16} />
                  </button>
                  
                  {/* Kategori Dropdown */}
                  <div className="absolute left-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                    <div className="py-3">
                      <div className="px-6 py-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl border-b border-gray-100">
                        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
                          <FiPackage size={16} />
                          Tüm Kategoriler
                        </span>
                      </div>
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?categoryIds=${category.id}`}
                          className="flex items-center px-6 py-3 text-sm text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 transition-all duration-200 border-b border-gray-50 last:border-b-0 font-medium"
                        >
                          <span>{category.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>

                {/* Navigation Links */}
                <li>
                  <Link to="/" className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 relative group px-2 py-1">
                    Ana Sayfa
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>

                <li>
                  <Link to="/products" className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 relative group px-2 py-1">
                    Tüm Ürünler
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>

                {/* Gender Kategorileri */}
                {genderCategories.map((gender) => (
                  <li key={gender.id}>
                    <Link
                      to={gender.path}
                      className="text-gray-700 hover:text-orange-600 font-semibold transition-all duration-300 relative group px-2 py-1"
                    >
                      <span>{gender.name}</span>
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* İndirimler Button */}
              <Link 
                to="/products?sale=true" 
                className="flex items-center space-x-2 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-5 py-2.5 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <FiTrendingUp size={16} className="relative z-10" />
                <span className="relative z-10">İndirimler</span>
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* ALT NAVBAR - Mobil Tab Bar (Eşit Alanlar + Dışarı Tıklama) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
        <div className="grid grid-cols-5 py-2">
          {/* 1. Ana Sayfa - Eşit alan */}
          <Link to="/" className="flex flex-col items-center gap-1 px-1 py-1">
            <FiHome className="text-black" size={20} />
            <span className="text-xs font-medium text-black text-center leading-tight">Ana Sayfa</span>
          </Link>

          {/* 2. Tüm Ürünler - Eşit alan */}
          <Link to="/products" className="flex flex-col items-center gap-1 px-1 py-1">
            <FiPackage className="text-black" size={20} />
            <span className="text-xs font-medium text-black text-center leading-tight">Ürünler</span>
          </Link>

          {/* 3. Profil - ORTADA - Eşit alan */}
          {isAuthenticated ? (
            <div className="relative profile-dropdown-container">
              <button 
                onClick={toggleProfileMenu}
                className="flex flex-col items-center gap-1 px-1 py-1 w-full"
              >
                <FiUser className="text-black" size={20} />
                <span className="text-xs font-medium text-black text-center leading-tight">Profil</span>
              </button>

              {/* Profil Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 w-56 bg-white rounded-lg shadow-2xl border border-gray-200 z-[60] overflow-hidden">
                  <div className="px-3 py-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
                    <p className="font-bold text-gray-800 text-sm truncate">{user?.firstName}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <div className="py-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-3 py-3 text-sm hover:bg-gray-50 transition-all border-b border-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiUser className="mr-3 text-blue-500" size={14} />
                      Profil Bilgileri
                    </Link>
                    <Link 
                      to="/orders" 
                      className="flex items-center px-3 py-3 text-sm hover:bg-gray-50 transition-all border-b border-gray-50"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <FiPackage className="mr-3 text-blue-500" size={14} />
                      Siparişlerim
                    </Link>
                    {(isAdmin() || isSeller()) && (
                      <Link 
                        to={isAdmin() ? "/admin/dashboard" : "/seller/dashboard"} 
                        className="flex items-center px-3 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-all border-b border-gray-50"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <FiSettings className="mr-3 text-blue-500" size={14} />
                        {isAdmin() ? 'Admin Panel' : 'Seller Panel'}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-3 text-sm text-red-600 hover:bg-red-50 transition-all"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="flex flex-col items-center gap-1 px-1 py-1">
              <FiUser className="text-black" size={20} />
              <span className="text-xs font-medium text-black text-center leading-tight">Giriş</span>
            </Link>
          )}

          {/* 4. Favoriler - Eşit alan */}
          <Link to="/wishlist" className="flex flex-col items-center gap-1 px-1 py-1 relative">
            <div className="relative">
              <FiHeart className="text-black" size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {wishlistItems.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-black text-center leading-tight">Favoriler</span>
          </Link>

          {/* 5. Sepet - Eşit alan */}
          <button
            onClick={() => dispatch(toggleCart())}
            className="flex flex-col items-center gap-1 px-1 py-1 relative"
          >
            <div className="relative">
              <FiShoppingCart className="text-black" size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-black text-center leading-tight">Sepet</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Header;