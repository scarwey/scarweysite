// src/components/layout/UserLayout.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import CartDrawer from '../cart/CartDrawer';
import { Outlet } from 'react-router-dom';

const UserLayout: React.FC = () => {
  const location = useLocation();
  
  // Home sayfasında header spacing istemiyoruz (hero section için)
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <CartDrawer />
      {/* ✅ Home dışındaki tüm sayfalarda header sonrası spacing */}
      <main className={`pb-20 md:pb-0 ${isHomePage ? '' : 'pt-32 md:pt-44'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;