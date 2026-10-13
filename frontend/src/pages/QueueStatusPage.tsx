import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, RefreshCw, ChefHat, BellRing, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order, QueueResponse } from '../types';

interface QueueStatusPageProps {
  currentOrder: Order | null;
  onNavigateToMenu: () => void;
}

export const QueueStatusPage: React.FC<QueueStatusPageProps> = ({ currentOrder, onNavigateToMenu }) => {
  const [order, setOrder] = useState<Order | null>(currentOrder);
  const [queueInfo, setQueueInfo] = useState<QueueResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLatestData();
    const interval = setInterval(fetchLatestData, 4000); // Polling status every 4 seconds
    return () => clearInterval(interval);
  }, [currentOrder]);

  const fetchLatestData = async () => {
    try {
      const qData = await api.getQueue();
      setQueueInfo(qData);

      if (order?.id) {
        const latestOrder = await api.getOrderById(order.id);
        setOrder(latestOrder);
      } else {
        // If no active order passed, load latest customer order
        const orders = await api.getOrders('CUSTOMER');
        if (orders.length > 0) {
          setOrder(orders[0]);
        }
      }
    } catch (err) {
      console.error('Error polling queue data', err);
    }
  };

  const manualRefresh = async () => {
    setLoading(true);
    await fetchLatestData();
    setLoading(false);
  };

  // Determine stage
  const getStageIndex = (status?: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return 0;
      case 'CONFIRMED':
        return 1;
      case 'PREPARING':
        return 2;
      case 'READY':
        return 3;
      case 'COMPLETED':
        return 4;
      default:
        return 0;
    }
  };

  const stages = [
    { title: 'Menunggu Pembayaran', desc: 'Selesaikan transfer via QRIS' },
    { title: 'Masuk Antrean', desc: 'Pembayaran disetujui penjual' },
    { title: 'Sedang Disiapkan', desc: 'Koki kantin sedang memasak' },
    { title: 'Siap Diambil!', desc: 'Silakan ambil di meja konter' },
    { title: 'Selesai', desc: 'Pesanan telah diambil' },
  ];

  const currentStage = getStageIndex(order?.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header and Refresh */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-brand-600" /> Pantau Antrean Kantin
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Status pesanan dan nomor giliran Anda diperbarui secara berkala.
          </p>
        </div>
        <button
          onClick={manualRefresh}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          Segarkan Data
        </button>
      </div>

      {/* Main Queue Dashboard Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Your Queue Card */}
        <div className="bg-gradient-to-br from-brand-600 to-amber-600 rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider uppercase text-amber-200 bg-black/20 px-3 py-1 rounded-full">
                Nomor Antrean Anda
              </span>
              <span className="text-xs text-orange-100 font-mono">
                {order ? order.orderNumber : 'Belum Ada Pesanan'}
              </span>
            </div>

            <div className="text-center py-6">
              {order?.queue ? (
                <div className="text-6xl sm:text-7xl font-black tracking-tight font-mono text-white drop-shadow-md">
                  {order.queue.queueNumber}
                </div>
              ) : (
                <div className="py-2">
                  <div className="text-2xl font-bold text-amber-100">Menunggu Persetujuan</div>
                  <p className="text-xs text-amber-200 mt-1">
                    Nomor antrean akan muncul setelah penjual mengonfirmasi pembayaran QRIS Anda.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-amber-100">Status Saat Ini:</span>
            <span className="font-extrabold bg-white text-brand-600 px-3 py-1 rounded-lg shadow-sm uppercase tracking-wide">
              {order?.status || 'TIDAK ADA'}
            </span>
          </div>

          {/* Decorative bubble */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Counter Live Processing Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-gray-400">
                Papan Pemanggil Konter
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Kantin
              </span>
            </div>

            <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <span className="text-xs text-gray-500 font-semibold block">Sedang Disiapkan / Dipanggil:</span>
              <span className="text-5xl font-black font-mono text-gray-900 tracking-tight">
                {queueInfo?.currentProcessingNumber || '-'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-gray-100 pt-4">
            <div className="bg-amber-50 p-2 rounded-xl border border-amber-100">
              <span className="block text-[10px] text-amber-700 font-bold uppercase">Antre</span>
              <span className="text-base font-black text-amber-900">{queueInfo?.totalWaiting || 0}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded-xl border border-blue-100">
              <span className="block text-[10px] text-blue-700 font-bold uppercase">Dimasak</span>
              <span className="text-base font-black text-blue-900">{queueInfo?.totalInProgress || 0}</span>
            </div>
            <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
              <span className="block text-[10px] text-emerald-700 font-bold uppercase">Siap</span>
              <span className="text-base font-black text-emerald-900">{queueInfo?.totalReady || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Progress Stepper */}
      {order && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-600" /> Tahapan Proses Pesanan
          </h2>

          <div className="relative">
            {/* Progress line */}
            <div className="hidden sm:block absolute top-1/2 left-6 right-6 h-1 bg-gray-100 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
              {stages.map((stg, index) => {
                const isPassed = index <= currentStage;
                const isCurrent = index === currentStage;

                return (
                  <div key={stg.title} className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                        isCurrent
                          ? 'bg-brand-600 text-white ring-4 ring-brand-100 scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                      }`}
                    >
                      {isPassed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                    </div>
                    <div>
                      <h4
                        className={`text-xs font-bold ${
                          isCurrent ? 'text-brand-600' : isPassed ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {stg.title}
                      </h4>
                      <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Details & Summary Card */}
      {order ? (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Rincian Menu Pesanan</h3>
              <p className="text-xs text-gray-500">Nomor: {order.orderNumber}</p>
            </div>
            <span className="text-sm font-black text-brand-600">
              Total: Rp {order.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-gray-900">{item.menu?.name || 'Menu Makanan'}</span>
                  <span className="text-gray-400 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-semibold text-gray-700">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 font-semibold">Belum ada pesanan aktif.</p>
          <button
            onClick={onNavigateToMenu}
            className="mt-4 px-6 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-700 transition"
          >
            Pesan Menu Sekarang
          </button>
        </div>
      )}
    </div>
  );
};
