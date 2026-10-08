import React from 'react';
import { QrCode, ShieldCheck } from 'lucide-react';

interface QRISCardProps {
  orderNumber: string;
  totalAmount: number;
}

export const QRISCard: React.FC<QRISCardProps> = ({ orderNumber, totalAmount }) => {
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
          NMID: ID10293847561
        </div>
      </div>

      {/* Merchant Info */}
      <div className="mb-4">
        <h3 className="font-extrabold text-base text-gray-900 tracking-tight">KANTIN BERKAH KAMPUS</h3>
        <p className="text-xs text-gray-500">Stand Makanan & Minuman Gedung Utama</p>
      </div>

      {/* QR Code Container */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-2xl border-2 border-dashed border-gray-300 inline-block mb-4 shadow-inner">
        <div className="w-48 h-48 bg-white p-2 rounded-xl shadow-sm flex items-center justify-center relative">
          {/* Detailed SVG QR Code */}
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current text-gray-900">
            {/* Corner Markers */}
            <rect x="5" y="5" width="25" height="25" fill="#111827" rx="3" />
            <rect x="9" y="9" width="17" height="17" fill="#ffffff" rx="2" />
            <rect x="13" y="13" width="9" height="9" fill="#111827" rx="1" />

            <rect x="70" y="5" width="25" height="25" fill="#111827" rx="3" />
            <rect x="74" y="9" width="17" height="17" fill="#ffffff" rx="2" />
            <rect x="78" y="13" width="9" height="9" fill="#111827" rx="1" />

            <rect x="5" y="70" width="25" height="25" fill="#111827" rx="3" />
            <rect x="9" y="74" width="17" height="17" fill="#ffffff" rx="2" />
            <rect x="13" y="78" width="9" height="9" fill="#111827" rx="1" />

            {/* Simulated Data Matrix Dots */}
            <circle cx="40" cy="15" r="2.5" />
            <circle cx="50" cy="12" r="2.5" />
            <circle cx="60" cy="18" r="2.5" />
            <circle cx="35" cy="25" r="2.5" />
            <circle cx="55" cy="28" r="2.5" />
            <circle cx="15" cy="40" r="2.5" />
            <circle cx="25" cy="48" r="2.5" />
            <circle cx="42" cy="42" r="2.5" />
            <circle cx="58" cy="45" r="2.5" />
            <circle cx="75" cy="40" r="2.5" />
            <circle cx="85" cy="48" r="2.5" />
            <circle cx="40" cy="60" r="2.5" />
            <circle cx="52" cy="58" r="2.5" />
            <circle cx="62" cy="68" r="2.5" />
            <circle cx="40" cy="80" r="2.5" />
            <circle cx="55" cy="75" r="2.5" />
            <circle cx="72" cy="82" r="2.5" />
            <circle cx="85" cy="72" r="2.5" />
            <circle cx="80" cy="90" r="2.5" />
            <circle cx="62" cy="88" r="2.5" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 text-white p-1 rounded-md shadow-md text-[9px] font-black">
              QRIS
            </div>
          </div>
        </div>
      </div>

      {/* Payment details */}
      <div className="bg-amber-50 rounded-xl p-3 border border-amber-200/60 mb-3 text-left">
        <div className="text-[11px] text-amber-800 font-medium">Nomor Pesanan:</div>
        <div className="font-mono text-xs font-bold text-amber-950 mb-1">{orderNumber}</div>
        <div className="text-[11px] text-amber-800 font-medium">Total Pembayaran:</div>
        <div className="text-xl font-extrabold text-amber-700">
          Rp {totalAmount.toLocaleString('id-ID')}
        </div>
      </div>

      <p className="text-[11px] text-gray-500 leading-relaxed">
        Buka GoPay, OVO, Dana, ShopeePay, BCA Mobile, atau aplikasi bank apa pun, lalu scan kode QR di atas.
      </p>
    </div>
  );
};
