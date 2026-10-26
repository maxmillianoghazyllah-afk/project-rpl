import React, { useState, useEffect, useRef } from 'react';
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
  QrCode,
  UploadCloud,
  Image as ImageIcon,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

export const SellerDashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // QR Code Settings State
  const [customQr, setCustomQr] = useState<string | null>(() => {
    return localStorage.getItem('kantin_seller_qr_image');
  });
  const [qrMessage, setQrMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Upload Custom QR Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) {
      alert('Format file tidak didukung! Harap unggah gambar berformat .png, .jpg, atau .jpeg.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        localStorage.setItem('kantin_seller_qr_image', result);
        setCustomQr(result);
        window.dispatchEvent(new Event('storage'));
        setQrMessage('Foto QR Code kantin berhasil diperbarui! Mahasiswa akan menggunakan QR ini.');
        setTimeout(() => setQrMessage(null), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetQr = () => {
    localStorage.removeItem('kantin_seller_qr_image');
    setCustomQr(null);
    window.dispatchEvent(new Event('storage'));
    setQrMessage('QR Code telah dikembalikan ke QRIS bawaan sistem.');
    setTimeout(() => setQrMessage(null), 4000);
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

      {/* QR Code Upload Management Section */}
      <div className="mb-8 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/50">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
              {customQr ? (
                <img
                  src={customQr}
                  alt="Custom QR Thumbnail"
                  className="w-11 h-11 object-cover rounded-xl"
                />
              ) : (
                <QrCode className="w-8 h-8 text-emerald-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">QR Code Pembayaran Kantin (QRIS)</h3>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                    customQr
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-400/40'
                      : 'bg-white/10 text-gray-300 border border-white/10'
                  }`}
                >
                  {customQr ? 'QR Toko Kustom Aktif' : 'QRIS Default Sistem'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/80 mt-1 max-w-xl leading-relaxed">
                Anda dapat mengunggah foto QR Code QRIS milik toko kantin Anda sendiri (format{' '}
                <strong className="text-white">.jpg</strong> atau{' '}
                <strong className="text-white">.png</strong>). Gambar QR ini akan langsung
                ditampilkan kepada mahasiswa saat mereka membayar.
              </p>
              {qrMessage && (
                <div className="mt-2 text-xs font-bold text-emerald-300 flex items-center gap-1.5 animate-fadeIn">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  {qrMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              {customQr ? 'Ganti Foto QR' : 'Unggah Foto QR (.jpg/.png)'}
            </button>
            {customQr && (
              <button
                onClick={handleResetQr}
                title="Gunakan QR Default Sistem"
                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                Reset Default
              </button>
            )}
          </div>
        </div>
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
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-64 border border-gray-100 animate-pulse p-4"
            />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-sm">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-base">Tidak ada pesanan pada filter ini</h3>
          <p className="text-xs text-gray-500 mt-1">
            Pesanan mahasiswa akan otomatis masuk dan terupdate secara berkala.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((ord) => {
            const isProcessing = actionLoading === ord.id;
            return (
              <div
                key={ord.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition"
              >
                {/* Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-gray-500">
                      {ord.orderNumber}
                    </span>
                    {ord.queue?.queueNumber && (
                      <span className="font-mono text-sm font-black bg-brand-50 text-brand-700 border border-brand-200 px-2.5 py-1 rounded-xl">
                        Antrean: {ord.queue.queueNumber}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {ord.user?.name || 'Mahasiswa'}
                      </h4>
                      <span className="text-[11px] text-gray-400">
                        {new Date(ord.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        ord.status === 'WAITING_PAYMENT'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : ord.status === 'CONFIRMED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : ord.status === 'PREPARING'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : ord.status === 'READY'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 flex-1 space-y-2 text-xs">
                  <div className="font-semibold text-gray-500 text-[11px] uppercase tracking-wider mb-1">
                    Daftar Menu:
                  </div>
                  {ord.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-gray-800">
                      <span>
                        <span className="font-bold text-brand-600 mr-1.5">{item.quantity}x</span>
                        {item.menu?.name || 'Menu'}
                      </span>
                      <span className="font-medium text-gray-500">
                        Rp {item.subtotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}

                  {/* Payment Info */}
                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between font-bold">
                    <span className="text-gray-900">Total Tagihan</span>
                    <span className="text-brand-600 text-sm">
                      Rp {ord.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {ord.payment?.proofUrl && (
                    <div className="pt-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded-xl">
                      <strong>Catatan Bukti:</strong> {ord.payment.proofUrl}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 bg-gray-50/70 border-t border-gray-100">
                  {ord.status === 'WAITING_PAYMENT' && ord.payment?.status === 'PENDING' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(ord.id, 'APPROVE')}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Setujui Pembayaran
                      </button>
                      <button
                        onClick={() => handleDecision(ord.id, 'REJECT')}
                        disabled={isProcessing}
                        className="px-3 py-2.5 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition"
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
