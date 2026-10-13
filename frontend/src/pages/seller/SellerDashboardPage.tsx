import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  ChefHat,
  BellRing,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  Utensils,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const SellerDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.getOrders('SELLER');
      setOrders(data);
    } catch (err) {
      console.error('Error fetching seller orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (orderId: number, action: 'APPROVE' | 'REJECT') => {
    try {
      setActionLoading(orderId);
      await api.decidePayment(orderId, action);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal memproses pembayaran');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      setActionLoading(orderId);
      await api.updateOrderStatus(orderId, status);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah status');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterTab === 'need_confirmation') {
      return ord.status === 'WAITING_PAYMENT' && ord.payment?.status === 'PENDING';
    }
    if (filterTab === 'in_progress') {
      return ord.status === 'CONFIRMED' || ord.status === 'PREPARING';
    }
    if (filterTab === 'ready') {
      return ord.status === 'READY';
    }
    if (filterTab === 'completed') {
      return ord.status === 'COMPLETED';
    }
    return true;
  });

  const countNeedConfirm = orders.filter(
    (o) => o.status === 'WAITING_PAYMENT' && o.payment?.status === 'PENDING'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Utensils className="w-6 h-6 text-brand-600" /> Pengelolaan Pesanan Kantin
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Periksa konfirmasi pembayaran QRIS dan atur alur persiapan pesanan mahasiswa.
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          Segarkan
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'all'
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          onClick={() => setFilterTab('need_confirmation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            filterTab === 'need_confirmation'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          Perlu Konfirmasi Bayar {countNeedConfirm > 0 && `(${countNeedConfirm})`}
        </button>
        <button
          onClick={() => setFilterTab('in_progress')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            filterTab === 'in_progress'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-white text-purple-700 hover:bg-purple-50 border border-purple-200'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          Sedang Dimasak
        </button>
        <button
          onClick={() => setFilterTab('ready')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
            filterTab === 'ready'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <BellRing className="w-3.5 h-3.5" />
          Siap Diambil
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filterTab === 'completed'
              ? 'bg-gray-700 text-white shadow-sm'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          Selesai
        </button>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
          <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 font-bold text-sm">Tidak ada pesanan pada kategori ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map((ord) => {
            const isProcessing = actionLoading === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Row */}
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <span className="font-mono text-xs font-black text-gray-900 block">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Pemesan: <strong className="text-gray-700">{ord.user?.name || 'Mahasiswa'}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      {ord.queue ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-brand-600 text-white shadow-sm">
                          Antrean: {ord.queue.queueNumber}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                          {ord.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="py-4 space-y-2">
                    {ord.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-800 font-medium">
                          {item.menu?.name} <span className="text-gray-400 font-bold">x{item.quantity}</span>
                        </span>
                        <span className="text-gray-700 font-semibold">
                          Rp {item.subtotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment & Total info */}
                  <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 mb-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Total Tagihan QRIS</span>
                      <span className="text-base font-extrabold text-brand-600">
                        Rp {ord.totalAmount.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-gray-500 block text-[10px]">Status Pembayaran</span>
                      <span
                        className={`font-bold text-xs ${
                          ord.payment?.status === 'PAID'
                            ? 'text-emerald-600'
                            : ord.payment?.status === 'REJECTED'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {ord.payment?.status || 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Proof link if available */}
                  {ord.payment?.proofUrl && (
                    <div className="mb-4 text-xs text-gray-500 flex items-center gap-1.5 bg-blue-50 p-2 rounded-xl border border-blue-100">
                      <span className="text-[11px] text-blue-800 font-medium">Catatan Mahasiswa:</span>
                      <span className="text-blue-900 font-semibold truncate">{ord.payment.proofUrl}</span>
                    </div>
                  )}
                </div>

                {/* Seller Actions */}
                <div className="pt-3 border-t border-gray-100">
                  {ord.status === 'WAITING_PAYMENT' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(ord.id, 'APPROVE')}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Setujui Pembayaran (Berikan No. Antrean)
                      </button>
                      <button
                        onClick={() => handleDecision(ord.id, 'REJECT')}
                        disabled={isProcessing}
                        className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Tolak
                      </button>
                    </div>
                  ) : ord.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'PREPARING')}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <ChefHat className="w-4 h-4" />
                      Mulai Siapkan / Masak Pesanan
                    </button>
                  ) : ord.status === 'PREPARING' ? (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'READY')}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <BellRing className="w-4 h-4" />
                      Tandai Siap Diambil di Konter
                    </button>
                  ) : ord.status === 'READY' ? (
                    <button
                      onClick={() => handleStatusChange(ord.id, 'COMPLETED')}
                      disabled={isProcessing}
                      className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Pesanan Selesai Diambil Mahasiswa
                    </button>
                  ) : (
                    <div className="text-center py-1 text-xs text-gray-400 font-semibold">
                      Pesanan telah selesai atau dibatalkan.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
