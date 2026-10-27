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
  Monitor,
  KeyRound,
  QrCode,
  Upload,
  X,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { Order } from '../../types';

interface SellerDashboardPageProps {
  onNavigateToTab?: (tab: string) => void;
  onRequestChangePassword?: () => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardPageProps> = ({
  onNavigateToTab,
  onRequestChangePassword,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // QRIS Custom Upload states
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisPreview, setQrisPreview] = useState<string | null>(null);
  const [qrisSuccessMsg, setQrisSuccessMsg] = useState<string | null>(null);

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

  const handleDeleteOrder = async (orderId: number, orderNumber: string) => {
    if (!confirm(`Hapus antrean pesanan ${orderNumber}?\nAntrean ini akan dihapus agar tidak menumpuk.`)) {
      return;
    }
    try {
      await api.deleteOrder(orderId);
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pesanan');
    }
  };

  const handleClearAllOrders = async () => {
    if (
      !confirm(
        'Hapus SEMUA antrean & pesanan yang ada?\nSemua antrean yang selesai dan riwayat akan dibersihkan agar daftar antrean tidak menumpuk.'
      )
    ) {
      return;
    }
    try {
      await api.clearAllOrders();
      await loadOrders();
    } catch (err: any) {
      alert(err.message || 'Gagal membersihkan antrean');
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

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setQrisPreview(localStorage.getItem('kantin_custom_qris'));
              setShowQrisModal(true);
            }}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            title="Unggah QRIS Toko Kantin (PNG/JPG)"
          >
            <QrCode className="w-3.5 h-3.5 text-purple-600" />
            Unggah QRIS Toko
          </button>

          {onRequestChangePassword && (
            <button
              onClick={onRequestChangePassword}
              className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="Ganti Password Akses Penjual"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              Ganti Password
            </button>
          )}

          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('seller-display')}
              className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="Buka Layar Display TV Konter"
            >
              <Monitor className="w-3.5 h-3.5 text-amber-400" />
              Buka Display TV
            </button>
          )}

          <button
            onClick={loadOrders}
            disabled={loading}
            className="px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
            Segarkan
          </button>

          <button
            onClick={handleClearAllOrders}
            disabled={orders.length === 0}
            className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-40"
            title="Bersihkan semua antrean yang sudah selesai agar tidak menumpuk"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Bersihkan Semua Antrean
          </button>
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

                    <div className="flex items-center gap-2">
                      {ord.queue ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-mono font-black bg-brand-600 text-white shadow-sm">
                          Antrean: {ord.queue.queueNumber}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                          {ord.status}
                        </span>
                      )}

                      <button
                        onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus antrean pesanan ini agar tidak menumpuk"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
      {/* QRIS Upload Modal */}
      {showQrisModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 animate-in fade-in duration-150">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-gray-900">Pengaturan QRIS Toko</h3>
                  <p className="text-[11px] text-gray-500">Unggah QRIS khusus dalam format PNG atau JPG</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowQrisModal(false);
                  setQrisSuccessMsg(null);
                }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {qrisSuccessMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                {qrisSuccessMsg}
              </div>
            )}

            {/* Preview Box */}
            <div className="mb-4 text-center">
              <label className="block text-xs font-bold text-gray-700 mb-2 text-left">
                Tampilan QRIS yang Aktif:
              </label>
              <div className="w-48 h-48 mx-auto bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center p-2 overflow-hidden shadow-inner">
                {qrisPreview ? (
                  <img
                    src={qrisPreview}
                    alt="Preview QRIS"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-gray-400 text-xs font-medium p-4 text-center">
                    <QrCode className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Belum ada QRIS custom. Masih menggunakan QRIS sistem bawaan.
                  </div>
                )}
              </div>
            </div>

            {/* Upload File Input */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Pilih File Gambar Baru (.png atau .jpg)
              </label>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!file.type.includes('image/png') && !file.type.includes('image/jpeg') && !file.type.includes('image/jpg')) {
                      alert('Format file tidak didukung! Harap unggah file PNG atau JPG.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setQrisPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Gambar QRIS ini akan otomatis tampil di layar checkout mahasiswa.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  if (!qrisPreview) {
                    alert('Silakan pilih file gambar QRIS terlebih dahulu!');
                    return;
                  }
                  localStorage.setItem('kantin_custom_qris', qrisPreview);
                  setQrisSuccessMsg('QRIS kustom berhasil disimpan dan diaktifkan!');
                  setTimeout(() => {
                    setShowQrisModal(false);
                    setQrisSuccessMsg(null);
                  }, 1200);
                }}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                Simpan & Pasang QRIS
              </button>

              {localStorage.getItem('kantin_custom_qris') && (
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('kantin_custom_qris');
                    setQrisPreview(null);
                    setQrisSuccessMsg('QRIS dikembalikan ke pengaturan standar.');
                    setTimeout(() => {
                      setShowQrisModal(false);
                      setQrisSuccessMsg(null);
                    }, 1200);
                  }}
                  className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-red-600 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus QRIS Kustom (Gunakan Bawaan)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
