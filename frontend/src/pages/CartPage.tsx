import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Utensils, AlertCircle, FileText } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';
import { Order } from '../types';

interface CartPageProps {
  onNavigateToMenu: () => void;
  onOrderCreated: (order: Order) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigateToMenu, onOrderCreated }) => {
  const { items, updateQuantity, updateNotes, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  // Selalu mulai dengan kolom nama kosong agar mahasiswa langsung mengetikkan nama sendiri
  const [customerName, setCustomerName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // States untuk pop-up konfirmasi hapus pesanan
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ id: number; name: string } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    if (!customerName.trim()) {
      setError('Harap masukkan nama pemesan terlebih dahulu!');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      localStorage.setItem('kantin_customer_name', customerName.trim());
      const payload = items.map((i) => ({
        menuId: i.menu.id,
        quantity: i.quantity,
        notes: i.notes?.trim() || undefined,
      }));
      const order = await api.createOrder(payload, customerName.trim());
      clearCart();
      onOrderCreated(order);
    } catch (err: any) {
      setError(err.message || 'Gagal membuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Keranjang Masih Kosong</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
          Kamu belum memilih makanan atau minuman dari menu kantin. Yuk pilih menu favoritmu sekarang!
        </p>
        <button
          onClick={onNavigateToMenu}
          className="mt-6 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 hover:bg-brand-700 transition"
        >
          Lihat Menu Makanan
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Keranjang Pesanan</h1>
          <p className="text-xs text-gray-500 mt-0.5">Periksa kembali item pesananmu sebelum melanjutkan ke pembayaran.</p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 p-1.5 rounded-lg hover:bg-red-50 transition"
        >
          <Trash2 className="w-3.5 h-3.5" /> Kosongkan
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          {items.map(({ menu, quantity, notes }) => (
            <div
              key={menu.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex gap-4 items-center">
                <img
                  src={menu.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                  alt={menu.name}
                  className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm truncate">{menu.name}</h3>
                  <p className="text-xs text-brand-600 font-bold mt-0.5">
                    Rp {menu.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Subtotal: <span className="font-semibold text-gray-700">Rp {(menu.price * quantity).toLocaleString('id-ID')}</span>
                  </p>
                </div>

                {/* Counter Controls */}
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                  <button
                    onClick={() => updateQuantity(menu.id, -1)}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm border border-gray-100 active:scale-95"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-gray-900">{quantity}</span>
                  <button
                    onClick={() => updateQuantity(menu.id, 1)}
                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-900 shadow-sm border border-gray-100 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Remove button dengan pop up konfirmasi */}
                <button
                  onClick={() => setDeleteConfirmItem({ id: menu.id, name: menu.name })}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition"
                  title="Hapus pesanan ini"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Opsi Catatan Pemesanan (Mahasiswa bisa menambahkan catatan khusus) */}
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={notes || ''}
                  onChange={(e) => updateNotes(menu.id, e.target.value)}
                  placeholder="Tambah catatan pesanan (contoh: Tidak pedas, es sedikit, pisah sambal)..."
                  className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-500 focus:outline-none transition"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm sticky top-24">
            <h2 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-brand-600" /> Ringkasan Pembayaran
            </h2>

            {/* Nama Pemesan */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Nama Pemesan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ketik nama Anda (contoh: Alex, Sinta)..."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 text-xs text-gray-600 pb-4 border-b border-gray-100">
              <div className="flex justify-between">
                <span>Total Item ({totalItems})</span>
                <span className="font-semibold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan Antrean</span>
                <span className="text-emerald-600 font-bold">GRATIS</span>
              </div>
            </div>

            <div className="py-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-gray-900">Total Tagihan</span>
              <span className="text-xl font-black text-brand-600">
                Rp {totalPrice.toLocaleString('id-ID')}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading || items.length === 0}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-brand-600 to-orange-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-500/25 hover:from-brand-700 hover:to-orange-600 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <span>Lanjut Bayar QRIS</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-3">
              Setelah checkout, kamu akan melihat QRIS kantin untuk transfer langsung.
            </p>
          </div>
        </div>
      </div>

      {/* Pop-up Dialog Konfirmasi Hapus Pesanan Tunggal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Yakin ingin menghapus pesanan?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Pesanan <strong className="text-gray-800">"{deleteConfirmItem.name}"</strong> akan dihapus dari daftar keranjang belanja Anda.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="flex-1 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  removeFromCart(deleteConfirmItem.id);
                  setDeleteConfirmItem(null);
                }}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Dialog Konfirmasi Kosongkan Seluruh Keranjang */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mb-1">Yakin ingin menghapus semua pesanan?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Seluruh item yang ada di keranjang Anda akan dibersihkan.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 px-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  clearCart();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/20 transition"
              >
                Ya, Kosongkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
