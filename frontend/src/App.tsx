import React, { useState, useEffect, useCallback } from 'react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { PaymentInstructionPage } from './pages/PaymentInstructionPage';
import { QueueStatusPage } from './pages/QueueStatusPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerMenuPage } from './pages/seller/SellerMenuPage';
import { SellerQueueDisplayPage } from './pages/seller/SellerQueueDisplayPage';
import { SellerAuthModal, AuthModalMode } from './components/SellerAuthModal';
import { Order, UserRole } from './types';
import { Lock, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [currentTab, setCurrentTab] = useState<string>('menu');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Modal Auth State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('LOGIN');
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Check if seller session is unlocked
  const isSellerUnlocked = () => {
    return sessionStorage.getItem('kantin_seller_session') === 'true';
  };

  // Check if a password has been created previously
  const hasSellerPassword = () => {
    return Boolean(localStorage.getItem('kantin_seller_password'));
  };

  // Convert tab to URL path
  const getPathForTab = (tab: string): string => {
    switch (tab) {
      case 'menu':
        return '/';
      case 'cart':
        return '/cart';
      case 'payment':
        return '/payment';
      case 'queue':
        return '/queue';
      case 'history':
        return '/history';
      case 'seller-orders':
        return '/seller';
      case 'seller-menus':
        return '/seller/menus';
      case 'seller-display':
        return '/seller/display';
      default:
        return '/';
    }
  };

  // Convert URL path to tab & role info
  const resolveRoute = useCallback(
    (
      pathname: string
    ): {
      role: UserRole;
      tab: string;
      isSellerProtected: boolean;
    } => {
      const path = pathname.toLowerCase().replace(/\/+$/, '') || '/';

      if (path === '/seller/display') {
        return { role: 'SELLER', tab: 'seller-display', isSellerProtected: true };
      }
      if (path === '/seller/menus') {
        return { role: 'SELLER', tab: 'seller-menus', isSellerProtected: true };
      }
      if (path === '/seller' || path === '/seller/orders') {
        return { role: 'SELLER', tab: 'seller-orders', isSellerProtected: true };
      }
      if (path === '/cart') {
        return { role: 'CUSTOMER', tab: 'cart', isSellerProtected: false };
      }
      if (path === '/payment') {
        return { role: 'CUSTOMER', tab: 'payment', isSellerProtected: false };
      }
      if (path === '/queue') {
        return { role: 'CUSTOMER', tab: 'queue', isSellerProtected: false };
      }
      if (path === '/history') {
        return { role: 'CUSTOMER', tab: 'history', isSellerProtected: false };
      }
      return { role: 'CUSTOMER', tab: 'menu', isSellerProtected: false };
    },
    []
  );

  // Central Navigation Handler
  const navigateToTab = useCallback(
    (targetTab: string, replaceUrl = false) => {
      const targetPath = getPathForTab(targetTab);
      const isSellerTab = targetTab.startsWith('seller-');

      if (isSellerTab) {
        if (!isSellerUnlocked()) {
          // Trigger password prompt
          setPendingTab(targetTab);
          setAuthModalMode(hasSellerPassword() ? 'LOGIN' : 'CREATE');
          setIsAuthModalOpen(true);
          return;
        }

        // Unlocked seller access
        setActiveRole('SELLER');
        setCurrentTab(targetTab);
        localStorage.setItem('kantin_active_role', 'SELLER');
        if (replaceUrl) {
          window.history.replaceState({}, '', targetPath);
        } else {
          window.history.pushState({}, '', targetPath);
        }
      } else {
        // Customer tab
        setActiveRole('CUSTOMER');
        setCurrentTab(targetTab);
        localStorage.setItem('kantin_active_role', 'CUSTOMER');
        if (replaceUrl) {
          window.history.replaceState({}, '', targetPath);
        } else {
          window.history.pushState({}, '', targetPath);
        }
      }
    },
    []
  );

  // Initial load: parse current URL path and listen for back/forward popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const { role, tab, isSellerProtected } = resolveRoute(window.location.pathname);

      if (isSellerProtected) {
        if (isSellerUnlocked()) {
          setActiveRole('SELLER');
          setCurrentTab(tab);
          localStorage.setItem('kantin_active_role', 'SELLER');
        } else {
          // Protected route accessed without session: open password modal
          setPendingTab(tab);
          setAuthModalMode(hasSellerPassword() ? 'LOGIN' : 'CREATE');
          setIsAuthModalOpen(true);
          // Keep role customer for safe background display
          setActiveRole('CUSTOMER');
          setCurrentTab('menu');
        }
      } else {
        setActiveRole('CUSTOMER');
        setCurrentTab(tab);
        localStorage.setItem('kantin_active_role', 'CUSTOMER');
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [resolveRoute]);

  // Auth Modal Callbacks
  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    const destination = pendingTab || 'seller-orders';
    setPendingTab(null);
    setActiveRole('SELLER');
    setCurrentTab(destination);
    localStorage.setItem('kantin_active_role', 'SELLER');
    window.history.pushState({}, '', getPathForTab(destination));
  };

  const handleAuthClose = () => {
    setIsAuthModalOpen(false);
    setPendingTab(null);
    // If currently on seller tab without valid session, fallback to menu
    if (activeRole === 'SELLER' && !isSellerUnlocked()) {
      setActiveRole('CUSTOMER');
      setCurrentTab('menu');
      localStorage.setItem('kantin_active_role', 'CUSTOMER');
      window.history.pushState({}, '', '/');
    }
  };

  const handleOpenChangePassword = () => {
    setAuthModalMode('CHANGE_PASSWORD');
    setIsAuthModalOpen(true);
  };

  const handleSellerLogout = () => {
    sessionStorage.removeItem('kantin_seller_session');
    setActiveRole('CUSTOMER');
    setCurrentTab('menu');
    localStorage.setItem('kantin_active_role', 'CUSTOMER');
    window.history.pushState({}, '', '/');
  };

  const handleRequestSellerLogin = (targetTab: string = 'seller-orders') => {
    if (isSellerUnlocked()) {
      setActiveRole('SELLER');
      setCurrentTab(targetTab);
      localStorage.setItem('kantin_active_role', 'SELLER');
      window.history.pushState({}, '', getPathForTab(targetTab));
    } else {
      setPendingTab(targetTab);
      setAuthModalMode(hasSellerPassword() ? 'LOGIN' : 'CREATE');
      setIsAuthModalOpen(true);
    }
  };

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    navigateToTab('payment');
  };

  const handlePaymentConfirmed = (order: Order) => {
    setActiveOrder(order);
    navigateToTab('queue');
  };

  const handleSelectHistoryOrder = (order: Order) => {
    setActiveOrder(order);
    navigateToTab('queue');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        {/* Navbar only shown when NOT on fullscreen display */}
        {currentTab !== 'seller-display' && (
          <Navbar
            currentTab={currentTab}
            onNavigate={(tab) => navigateToTab(tab)}
            activeRole={activeRole}
            onRequestSellerLogin={handleRequestSellerLogin}
            onOpenChangePassword={handleOpenChangePassword}
            onSellerLogout={handleSellerLogout}
          />
        )}

        <main className="flex-1">
          {activeRole === 'CUSTOMER' ? (
            <>
              {currentTab === 'menu' && (
                <MenuPage onNavigateToCart={() => navigateToTab('cart')} />
              )}
              {currentTab === 'cart' && (
                <CartPage
                  onNavigateToMenu={() => navigateToTab('menu')}
                  onOrderCreated={handleOrderCreated}
                />
              )}
              {currentTab === 'payment' && activeOrder && (
                <PaymentInstructionPage
                  order={activeOrder}
                  onPaymentConfirmed={handlePaymentConfirmed}
                  onNavigateToQueue={() => navigateToTab('queue')}
                />
              )}
              {currentTab === 'queue' && (
                <QueueStatusPage
                  currentOrder={activeOrder}
                  onNavigateToMenu={() => navigateToTab('menu')}
                />
              )}
              {currentTab === 'history' && (
                <OrderHistoryPage
                  onSelectOrder={handleSelectHistoryOrder}
                  onNavigateToMenu={() => navigateToTab('menu')}
                />
              )}
            </>
          ) : (
            <>
              {/* If user somehow is on SELLER role without unlock, show lock banner */}
              {!isSellerUnlocked() ? (
                <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900 mb-2">Akses Terkunci</h2>
                  <p className="text-xs text-gray-500 mb-6">
                    Halaman ini memerlukan otentikasi password penjual kantin.
                  </p>
                  <button
                    onClick={() => handleRequestSellerLogin(currentTab)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20"
                  >
                    Buka dengan Password
                  </button>
                </div>
              ) : (
                <>
                  {currentTab === 'seller-orders' && <SellerDashboardPage />}
                  {currentTab === 'seller-menus' && <SellerMenuPage />}
                  {currentTab === 'seller-display' && (
                    <SellerQueueDisplayPage
                      onBackToDashboard={() => navigateToTab('seller-orders')}
                    />
                  )}
                </>
              )}
            </>
          )}
        </main>

        {currentTab !== 'seller-display' && <Footer />}

        {/* Modal Password Guard */}
        <SellerAuthModal
          isOpen={isAuthModalOpen}
          mode={authModalMode}
          onSuccess={handleAuthSuccess}
          onClose={handleAuthClose}
        />
      </div>
    </CartProvider>
  );
};

export default App;
