import React, { useState, useEffect, useCallback } from 'react';
import { Utensils } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MenuPage } from './pages/MenuPage';
import { CartPage } from './pages/CartPage';
import { PaymentInstructionPage } from './pages/PaymentInstructionPage';
import { QueueStatusPage } from './pages/QueueStatusPage';
import { SellerDashboardPage } from './pages/seller/SellerDashboardPage';
import { SellerMenuPage } from './pages/seller/SellerMenuPage';
import { SellerQueueDisplayPage } from './pages/seller/SellerQueueDisplayPage';
import { SellerAuthModal, AuthModalMode } from './components/SellerAuthModal';
import { Order, UserRole } from './types';

function getSubpathPrefix(): string {
  const segments = window.location.pathname.split('/').filter(Boolean);
  if (
    segments.length > 0 &&
    !['seller', 'cart', 'payment', 'queue', 'history', 'api'].includes(segments[0].toLowerCase())
  ) {
    return '/' + segments[0];
  }
  return '';
}

function parseUrlRoute(): { role: UserRole; tab: string; isProtected: boolean } {
  let path = window.location.pathname.toLowerCase();
  const prefix = getSubpathPrefix().toLowerCase();
  if (prefix && path.startsWith(prefix)) {
    path = path.slice(prefix.length) || '/';
  }

  if (path === '/seller/display') {
    return { role: 'SELLER', tab: 'seller-display', isProtected: true };
  }
  if (path === '/seller/menus') {
    return { role: 'SELLER', tab: 'seller-menus', isProtected: true };
  }
  if (path.startsWith('/seller')) {
    return { role: 'SELLER', tab: 'seller-orders', isProtected: true };
  }
  if (path === '/cart') {
    return { role: 'CUSTOMER', tab: 'cart', isProtected: false };
  }
  if (path === '/queue' || path === '/history') {
    return { role: 'CUSTOMER', tab: 'queue', isProtected: false };
  }
  if (path === '/payment') {
    return { role: 'CUSTOMER', tab: 'payment', isProtected: false };
  }

  return { role: 'CUSTOMER', tab: 'menu', isProtected: false };
}

