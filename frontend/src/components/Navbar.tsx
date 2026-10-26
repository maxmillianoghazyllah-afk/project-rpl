import React from 'react';
import {
  ShoppingBag,
  UtensilsCrossed,
  Clock,
  History,
  Store,
  Monitor,
  ShieldCheck,
  User,
  KeyRound,
  Lock,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  activeRole: UserRole;
  onRequestSellerLogin: (targetTab?: string) => void;
  onOpenChangePassword: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  activeRole,
  onRequestSellerLogin,
  onOpenChangePassword,
}) => {
  const { totalItems } = useCart();

  const handleRoleClick = (targetRole: UserRole) => {
    if (targetRole === 'SELLER') {
      if (activeRole === 'SELLER') {
        onNavigate('seller-orders');
      } else {
        onRequestSellerLogin('seller-orders');
      }
    } else {
      // Beralih ke Mahasiswa cukup dengan mengklik tab Mahasiswa
      onNavigate('menu');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate(activeRole === 'CUSTOMER' ? 'menu' : 'seller-orders')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
                Kantin<span className="text-brand-600">Queue</span>
              </span>
              <span className="block text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                Sistem Antrean Digital P3
              </span>
            </div>
          </div>

          {/* Navigation Items (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {activeRole === 'CUSTOMER' ? (
              <>
                <button
                  onClick={() => onNavigate('menu')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'menu'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Katalog Menu
                </button>
                <button
                  onClick={() => onNavigate('cart')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 relative transition ${
                    currentTab === 'cart'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Keranjang
                  {totalItems > 0 && (
                    <span className="bg-brand-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onNavigate('queue')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'queue'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Pantau Antrean
                </button>
                <button
                  onClick={() => onNavigate('history')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'history'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Riwayat
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('seller-orders')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'seller-orders'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Pesanan Masuk
                </button>
                <button
                  onClick={() => onNavigate('seller-menus')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'seller-menus'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Kelola Menu
                </button>
                <button
                  onClick={() => onNavigate('seller-display')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    currentTab === 'seller-display'
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Layar Display Monitor
                </button>
              </>
            )}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Seller Action Controls (Ganti Password) */}
            {activeRole === 'SELLER' && (
              <div className="flex items-center gap-1.5 mr-1 border-r border-gray-200 pr-2.5">
                <button
                  onClick={onOpenChangePassword}
                  title="Ganti Password Penjual"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 flex items-center gap-1.5 transition border border-gray-200 shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ganti Password</span>
                </button>
              </div>
            )}

            {/* Role Switcher Pill (Bisa langsung klik Mahasiswa untuk kembali) */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center border border-gray-200 text-xs font-semibold">
              <button
                onClick={() => handleRoleClick('CUSTOMER')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeRole === 'CUSTOMER'
                    ? 'bg-white text-brand-600 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Mahasiswa
              </button>
              <button
                onClick={() => handleRoleClick('SELLER')}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  activeRole === 'SELLER'
                    ? 'bg-white text-emerald-600 shadow-sm font-bold'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {activeRole === 'SELLER' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                )}
                Penjual
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex border-t border-gray-200 bg-white px-2 py-1 justify-around text-xs font-semibold">
        {activeRole === 'CUSTOMER' ? (
          <>
            <button
              onClick={() => onNavigate('menu')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'menu' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 mb-0.5" />
              Menu
            </button>
            <button
              onClick={() => onNavigate('cart')}
              className={`p-2 flex flex-col items-center relative ${
                currentTab === 'cart' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-0.5" />
              Keranjang {totalItems > 0 && `(${totalItems})`}
            </button>
            <button
              onClick={() => onNavigate('queue')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'queue' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <Clock className="w-4 h-4 mb-0.5" />
              Antrean
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'history' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <History className="w-4 h-4 mb-0.5" />
              Riwayat
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onNavigate('seller-orders')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'seller-orders' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <Store className="w-4 h-4 mb-0.5" />
              Pesanan
            </button>
            <button
              onClick={() => onNavigate('seller-menus')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'seller-menus' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4 mb-0.5" />
              Menu
            </button>
            <button
              onClick={() => onNavigate('seller-display')}
              className={`p-2 flex flex-col items-center ${
                currentTab === 'seller-display' ? 'text-brand-600 font-bold' : 'text-gray-500'
              }`}
            >
              <Monitor className="w-4 h-4 mb-0.5" />
              Display
            </button>
          </>
        )}
      </div>
    </header>
  );
};
