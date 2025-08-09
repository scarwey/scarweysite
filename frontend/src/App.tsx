import React, { useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderHistory from './pages/OrderHistory';
import UserProfile from './pages/UserProfile';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import { fetchCart } from './store/slices/cartSlice';
import { AppDispatch } from './store';
import CategoryManagement from './pages/admin/CategoryManagement';
import UserLayout from './components/layout/UserLayout';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

// Admin imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProductManagement from './pages/admin/ProductManagement';
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import AdminRefundManagement from './pages/admin/AdminRefundManagement';

// Seller imports
import SellerLayout from './components/seller/SellerLayout';
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProductManagement from './pages/seller/SellerProductManagement';
import SellerOrderManagement from './pages/seller/SellerOrderManagement';

function App() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Load cart on app start
    dispatch(fetchCart());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Routes>
          {/* ✅ User Routes - UserLayout içinde */}
          <Route element={<UserLayout />}>     
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
          </Route>

          {/* ✅ Admin Routes - Protected + AdminLayout */}
          <Route element={<ProtectedRoute adminOnly={true} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="categories" element={<CategoryManagement />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="refunds" element={<AdminRefundManagement />} />
            </Route>
          </Route>

          {/* ✅ Seller Routes - Protected + SellerLayout */}
          <Route element={<ProtectedRoute sellerOnly={true} />}>
            <Route path="/seller" element={<SellerLayout />}>
              <Route index element={<SellerDashboard />} />
              <Route path="dashboard" element={<SellerDashboard />} />
              <Route path="products" element={<SellerProductManagement />} />
              <Route path="orders" element={<SellerOrderManagement />} />
            </Route>
          </Route>

          {/* ✅ 404 Catch-All Route - React Router ile düzeltildi */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-600 mb-4">Sayfa Bulunamadı</h2>
                <p className="text-gray-500 mb-8">Aradığınız sayfa mevcut değil.</p>
                <Link 
                  to="/" 
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition inline-block"
                >
                  Ana Sayfaya Dön
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;