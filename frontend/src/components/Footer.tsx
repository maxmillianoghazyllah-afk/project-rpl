import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500">
        <p className="font-semibold text-gray-700">Sistem Antrean Kantin (P3) &bull; Rekayasa Perangkat Lunak</p>
        <p className="mt-1">
          Frontend: React + Vite + Tailwind CSS &nbsp;|&nbsp; Backend: Express + Prisma ORM + MySQL &nbsp;|&nbsp; Pembayaran: QRIS Kantin
        </p>
      </div>
    </footer>
  );
};
