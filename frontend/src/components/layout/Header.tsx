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

  useEffect(() => {
    debugAuth();
    dispatch(fetchCategories());
  }, [dispatch]);

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.items);
  const { categories } = useSelector((state: RootState) => state.categories);

  const cartItemCount = cart?.cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

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

  // Gender kategorileri
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
      path: '/products?gender=Uniseks'
    },
  ];

  return (
    <header className="bg-gradient-to-r from-white via-gray-50 to-white backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-gray-200/50 w-full">
      {/* Enhanced Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white text-center py-2.5 text-sm font-semibold w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
        <div className="relative z-10 flex items-center justify-center gap-2">
          <FiZap size={16} className="animate-bounce" />
          <span>Ücretsiz kargo 1500₺ ve üzeri alışverişlerde!</span>
          <FiZap size={16} className="animate-bounce" />
        </div>
      </div>

      <div className="w-full px-2 sm:px-4 max-w-none sm:max-w-7xl sm:mx-auto">
        {/* Enhanced Main Header */}
        <div className="flex items-center justify-between py-3 sm:py-5 min-h-[65px]">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-2 group flex-shrink-0 min-w-0 relative">
            <div className="relative">
              <img                  
                src="/swlogo.png"                  
                alt="Scarwey"                  
                className="h-6 w-6 sm:h-10 sm:w-10 group-hover:scale-110 transition-all duration-300 drop-shadow-lg"               
              />
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300" />
            </div>               
            <span className="text-lg sm:text-4xl font-black bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent truncate group-hover:from-orange-600 group-hover:via-red-600 group-hover:to-pink-600 transition-all duration-300 drop-shadow-sm">                 
              Scarwey               
            </span>
          </Link>

          {/* Enhanced Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full group">
              <div className="relative flex w-full">
                <input
                  type="text"
                  placeholder="Aradığınız ürünü yazın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-l-2xl focus:border-orange-500 focus:outline-none bg-white/80 backdrop-blur-sm focus:bg-white transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-lg focus:shadow-xl"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-r-2xl hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <FiSearch size={22} className="relative z-10" />
                </button>
              </div>
            </form>
          </div>

          {/* Enhanced Mobile Search Bar */}
          <div className="flex-1 mx-2 sm:mx-3 md:hidden">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex w-full min-w-0">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border-2 border-gray-200 rounded-l-xl focus:border-orange-500 focus:outline-none bg-white/90 backdrop-blur-sm focus:bg-white transition-all min-w-0 shadow-md"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex-shrink-0 shadow-md"
                >
                  <FiSearch size={14} />
                </button>
              </div>
            </form>
          </div>

          {/* Enhanced Right Section */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Enhanced User Account */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-2 px-2 py-2 sm:px-4 sm:py-3 rounded-xl hover:bg-white/60 backdrop-blur-sm transition-all duration-300 border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                }}
              >
                <div className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <FiUser className="text-white" size={12} />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs text-gray-500 font-medium">
                    {isAuthenticated ? 'Hoş geldin' : 'Giriş Yap'}
                  </div>
                  <div className="text-sm font-bold text-gray-700 flex items-center">
                    {isAuthenticated ? user?.firstName : 'Hesabım'}
                    <FiChevronDown className="ml-1" size={12} />
                  </div>
                </div>
              </button>

              {/* Enhanced User Dropdown */}
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 overflow-hidden">
                {isAuthenticated ? (
                  <>
                    <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
                      <p className="font-bold text-gray-800 text-lg">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-600">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-medium">
                        <FiUser className="mr-3 text-orange-500" size={18} />
                        Profilim
                      </Link>
                      <Link to="/orders" className="flex items-center px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-medium">
                        <FiPackage className="mr-3 text-blue-500" size={18} />
                        Siparişlerim
                      </Link>
                      <Link to="/wishlist" className="flex items-center px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-medium">
                        <FiHeart className="mr-3 text-pink-500" size={18} />
                        Favorilerim
                        {wishlistItems.length > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link to="/cart" className="flex items-center px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-medium">
                        <FiShoppingCart className="mr-3 text-green-500" size={18} />
                        Sepetim
                        {cartItemCount > 0 && (
                          <span className="ml-auto bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {cartItemCount}
                          </span>
                        )}
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin/dashboard" className="flex items-center px-6 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-all duration-200 font-medium">
                          <FiSettings className="mr-3 text-blue-500" size={18} />
                          Admin Paneli
                        </Link>
                      )}
                      {isSeller() && (
                        <Link to="/seller/dashboard" className="flex items-center px-6 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-all duration-200 font-medium">
                          <FiSettings className="mr-3 text-blue-500" size={18} />
                          Seller Paneli
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-6 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <Link to="/login" className="block px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-bold">
                      Giriş Yap
                    </Link>
                    <Link to="/register" className="block px-6 py-3 text-sm hover:bg-gray-50 transition-all duration-200 font-medium">
                      Üye Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Wishlist */}
            <Link to="/wishlist" className="relative p-2 sm:p-3 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 hidden md:block border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md">
              <FiHeart size={24} className="text-gray-600 hover:text-pink-500 transition-colors" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Enhanced Cart */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 sm:p-3 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 hidden md:block border border-transparent hover:border-gray-200 shadow-sm hover:shadow-md"
            >
              <FiShoppingCart size={24} className="text-gray-600 hover:text-orange-500 transition-colors" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Enhanced Mobile Menu Toggle */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="md:hidden p-2 hover:bg-white/60 backdrop-blur-sm rounded-xl transition-all duration-300 flex-shrink-0 border border-transparent hover:border-gray-200 shadow-sm"
            >
              {isMobileMenuOpen ? <FiX size={18} className="text-gray-600" /> : <FiMenu size={18} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden md:block border-t border-gray-200/50 py-4 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent">
          <div className="flex items-center justify-between">
            <ul className="flex space-x-8 items-center">
              {/* Enhanced Kategoriler Dropdown */}
              <li className="relative group">
                <button className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-orange-100 hover:to-red-100 rounded-xl transition-all duration-300 border border-gray-300 hover:border-orange-300 shadow-md hover:shadow-lg font-semibold">
                  <FiMenu className="text-gray-600" size={18} />
                  <span className="text-gray-700">Kategoriler</span>
                  <FiChevronDown className="text-gray-500" size={16} />
                </button>
                
                {/* Enhanced Kategori Dropdown */}
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
                        to={`/products?categoryId=${category.id}`}
                        className="flex items-center px-6 py-3 text-sm text-gray-800 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:text-orange-600 transition-all duration-200 border-b border-gray-50 last:border-b-0 font-medium"
                      >
                        <span>{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* Enhanced Navigation Links */}
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

            {/* Enhanced İndirimler Button */}
            <Link 
              to="/products?sale=true" 
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <FiTrendingUp size={18} className="relative z-10" />
              <span className="relative z-10">İndirimler</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/50 shadow-2xl absolute top-full left-0 right-0 z-50 w-full">
          <div className="w-full px-4 py-4 max-h-96 overflow-y-auto">
            {/* Enhanced Mobile Navigation */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Ana Sayfa */}
              <Link
                to="/"
                className="flex items-center py-3 px-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 font-semibold border border-gray-100 hover:border-orange-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHome className="mr-3" size={16} />
                Ana Sayfa
              </Link>

              {/* Tüm Ürünler */}
              <Link
                to="/products"
                className="flex items-center py-3 px-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 font-semibold border border-gray-100 hover:border-orange-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiPackage className="mr-3" size={16} />
                Tüm Ürünler
              </Link>
              
              {/* Gender Kategorileri */}
              {genderCategories.map((gender) => (
                <Link
                  key={gender.id}
                  to={gender.path}
                  className="flex items-center py-3 px-4 text-gray-700 hover:text-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl transition-all duration-300 font-semibold border border-gray-100 hover:border-orange-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {gender.name}
                </Link>
              ))}
              
              {/* İndirimler */}
              <Link
                to="/products?sale=true"
                className="flex items-center py-3 px-4 text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl font-bold shadow-lg col-span-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiTrendingUp className="mr-3" size={16} />
                İndirimler
              </Link>
            </div>

            {/* Enhanced Mobile Categories */}
            {categories.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                  <FiPackage size={14} />
                  Popüler Kategoriler
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {categories.slice(0, 4).map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?categoryId=${category.id}`}
                      className="py-2 px-3 text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 truncate rounded-lg border border-gray-100 hover:border-orange-200 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/wishlist"
                  className="flex items-center justify-center py-3 px-4 text-pink-600 bg-pink-50 hover:bg-pink-100 rounded-xl transition-all duration-300 font-semibold border border-pink-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FiHeart className="mr-2" size={16} />
                  Favoriler
                  {wishlistItems.length > 0 && (
                    <span className="ml-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>

                <button
                  onClick={() => {
                    dispatch(toggleCart());
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center py-3 px-4 text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all duration-300 font-semibold border border-orange-200"
                >
                  <FiShoppingCart className="mr-2" size={16} />
                  Sepet
                  {cartItemCount > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;