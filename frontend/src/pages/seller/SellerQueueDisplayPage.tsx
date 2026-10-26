import React, { useState, useEffect } from 'react';
import {
  Monitor,
  BellRing,
  ChefHat,
  Clock,
  UtensilsCrossed,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  Columns,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';
import { Queue, Menu } from '../../types';

interface SellerQueueDisplayPageProps {
  onBackToDashboard?: () => void;
}

export const SellerQueueDisplayPage: React.FC<SellerQueueDisplayPageProps> = ({
  onBackToDashboard,
}) => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [displayMode, setDisplayMode] = useState<'QUEUE' | 'MENUS' | 'SPLIT'>('SPLIT');
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const dataInterval = setInterval(loadData, 4000);
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => {
      clearInterval(dataInterval);
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

  const inProgressQueues = queues.filter((q) => q.status === 'IN_PROGRESS');
  const readyQueues = queues.filter((q) => q.status === 'READY');
  const waitingQueues = queues.filter((q) => q.status === 'WAITING');

  const availableMenus = menus.filter((m) => m.isAvailable);
  const outOfStockMenus = menus.filter((m) => !m.isAvailable);

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="bg-gray-950 text-white min-h-screen p-4 sm:p-6 lg:p-8 flex flex-col justify-between selection:bg-brand-500">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              title="Kembali ke Dashboard Penjual"
              className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold mr-2 border border-gray-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          )}

          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Monitor className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Layar Display Informasi Kantin
            </h1>
            <p className="text-xs text-gray-400">
              Papan Monitor Digital TV Antrean & Ketersediaan Stok Menu Kampus
            </p>
          </div>
        </div>

        {/* Display Mode Switcher & Digital Clock */}
        <div className="flex items-center gap-4 flex-wrap self-end md:self-auto">
          {/* Mode Switcher Buttons */}
          <div className="bg-gray-900 p-1 rounded-2xl border border-gray-800 flex items-center text-xs font-bold">
            <button
              onClick={() => setDisplayMode('QUEUE')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                displayMode === 'QUEUE'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <BellRing className="w-3.5 h-3.5" />
              Monitor Antrean
            </button>
            <button
              onClick={() => setDisplayMode('MENUS')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                displayMode === 'MENUS'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Ketersediaan Menu
            </button>
            <button
              onClick={() => setDisplayMode('SPLIT')}
              className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                displayMode === 'SPLIT'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Layar Bersama (Split)
            </button>
          </div>

          <div className="text-right pl-2 border-l border-gray-800">
            <div className="font-mono text-2xl sm:text-3xl font-black text-amber-400 leading-none">
              {time}
            </div>
            <div className="text-[11px] text-gray-400 font-medium mt-1">
              {new Date().toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'short',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: MONITOR ANTREAN (FULL) */}
      {/* ============================================================== */}
      {displayMode === 'QUEUE' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 mb-6 animate-fadeIn">
          {/* Kolom Kiri: Sedang Disiapkan */}
          <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800 mb-6 text-purple-400">
              <ChefHat className="w-7 h-7 animate-pulse" />
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider">Sedang Disiapkan</h2>
                <p className="text-xs text-gray-400">Pesanan sedang dimasak oleh staf dapur</p>
              </div>
            </div>

            <div className="flex-1">
              {inProgressQueues.length === 0 ? (
                <div className="h-full min-h-[220px] flex items-center justify-center text-gray-600 font-bold text-lg">
                  Tidak ada pesanan sedang dimasak
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {inProgressQueues.map((q) => (
                    <div
                      key={q.id}
                      className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-5 text-center shadow-inner"
                    >
                      <span className="font-mono text-3xl sm:text-4xl font-black text-purple-300">
                        {q.queueNumber}
                      </span>
                      <span className="block text-[10px] text-purple-400 uppercase tracking-widest mt-1">
                        Diproses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan: Silakan Ambil (Siap) */}
          <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-800 mb-6 text-emerald-400">
              <BellRing className="w-7 h-7 animate-bounce" />
              <div>
                <h2 className="text-xl font-black uppercase tracking-wider">Silakan Ambil (Siap)</h2>
                <p className="text-xs text-gray-400">Silakan menuju ke konter kantin</p>
              </div>
            </div>

            <div className="flex-1">
              {readyQueues.length === 0 ? (
                <div className="h-full min-h-[220px] flex items-center justify-center text-gray-600 font-bold text-lg">
                  Belum ada pesanan yang siap diambil
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {readyQueues.map((q) => (
                    <div
                      key={q.id}
                      className="bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-xl shadow-emerald-900/30 animate-pulse"
                    >
                      <span className="font-mono text-4xl sm:text-5xl font-black text-emerald-300 tracking-tight">
                        {q.queueNumber}
                      </span>
                      <span className="block text-xs font-black text-emerald-400 uppercase tracking-widest mt-1">
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

      {/* ============================================================== */}
      {/* MODE 2: KETERSEDIAAN MENU (FULL TV BOARD) */}
      {/* ============================================================== */}
      {displayMode === 'MENUS' && (
        <div className="flex-1 mb-6 flex flex-col gap-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
            {/* Menu Tersedia (2 Kolom) */}
            <div className="lg:col-span-2 bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-5">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                  <h2 className="text-xl font-black uppercase tracking-wider">
                    Menu Tersedia Hari Ini ({availableMenus.length})
                  </h2>
                </div>
                <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-3 py-1 rounded-full font-bold">
                  Siap Dipesan
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 overflow-y-auto max-h-[520px] pr-1">
                {availableMenus.map((menu) => (
                  <div
                    key={menu.id}
                    className="bg-gray-800/70 border border-gray-700/60 rounded-2xl p-3.5 flex items-center justify-between hover:border-emerald-500/50 transition"
                  >
                    <div className="flex items-center gap-3">
                      {menu.imageUrl ? (
                        <img
                          src={menu.imageUrl}
                          alt={menu.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-700"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gray-700 flex items-center justify-center text-gray-400">
                          <UtensilsCrossed className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-white text-sm line-clamp-1">{menu.name}</h4>
                        <span className="text-[11px] text-gray-400 block">
                          {menu.category || 'Kantin'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-300 text-sm">
                        {formatIDR(menu.price)}
                      </span>
                      <span className="block text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        Tersedia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Habis (1 Kolom) */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-gray-800 mb-5">
                <div className="flex items-center gap-2.5 text-rose-400">
                  <XCircle className="w-6 h-6" />
                  <h2 className="text-lg font-black uppercase tracking-wider">
                    Menu Habis ({outOfStockMenus.length})
                  </h2>
                </div>
                <span className="text-xs bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-full font-bold">
                  Sold Out
                </span>
              </div>

              {outOfStockMenus.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mb-2" />
                  <p className="font-bold text-gray-400">Semua menu tersedia!</p>
                  <span className="text-xs">Tidak ada menu yang habis saat ini.</span>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                  {outOfStockMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="bg-rose-950/30 border border-rose-900/50 rounded-2xl p-3 flex items-center justify-between opacity-80"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-rose-400">
                          <XCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-300 text-sm line-through">
                            {menu.name}
                          </h4>
                          <span className="text-[10px] text-gray-500">{menu.category}</span>
                        </div>
                      </div>
                      <span className="bg-rose-900/80 text-rose-300 font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                        HABIS
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 3: SPLIT (LAYAR BERSAMA: ANTREAN + STATUS STOK MENU) */}
      {/* ============================================================== */}
      {displayMode === 'SPLIT' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 mb-6 animate-fadeIn">
          {/* Kolom Kiri (7 Bagian): Antrean Siap & Disiapkan */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Siap Diambil */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-5 flex-1 shadow-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800 mb-4 text-emerald-400">
                <BellRing className="w-6 h-6 animate-bounce" />
                <h3 className="font-black text-lg uppercase tracking-wider">
                  Silakan Ambil di Konter ({readyQueues.length})
                </h3>
              </div>

              {readyQueues.length === 0 ? (
                <div className="py-8 text-center text-gray-600 font-bold">
                  Belum ada pesanan yang siap diambil
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {readyQueues.map((q) => (
                    <div
                      key={q.id}
                      className="bg-emerald-950/70 border-2 border-emerald-500 rounded-2xl p-4 text-center shadow-lg animate-pulse"
                    >
                      <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-300">
                        {q.queueNumber}
                      </span>
                      <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">
                        Siap
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sedang Dimasak */}
            <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-5 flex-1 shadow-2xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-800 mb-4 text-purple-400">
                <ChefHat className="w-6 h-6 animate-pulse" />
                <h3 className="font-black text-lg uppercase tracking-wider">
                  Sedang Disiapkan Dapur ({inProgressQueues.length})
                </h3>
              </div>

              {inProgressQueues.length === 0 ? (
                <div className="py-8 text-center text-gray-600 font-bold">
                  Tidak ada pesanan sedang dimasak
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {inProgressQueues.map((q) => (
                    <div
                      key={q.id}
                      className="bg-purple-950/40 border border-purple-800/60 rounded-2xl p-3.5 text-center"
                    >
                      <span className="font-mono text-2xl sm:text-3xl font-black text-purple-300">
                        {q.queueNumber}
                      </span>
                      <span className="block text-[10px] text-purple-400 uppercase tracking-widest mt-0.5">
                        Diproses
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Kolom Kanan (5 Bagian): Ketersediaan Menu Kantin */}
          <div className="lg:col-span-5 bg-gray-900/90 rounded-3xl border border-gray-800 p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800 mb-4">
              <div className="flex items-center gap-2 text-amber-400">
                <UtensilsCrossed className="w-5 h-5" />
                <h3 className="font-black text-base uppercase tracking-wider">
                  Info Ketersediaan Menu
                </h3>
              </div>
              <span className="text-[11px] text-gray-400">Stok Real-time</span>
            </div>

            {/* Menu Habis Banner (Jika Ada) */}
            {outOfStockMenus.length > 0 && (
              <div className="mb-4 bg-rose-950/40 border border-rose-800/80 rounded-2xl p-3">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs uppercase mb-2">
                  <XCircle className="w-4 h-4" /> Menu Habis ({outOfStockMenus.length}):
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {outOfStockMenus.map((m) => (
                    <span
                      key={m.id}
                      className="bg-rose-900/60 text-rose-200 border border-rose-700/60 text-xs px-2.5 py-1 rounded-lg font-semibold line-through"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Tersedia List */}
            <div className="flex-1 overflow-y-auto max-h-[380px] space-y-2 pr-1">
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider mb-1">
                Menu Rekomendasi Siap Dipesan:
              </div>
              {availableMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-2.5 flex items-center justify-between text-xs"
                >
                  <span className="font-bold text-gray-200 line-clamp-1">{menu.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-emerald-300 font-semibold">
                      {formatIDR(menu.price)}
                    </span>
                    <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      ADA
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Footer Bar: Antrean Menunggu */}
      <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-gray-400 flex-wrap">
          <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span className="font-semibold text-gray-300">
            Nomor Antrean Menunggu Diproses ({waitingQueues.length}):
          </span>
          <div className="flex gap-2 ml-1 flex-wrap">
            {waitingQueues.slice(0, 8).map((q) => (
              <span
                key={q.id}
                className="bg-gray-800 px-2 py-0.5 rounded font-mono font-bold text-amber-300 border border-gray-700"
              >
                {q.queueNumber}
              </span>
            ))}
            {waitingQueues.length > 8 && (
              <span className="text-gray-500 font-medium">+{waitingQueues.length - 8} lainnya</span>
            )}
          </div>
        </div>

        <span className="text-gray-500 text-[11px] hidden sm:block">
          Sistem Antrean Kantin P3 &bull; Update Otomatis Tiap 4 Detik
        </span>
      </div>
    </div>
  );
};
