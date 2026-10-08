import React, { useState } from 'react';
import { CheckCircle2, Clock, ArrowRight, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { QRISCard } from '../components/QRISCard';
import { Order } from '../types';
import { api } from '../services/api';

interface PaymentInstructionPageProps {
  order: Order;
  onPaymentConfirmed: (order: Order) => void;
  onNavigateToQueue: () => void;
}

export const PaymentInstructionPage: React.FC<PaymentInstructionPageProps> = ({
  order,
  onPaymentConfirmed,
  onNavigateToQueue,
}) => {
  const [proofUrl, setProofUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.confirmPayment(order.id, proofUrl || undefined);
      setConfirmed(true);
      const updatedOrder = await api.getOrderById(order.id);
      onPaymentConfirmed(updatedOrder);
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim konfirmasi pembayaran');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
          <Clock className="w-3.5 h-3.5" /> Menunggu Pembayaran QRIS
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900">Selesaikan Pembayaran</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Scan QRIS resmi kantin di bawah ini sesuai jumlah nominal yang tertera.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: QRIS Card on Left, Steps on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-8">
        <div>
          <QRISCard orderNumber={order.orderNumber} totalAmount={order.totalAmount} />
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Langkah Pembayaran:
            </h3>
            <ol className="space-y-3 text-xs text-gray-600 leading-relaxed list-decimal list-inside">
              <li>
                Buka aplikasi perbankan atau dompet digital (GoPay, OVO, Dana, BCA, dll).
              </li>
              <li>Pilih menu <strong>Scan / Bayar QRIS</strong> lalu arahkan kamera ke kode QR.</li>
              <li>
                Pastikan nama merchant adalah <strong>KANTIN BERKAH KAMPUS</strong>.
              </li>
              <li>
                Masukkan nominal tepat senilai{' '}
                <strong className="text-brand-600">
                  Rp {order.totalAmount.toLocaleString('id-ID')}
                </strong>
                .
              </li>
              <li>Selesaikan pembayaran dan simpan bukti transaksi Anda.</li>
              <li>
                Tekan tombol <strong>"Saya Sudah Bayar"</strong> di bawah untuk mengirim konfirmasi ke penjual.
              </li>
            </ol>
          </div>

          {/* Confirmation Box */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h4 className="font-bold text-gray-900 text-xs mb-2">Konfirmasi Pengiriman Pembayaran</h4>
            
            <div className="mb-4">
              <label className="block text-[11px] text-gray-500 mb-1">
                Catatan / Link Bukti Transfer (Opsional):
              </label>
              <input
                type="text"
                placeholder="Contoh: Transfer via GoPay a.n Budi / link foto"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            {confirmed ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Konfirmasi pembayaran telah terkirim! Menunggu penjual menyetujui pesanan.
                </div>
                <button
                  onClick={onNavigateToQueue}
                  className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow-md hover:bg-emerald-700 transition flex items-center justify-center gap-2"
                >
                  <span>Pantau Status Antrean</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConfirmPayment}
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Mengirim Konfirmasi...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saya Sudah Bayar (Konfirmasi)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
