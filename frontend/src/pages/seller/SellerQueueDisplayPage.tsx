import React, { useState, useEffect } from 'react';
import { Monitor, BellRing, ChefHat, Clock, Utensils, CheckCircle, XCircle, ArrowLeft, Layers } from 'lucide-react';
import { api } from '../../services/api';
import { Queue, Menu } from '../../types';

interface SellerQueueDisplayPageProps {
  onBackToDashboard?: () => void;
  initialMode?: 'queue' | 'menu' | 'split';
}

export const SellerQueueDisplayPage: React.FC<SellerQueueDisplayPageProps> = ({
  onBackToDashboard,
  initialMode = 'queue',
}) => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [displayMode, setDisplayMode] = useState<'queue' | 'menu' | 'split'>(initialMode);
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));

  useEffect(() => {
    loadData();
    const qInterval = setInterval(loadData, 4000);
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => {
      clearInterval(qInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadData = async () => {
    try {
      const [queueData, menuData] = await Promise.all([
        api.getQueue().catch(() => ({ queues: [] })),
        api.getMenus().catch(() => []),
      ]);
      setQueues(queueData.queues || []);
      setMenus(menuData || []);
    } catch (err) {
      console.error('Error fetching display data', err);
    }
  };

  const waitingQueues = queues.filter((q) => q.status === 'WAITING');
  const inProgressQueues = queues.filter((q) => q.status === 'IN_PROGRESS');
  const readyQueues = queues.filter((q) => q.status === 'READY');

  const availableMenus = menus.filter((m) => m.isAvailable);
  const outOfStockMenus = menus.filter((m) => !m.isAvailable);

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
      {/* Top Banner & Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-5 mb-6 gap-4">
        {/* Title & Navigation */}
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="p-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-gray-400 hover:text-white transition flex items-center gap-1.5 text-xs font-bold"
              title="Kembali ke Dashboard Penjual"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          )}

          <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Monitor className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Layar Monitor Konter Kantin
              <span className="text-[10px] uppercase font-bold bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                Live TV
              </span>
            </h1>
            <p className="text-xs text-gray-400">
              {displayMode === 'queue' && 'Papan nomor antrean: Menunggu, Sedang Disiapkan, dan Siap Diambil'}
              {displayMode === 'menu' && 'Papan ketersediaan menu makanan & minuman mahasiswa'}
              {displayMode === 'split' && 'Mode kombinasi: Antrean Lengkap & Ketersediaan Menu'}
            </p>
          </div>
        </div>

        {/* Display Mode Switcher & Clock */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          {/* Mode Switcher Buttons */}
          <div className="bg-gray-900 p-1 rounded-2xl border border-gray-800 flex items-center text-xs font-bold">
            <button
              onClick={() => setDisplayMode('queue')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                displayMode === 'queue'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              Antrean (3 Kolom)
            </button>
            <button
              onClick={() => setDisplayMode('menu')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                displayMode === 'menu'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              Menu Tersedia
            </button>
            <button
              onClick={() => setDisplayMode('split')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition ${
                displayMode === 'split'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Split (Keduanya)
            </button>
          </div>

          {/* Real-time Clock */}
          <div className="text-right pl-2 border-l border-gray-800 hidden sm:block">
            <div className="font-mono text-2xl font-black text-amber-400 tracking-tight">{time}</div>
            <div className="text-[10px] text-gray-400 font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Boards Section */}
      <div className="flex-1 mb-6">
        {/* MODE 1: ANTREAN LENGKAP 3 KOLOM */}
        {displayMode === 'queue' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {/* KOLOM 1: Menunggu / Belum Dimasak (Amber) */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6 text-amber-400">
                <div className="flex items-center gap-2.5">
                  <Clock className="w-6 h-6 animate-pulse" />
                  <h2 className="text-lg font-black uppercase tracking-wider">Belum Dimasak</h2>
                </div>
                <span className="text-xs bg-amber-950/80 text-amber-300 px-2.5 py-1 rounded-full border border-amber-800/60 font-bold">
                  {waitingQueues.length} antre
                </span>
              </div>

              <div className="flex-1">
                {waitingQueues.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-600 font-bold text-sm">
                    Tidak ada antrean menunggu
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {waitingQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-4 text-center shadow-inner"
                      >
                        <span className="font-mono text-3xl font-black text-amber-300 block">
                          {q.queueNumber}
                        </span>
                        <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold mt-1 block">
                          Menunggu Giliran
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KOLOM 2: Sedang Disiapkan / Dimasak (Purple) */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6 text-purple-400">
                <div className="flex items-center gap-2.5">
                  <ChefHat className="w-6 h-6 animate-pulse" />
                  <h2 className="text-lg font-black uppercase tracking-wider">Sedang Disiapkan</h2>
                </div>
                <span className="text-xs bg-purple-950/80 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800/60 font-bold">
                  {inProgressQueues.length} proses
                </span>
              </div>

              <div className="flex-1">
                {inProgressQueues.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-600 font-bold text-sm">
                    Tidak ada pesanan sedang dimasak
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {inProgressQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-4 text-center shadow-inner"
                      >
                        <span className="font-mono text-3xl font-black text-purple-300 block">
                          {q.queueNumber}
                        </span>
                        <span className="text-[10px] text-purple-400 uppercase tracking-widest font-semibold mt-1 block">
                          Sedang Dimasak
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* KOLOM 3: Silakan Ambil (Siap) (Emerald) */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-6 text-emerald-400">
                <div className="flex items-center gap-2.5">
                  <BellRing className="w-6 h-6 animate-bounce" />
                  <h2 className="text-lg font-black uppercase tracking-wider">Silakan Ambil (Siap)</h2>
                </div>
                <span className="text-xs bg-emerald-950/80 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800/60 font-bold">
                  {readyQueues.length} siap
                </span>
              </div>

              <div className="flex-1">
                {readyQueues.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-600 font-bold text-sm">
                    Belum ada pesanan yang siap diambil
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3.5">
                    {readyQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-4 text-center shadow-xl shadow-emerald-900/30 animate-pulse"
                      >
                        <span className="font-mono text-4xl font-black text-emerald-300 tracking-tight block">
                          {q.queueNumber}
                        </span>
                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest mt-1 block">
                          Ambil di Konter
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODE 2: KETERSEDIAAN MENU */}
        {displayMode === 'menu' && (
          <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 mb-6 gap-3">
              <div className="flex items-center gap-3 text-amber-400">
                <Utensils className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-black uppercase tracking-wider text-white">
                    Daftar Menu & Ketersediaan Stok
                  </h2>
                  <p className="text-xs text-gray-400">
                    Informasi ketersediaan makanan dan minuman terkini untuk mahasiswa
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> {availableMenus.length} Tersedia
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-red-950 text-red-400 border border-red-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> {outOfStockMenus.length} Habis
                </span>
              </div>
            </div>

            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto max-h-[62vh] pr-1">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className={`rounded-2xl border p-4 transition flex flex-col justify-between ${
                    menu.isAvailable
                      ? 'bg-gray-800/80 border-gray-700/80 hover:border-gray-600'
                      : 'bg-red-950/20 border-red-900/40 opacity-75'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={
                        menu.imageUrl ||
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
                      }
                      alt={menu.name}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-950 flex-shrink-0 border border-gray-700"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                        {menu.category || 'Makanan'}
                      </span>
                      <h3 className="font-bold text-sm text-white truncate">{menu.name}</h3>
                      <div className="font-black text-amber-400 text-sm mt-0.5">
                        Rp {menu.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 truncate max-w-[130px]">
                      {menu.description || 'Porsi standar'}
                    </span>
                    {menu.isAvailable ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/80 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Tersedia
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-red-900/80 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                        <XCircle className="w-3 h-3" /> Habis
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODE 3: SPLIT (ANTREAN 3 TAHAP DI KIRI, MENU DI KANAN) */}
        {displayMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
            {/* Kiri: Antrean Panggilan 3 Tahap (7 Kolom) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Ready */}
              <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3 text-emerald-400">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 animate-bounce" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Silakan Ambil (Siap)</h3>
                  </div>
                  <span className="text-[11px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    {readyQueues.length}
                  </span>
                </div>
                {readyQueues.length === 0 ? (
                  <p className="text-center py-3 text-gray-600 text-xs font-semibold">
                    Belum ada pesanan siap diambil
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {readyQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-emerald-950/70 border-2 border-emerald-500 rounded-xl p-2.5 text-center animate-pulse"
                      >
                        <span className="font-mono text-2xl font-black text-emerald-300 block">
                          {q.queueNumber}
                        </span>
                        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">
                          Siap Ambil
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* In Progress */}
              <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3 text-purple-400">
                  <div className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Sedang Disiapkan</h3>
                  </div>
                  <span className="text-[11px] bg-purple-950 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                    {inProgressQueues.length}
                  </span>
                </div>
                {inProgressQueues.length === 0 ? (
                  <p className="text-center py-3 text-gray-600 text-xs font-semibold">
                    Tidak ada pesanan sedang dimasak
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {inProgressQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-purple-950/40 border border-purple-800/60 rounded-xl p-2.5 text-center"
                      >
                        <span className="font-mono text-xl font-black text-purple-300 block">
                          {q.queueNumber}
                        </span>
                        <span className="text-[9px] text-purple-400 uppercase tracking-widest">
                          Dimasak
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Waiting / Belum Dimasak */}
              <div className="bg-gray-900/90 rounded-2xl border border-gray-800 p-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-gray-800 mb-3 text-amber-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 animate-pulse" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Belum Dimasak (Menunggu)</h3>
                  </div>
                  <span className="text-[11px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {waitingQueues.length}
                  </span>
                </div>
                {waitingQueues.length === 0 ? (
                  <p className="text-center py-3 text-gray-600 text-xs font-semibold">
                    Tidak ada antrean menunggu
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2.5">
                    {waitingQueues.map((q) => (
                      <div
                        key={q.id}
                        className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-2.5 text-center"
                      >
                        <span className="font-mono text-xl font-black text-amber-300 block">
                          {q.queueNumber}
                        </span>
                        <span className="text-[9px] text-amber-400 uppercase tracking-widest">
                          Antre
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Kanan: Ketersediaan Menu (5 Kolom) */}
            <div className="lg:col-span-5 bg-gray-900/90 rounded-3xl border border-gray-800 p-5 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4 text-amber-400">
                <div className="flex items-center gap-2">
                  <Utensils className="w-5 h-5" />
                  <h3 className="text-base font-black uppercase tracking-wider text-white">Status Menu</h3>
                </div>
                <div className="flex gap-2 text-[10px]">
                  <span className="text-emerald-400 font-bold">{availableMenus.length} Tersedia</span>
                  <span className="text-gray-600">&bull;</span>
                  <span className="text-red-400 font-bold">{outOfStockMenus.length} Habis</span>
                </div>
              </div>

              <div className="space-y-2 overflow-y-auto max-h-[55vh] pr-1 flex-1">
                {menus.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs ${
                      m.isAvailable
                        ? 'bg-gray-800/60 border-gray-700/60 text-gray-200'
                        : 'bg-red-950/20 border-red-900/40 text-gray-400'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <span className="font-bold block truncate text-white">{m.name}</span>
                      <span className="text-[10px] text-amber-400 font-semibold">
                        Rp {m.price.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {m.isAvailable ? (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                        Tersedia
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-red-900 text-white text-[10px] font-bold animate-pulse">
                        Habis
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Status Informasi */}
      <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5 font-bold text-amber-400">
            <Clock className="w-4 h-4" /> Belum Dimasak: {waitingQueues.length}
          </span>
          <span className="text-gray-600">&bull;</span>
          <span className="flex items-center gap-1.5 font-bold text-purple-400">
            <ChefHat className="w-4 h-4" /> Sedang Dimasak: {inProgressQueues.length}
          </span>
          <span className="text-gray-600">&bull;</span>
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <BellRing className="w-4 h-4" /> Siap Diambil: {readyQueues.length}
          </span>
        </div>

        <span className="text-gray-500 text-[11px] font-medium">
          Sistem Antrean Kantin P3 &bull; Update Otomatis Tiap 4 Detik
        </span>
      </div>
    </div>
  );
};
