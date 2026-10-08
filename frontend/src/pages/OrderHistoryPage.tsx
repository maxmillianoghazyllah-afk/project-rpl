import React, { useState, useEffect } from 'react';
import { History, Eye, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { Order } from '../types';

interface OrderHistoryPageProps {
  onSelectOrder: (order: Order) => void;
  onNavigateToMenu: () => void;
}

export const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({
  onSelectOrder,
  onNavigateToMenu,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders('CUSTOMER');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching order history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Menunggu Bayar</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Masuk Antrean</span>;
      case 'PREPARING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">Sedang Dimasak</span>;
      case 'READY':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Siap Diambil</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Selesai</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Dibatalkan</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <History className="w-6 h-6 text-brand-600" /> Riwayat Pesanan Saya
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Daftar seluruh pesanan makanan yang pernah kamu lakukan di kantin.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-gray-200" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-bold">Belum Ada Riwayat Pesanan</p>
          <p className="text-xs text-gray-400 mt-1">Ayo pesan makanan lezat di kantin sekarang!</p>
          <button
            onClick={onNavigateToMenu}
            className="mt-5 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-brand-700 transition"
          >
            Buka Katalog Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-900">{ord.orderNumber}</span>
                  {getStatusBadge(ord.status)}
                  {ord.queue && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-brand-600 text-white">
                      No. {ord.queue.queueNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(ord.createdAt).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </p>
                <p className="text-xs text-gray-700 line-clamp-1 pt-1">
                  {ord.items.map((i) => `${i.menu?.name || 'Item'} (x${i.quantity})`).join(', ')}
                </p>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
                <div className="text-sm font-black text-brand-600">
                  Rp {ord.totalAmount.toLocaleString('id-ID')}
                </div>
                <button
                  onClick={() => onSelectOrder(ord)}
                  className="mt-2 px-3.5 py-1.5 bg-brand-50 text-brand-600 hover:bg-brand-100 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Pantau Antrean
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
