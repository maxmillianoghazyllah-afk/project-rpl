import React, { useState } from 'react';
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
import { Order, UserRole } from './types';

export const App: React.FC = () => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('kantin_active_role') as UserRole) || 'CUSTOMER';
  });
  const [currentTab, setCurrentTab] = useState<string>('menu');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const handleOrderCreated = (order: Order) => {
    setActiveOrder(order);
    setCurrentTab('payment');
  };

  const handlePaymentConfirmed = (order: Order) => {
    setActiveOrder(order);
    setCurrentTab('queue');
  };

  const handleSelectHistoryOrder = (order: Order) => {
    setActiveOrder(order);
    setCurrentTab('queue');
  };

  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
        />

        <main className="flex-1">
          {activeRole === 'CUSTOMER' ? (
            <>
              {currentTab === 'menu' && (
                <MenuPage onNavigateToCart={() => setCurrentTab('cart')} />
              )}
              {currentTab === 'cart' && (
                <CartPage
                  onNavigateToMenu={() => setCurrentTab('menu')}
                  onOrderCreated={handleOrderCreated}
                />
              )}
              {currentTab === 'payment' && activeOrder && (
                <PaymentInstructionPage
                  order={activeOrder}
                  onPaymentConfirmed={handlePaymentConfirmed}
                  onNavigateToQueue={() => setCurrentTab('queue')}
                />
              )}
              {currentTab === 'queue' && (
                <QueueStatusPage
                  currentOrder={activeOrder}
                  onNavigateToMenu={() => setCurrentTab('menu')}
                />
              )}
              {currentTab === 'history' && (
                <OrderHistoryPage
                  onSelectOrder={handleSelectHistoryOrder}
                  onNavigateToMenu={() => setCurrentTab('menu')}
                />
              )}
            </>
          ) : (
            <>
              {currentTab === 'seller-orders' && <SellerDashboardPage />}
              {currentTab === 'seller-menus' && <SellerMenuPage />}
              {currentTab === 'seller-display' && <SellerQueueDisplayPage />}
            </>
          )}
        </main>

        {currentTab !== 'seller-display' && <Footer />}
      </div>
    </CartProvider>
  );
};

export default App;
