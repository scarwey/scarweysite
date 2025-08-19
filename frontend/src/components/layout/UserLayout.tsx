// src/components/layout/UserLayout.tsx
import React from 'react';
import Header from './Header';
import CartDrawer from '../cart/CartDrawer';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      {/* ✅ mt-4 kaldırıldı - Hero section için boşluk yok */}
      <main className="pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;