function getPathForTab(tab: string): string {
  const prefix = getSubpathPrefix();
  let subRoute = '/';
  switch (tab) {
    case 'menu':
      subRoute = '/';
      break;
    case 'cart':
      subRoute = '/cart';
      break;
    case 'payment':
      subRoute = '/payment';
      break;
    case 'queue':
      subRoute = '/queue';
      break;
    case 'history':
      subRoute = '/history';
      break;
    case 'seller-orders':
      subRoute = '/seller';
      break;
    case 'seller-menus':
      subRoute = '/seller/menus';
      break;
    case 'seller-display':
      subRoute = '/seller/display';
      break;
    default:
      subRoute = '/';
  }
  return prefix ? (subRoute === '/' ? `${prefix}/` : `${prefix}${subRoute}`) : subRoute;
}

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>('CUSTOMER');
  const [currentTab, setCurrentTab] = useState<string>('menu');
  // Bug Fix Issue #4: Persistensi activeOrder ke sessionStorage agar tidak hilang saat refresh
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    try {
      const saved = sessionStorage.getItem('kantin_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const updateActiveOrder = useCallback((order: Order | null) => {
    setActiveOrder(order);
    if (order) {
      try {
        sessionStorage.setItem('kantin_active_order', JSON.stringify(order));
      } catch (e) {
        console.error('Failed to persist active order', e);
      }
    } else {
      sessionStorage.removeItem('kantin_active_order');
    }
  }, []);

  // Seller Auth Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('VERIFY');
  const [pendingSellerTab, setPendingSellerTab] = useState<string>('seller-orders');

  // Change tab and sync with browser URL history
  const navigateToTab = useCallback((tab: string, role?: UserRole) => {
    const targetRole = role || (tab.startsWith('seller-') ? 'SELLER' : 'CUSTOMER');
    setActiveRole(targetRole);
    setCurrentTab(tab);
    localStorage.setItem('kantin_active_role', targetRole);

    const path = getPathForTab(tab);
    if (window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  }, []);

  // Request seller access with password protection check
  const requestSellerAccess = useCallback((targetTab = 'seller-orders') => {
    const isSellerAuthenticated = sessionStorage.getItem('kantin_seller_session') === 'true';
    const hasExistingPassword = !!localStorage.getItem('kantin_seller_password');

    if (isSellerAuthenticated) {
      navigateToTab(targetTab, 'SELLER');
      return;
    }

    setPendingSellerTab(targetTab);
    if (!hasExistingPassword) {
      setAuthModalMode('SETUP');
    } else {
      setAuthModalMode('VERIFY');
    }
    setIsAuthModalOpen(true);
  }, [navigateToTab]);

  // Initial load: parse route and check protection
  useEffect(() => {
    const route = parseUrlRoute();

    if (route.isProtected) {
      const isSellerAuthenticated = sessionStorage.getItem('kantin_seller_session') === 'true';
      if (isSellerAuthenticated) {
        setActiveRole('SELLER');
        setCurrentTab(route.tab);
      } else {
        // Require password
        requestSellerAccess(route.tab);
        // Default safe customer view while waiting
        setActiveRole('CUSTOMER');
        setCurrentTab('menu');
      }
    } else {
      setActiveRole(route.role);
      setCurrentTab(route.tab);
    }

    // Handle browser back and forward buttons
    const handlePopState = () => {
      const currentRoute = parseUrlRoute();
      if (currentRoute.isProtected) {
        const isAuthed = sessionStorage.getItem('kantin_seller_session') === 'true';
        if (isAuthed) {
          setActiveRole('SELLER');
          setCurrentTab(currentRoute.tab);
        } else {
          requestSellerAccess(currentRoute.tab);
          setActiveRole('CUSTOMER');
          setCurrentTab('menu');
        }
      } else {
        setActiveRole(currentRoute.role);
        setCurrentTab(currentRoute.tab);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [requestSellerAccess]);

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
    if (authModalMode === 'SETUP' || authModalMode === 'VERIFY') {
      navigateToTab(pendingSellerTab, 'SELLER');
    }
  };

  const handleAuthClose = () => {
    setIsAuthModalOpen(false);
    // If not authenticated and on a seller URL, revert back to customer menu
    if (activeRole !== 'SELLER') {
      navigateToTab('menu', 'CUSTOMER');
    }
  };

  const handleLockSeller = () => {
    sessionStorage.removeItem('kantin_seller_session');
    navigateToTab('menu', 'CUSTOMER');
  };

  const handleRequestChangePassword = () => {
    setAuthModalMode('CHANGE_PASSWORD');
    setIsAuthModalOpen(true);
  };

  const handleOrderCreated = (order: Order) => {
    updateActiveOrder(order);
    navigateToTab('payment', 'CUSTOMER');
  };

  const handlePaymentConfirmed = (order: Order) => {
    updateActiveOrder(order);
    navigateToTab('queue', 'CUSTOMER');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            if (tab.startsWith('seller-')) {
              requestSellerAccess(tab);
            } else {
              navigateToTab(tab, 'CUSTOMER');
            }
          }}
          activeRole={activeRole}
          onRequestSellerAccess={() => requestSellerAccess('seller-orders')}
          onRequestChangePassword={handleRequestChangePassword}
          onLockSeller={handleLockSeller}
        />

        <main className="flex-1">
          {activeRole === 'CUSTOMER' ? (
            <>
              {currentTab === 'menu' && (
                <MenuPage onNavigateToCart={() => navigateToTab('cart', 'CUSTOMER')} />
              )}
              {currentTab === 'cart' && (
                <CartPage
                  onNavigateToMenu={() => navigateToTab('menu', 'CUSTOMER')}
                  onOrderCreated={handleOrderCreated}
                />
              )}
              {currentTab === 'payment' && (
                activeOrder ? (
                  <PaymentInstructionPage
                    order={activeOrder}
                    onPaymentConfirmed={handlePaymentConfirmed}
                    onNavigateToQueue={() => navigateToTab('queue', 'CUSTOMER')}
                  />
                ) : (
                  <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                    <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Utensils className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Tidak Ada Tagihan Aktif</h2>
                    <p className="text-xs sm:text-sm text-gray-500 mb-6 max-w-md mx-auto">
                      Anda belum memiliki pesanan yang menunggu pembayaran. Silakan pilih menu dan buat pesanan terlebih dahulu.
                    </p>
                    <button
                      onClick={() => navigateToTab('menu', 'CUSTOMER')}
                      className="px-6 py-2.5 bg-brand-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-brand-700 transition shadow-sm"
                    >
                      Lihat Katalog Menu
                    </button>
                  </div>
                )
              )}
              {currentTab === 'queue' && (
                <QueueStatusPage
                  currentOrder={activeOrder}
                  onNavigateToMenu={() => navigateToTab('menu', 'CUSTOMER')}
                />
              )}
            </>
          ) : (
            <>
              {currentTab === 'seller-orders' && (
                <SellerDashboardPage
                  onNavigateToTab={(tab) => navigateToTab(tab, 'SELLER')}
                  onRequestChangePassword={handleRequestChangePassword}
                />
              )}
              {currentTab === 'seller-menus' && <SellerMenuPage />}
              {currentTab === 'seller-display' && (
                <SellerQueueDisplayPage
                  onBackToDashboard={() => navigateToTab('seller-orders', 'SELLER')}
                />
              )}
            </>
          )}
        </main>

        {currentTab !== 'seller-display' && <Footer />}

        {/* Seller Password Authentication & Management Modal */}
        <SellerAuthModal
          isOpen={isAuthModalOpen}
          mode={authModalMode}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
        />
      </div>
    </CartProvider>
  );
};

export default App;
