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

  // Kategoriler için ikon helper - Sadece text
  const getCategoryIcon = () => {
    return null; // İkon kullanmıyoruz
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-100 w-full">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 text-sm font-medium w-full">
        Ücretsiz kargo 1500₺ ve üzeri alışverişlerde!
      </div>

      <div className="w-full px-2 sm:px-4 max-w-none sm:max-w-7xl sm:mx-auto">
        {/* Main Header */}
        <div className="flex items-center justify-between py-2 sm:py-4 min-h-[60px]">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1 group flex-shrink-0 min-w-0">
            <img                  
              src="/swlogo.png"                  
              alt="Scarwey"                  
              className="h-5 w-5 sm:h-8 sm:w-8 group-hover:scale-105 transition-transform duration-300"               
            />               
            <span className="text-base sm:text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent truncate">                 
              Scarwey               
            </span>
          </Link>

          {/* Desktop Search Bar - Center */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex w-full">
                <input
                  type="text"
                  placeholder="Aradığınız ürünü yazın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-l-xl focus:border-orange-500 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>
          </div>

          {/* Mobile Search Bar */}
          <div className="flex-1 mx-1 sm:mx-2 md:hidden">
            <form onSubmit={handleSearch} className="flex w-full">
              <div className="relative flex w-full min-w-0">
                <input
                  type="text"
                  placeholder="Ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-l-md focus:border-orange-500 focus:outline-none bg-gray-50 focus:bg-white transition-all min-w-0"
                />
                <button
                  type="submit"
                  className="px-2 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-r-md hover:from-orange-600 hover:to-red-600 transition-all duration-300 flex-shrink-0"
                >
                  <FiSearch size={12} />
                </button>
              </div>
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {/* User Account */}
            <div className="relative group">
              <button 
                className="flex items-center space-x-1 px-1 py-1 sm:px-3 sm:py-2 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setIsMobileMenuOpen(false); // Hamburger menüyü kapat
                }}
              >
                <div className="w-5 h-5 sm:w-8 sm:h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={10} />
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs text-gray-500">
                    {isAuthenticated ? 'Hoş geldin' : 'Giriş Yap'}
                  </div>
                  <div className="text-sm font-medium text-gray-700 flex items-center">
                    {isAuthenticated ? user?.firstName : 'Hesabım'}
                    <FiChevronDown className="ml-1" size={12} />
                  </div>
                </div>
              </button>

              {/* User Dropdown */}
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                      <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link to="/profile" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiUser className="mr-3 text-gray-400" size={16} />
                        Profilim
                      </Link>
                      <Link to="/orders" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiPackage className="mr-3 text-gray-400" size={16} />
                        Siparişlerim
                      </Link>
                      <Link to="/wishlist" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiHeart className="mr-3 text-gray-400" size={16} />
                        Favorilerim
                        {wishlistItems.length > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {wishlistItems.length}
                          </span>
                        )}
                      </Link>
                      <Link to="/cart" className="flex items-center px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                        <FiShoppingCart className="mr-3 text-gray-400" size={16} />
                        Sepetim
                        {cartItemCount > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {cartItemCount}
                          </span>
                        )}
                      </Link>
                      {isAdmin() && (
                        <Link to="/admin/dashboard" className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-colors">
                          <FiSettings className="mr-3 text-blue-500" size={16} />
                          Admin Paneli
                        </Link>
                      )}
                      {isSeller() && (
                        <Link to="/seller/dashboard" className="flex items-center px-4 py-3 text-sm hover:bg-blue-50 text-blue-600 transition-colors">
                          <FiSettings className="mr-3 text-blue-500" size={16} />
                          Seller Paneli
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-2">
                    <Link to="/login" className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium">
                      Giriş Yap
                    </Link>
                    <Link to="/register" className="block px-4 py-3 text-sm hover:bg-gray-50 transition-colors">
                      Üye Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Wishlist - Hidden on mobile to save space */}
            <Link to="/wishlist" className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors hidden md:block">
              <FiHeart size={24} className="text-gray-600" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart - Hidden on mobile to save space */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors hidden md:block"
            >
              <FiShoppingCart size={24} className="text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg animate-pulse">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              }}
              className="md:hidden p-1.5 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
            >
              {isMobileMenuOpen ? <FiX size={16} className="text-gray-600" /> : <FiMenu size={16} className="text-gray-600" />}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block border-t border-gray-100 py-4">
          <div className="flex items-center justify-between">
            <ul className="flex space-x-8 items-center">
              {/* 1. Kategoriler Dropdown - En Solda */}
              <li className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-orange-50 hover:to-orange-100 rounded-lg transition-all duration-300 border border-gray-200 hover:border-orange-200">
                  <FiMenu className="text-gray-600" size={18} />
                  <span className="text-gray-700 font-medium">Kategoriler</span>
                  <FiChevronDown className="text-gray-500" size={16} />
                </button>
                
                {/* Kategori Dropdown */}
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-3">
                    <div className="px-4 py-2 bg-gray-50 rounded-t-xl border-b border-gray-100">
                      <span className="text-sm font-semibold text-gray-700">Tüm Kategoriler</span>
                    </div>
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        to={`/products?categoryId=${category.id}`}
                        className="flex items-center px-4 py-3 text-sm text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <span className="font-medium">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </li>

              {/* 2. Ana Sayfa */}
              <li>
                <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium transition-colors relative group">
                  Ana Sayfa
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>

              {/* 3. Tüm Ürünler */}
              <li>
                <Link to="/products" className="text-gray-700 hover:text-orange-600 font-medium transition-colors relative group">
                  Tüm Ürünler
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </li>

              {/* 3. Gender Kategorileri */}
              {genderCategories.map((gender) => (
                <li key={gender.id}>
                  <Link
                    to={gender.path}
                    className="text-gray-700 hover:text-orange-600 font-medium transition-colors relative group"
                  >
                    <span>{gender.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* 4. İndirimler - Sağ Tarafta */}
            <Link 
              to="/products?sale=true" 
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-medium hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FiTrendingUp size={16} />
              <span>İndirimler</span>
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg absolute top-full left-0 right-0 z-50 w-full">
          <div className="w-full px-2 sm:px-4 py-3 max-h-96 overflow-y-auto">
            {/* Mobile Navigation - Kompakt Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              {/* Ana Sayfa */}
              <Link
                to="/"
                className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiHome className="mr-2" size={16} />
                Ana Sayfa
              </Link>

              {/* Tüm Ürünler */}
              <Link
                to="/products"
                className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiPackage className="mr-2" size={16} />
                Tüm Ürünler
              </Link>
              
              {/* Gender Kategorileri */}
              {genderCategories.map((gender) => (
                <Link
                  key={gender.id}
                  to={gender.path}
                  className="flex items-center py-2 px-3 text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {gender.name}
                </Link>
              ))}
              
              {/* İndirimler */}
              <Link
                to="/products?sale=true"
                className="flex items-center py-2 px-3 text-red-500 hover:bg-red-50 rounded-lg font-semibold"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FiTrendingUp className="mr-2" size={16} />
                İndirimler
              </Link>
            </div>

            {/* Kategoriler - Sadece 4 tane göster */}
            {categories.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs font-semibold text-gray-500 mb-2">Popüler Kategoriler</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  {categories.slice(0, 4).map((category) => (
                    <Link
                      key={category.id}
                      to={`/products?categoryId=${category.id}`}
                      className="py-1 px-2 text-gray-600 hover:text-orange-600 transition-colors truncate"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;