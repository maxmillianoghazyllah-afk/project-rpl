import React, { useState, useEffect } from 'react';
import { ShieldCheck, QrCode, AlertCircle } from 'lucide-react';

interface QRISCardProps {
  orderNumber: string;
  totalAmount: number;
}

export const QRISCard: React.FC<QRISCardProps> = ({ orderNumber, totalAmount }) => {
  const [customQris, setCustomQris] = useState<string | null>(null);
  const [merchantName, setMerchantName] = useState<string>('KANTIN KAMPUS');

  useEffect(() => {
    const saved = localStorage.getItem('kantin_custom_qris');
    if (saved) {
      setCustomQris(saved);
    }
    const savedMerchant = localStorage.getItem('kantin_merchant_name');
    if (savedMerchant) {
      setMerchantName(savedMerchant.toUpperCase());
    }
  }, []);

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xl max-w-sm mx-auto text-center relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-black tracking-widest text-red-600">
          <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px]">QRIS</span>
          <span>PEMBAYARAN</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          NMID: {customQris ? 'ID10293847561' : 'BELUM AKTIF'}
        </div>
      </div>

      {/* Merchant Info */}
      <div className="mb-4">
        <h3 className="font-extrabold text-base text-gray-900 tracking-tight">{merchantName}</h3>
        <p className="text-xs text-gray-500">Konter Makanan & Minuman Kantin</p>
      </div>

      {/* QR Code Container */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-dashed border-gray-300 inline-block mb-4 shadow-inner">
        <div className="w-52 h-52 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center relative overflow-hidden">
          {customQris ? (
            <img
              src={customQris}
              alt="QRIS Resmi Kantin"
              className="w-full h-full object-contain rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5">
                <QrCode className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-gray-800">QRIS Toko Kosong</span>
              <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                Penjual belum mengunggah gambar barcode QRIS.
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-gray-100 text-[9px] font-semibold text-gray-600">
                Unggah di Tab Penjual (.png/.jpg)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 mb-3 text-left">
        <div className="text-[11px] text-amber-800 font-medium">Nomor Pesanan:</div>
        <div className="font-mono text-xs font-bold text-amber-950 mb-1">{orderNumber}</div>

        <div className="flex justify-between items-baseline pt-2 border-t border-amber-200/50">
          <span className="text-xs text-amber-900 font-semibold">Total Tagihan:</span>
          <span className="text-lg font-black text-brand-600">
            Rp {totalAmount.toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-gray-400 leading-tight">
        {customQris
          ? 'Buka aplikasi e-wallet / mobile banking Anda, scan QRIS di atas dan selesaikan transfer.'
          : 'Setelah transfer atau bayar ke kasir, klik tombol konfirmasi di bawah untuk antrean.'}
      </div>
    </div>
  );
};
