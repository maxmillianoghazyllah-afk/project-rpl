import React, { useState, useEffect } from 'react';
import { Monitor, BellRing, ChefHat, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { Queue } from '../../types';

export const SellerQueueDisplayPage: React.FC = () => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));

  useEffect(() => {
    loadQueues();
    const qInterval = setInterval(loadQueues, 4000);
    const clockInterval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => {
      clearInterval(qInterval);
      clearInterval(clockInterval);
    };
  }, []);

  const loadQueues = async () => {
    try {
      const data = await api.getQueue();
      setQueues(data.queues || []);
    } catch (err) {
      console.error('Error fetching display queue', err);
    }
  };

  const inProgressQueues = queues.filter((q) => q.status === 'IN_PROGRESS');
  const readyQueues = queues.filter((q) => q.status === 'READY');
  const waitingQueues = queues.filter((q) => q.status === 'WAITING');

  return (
    <div className="bg-gray-950 text-white min-h-[calc(100vh-4rem)] p-6 lg:p-10 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <Monitor className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-white">
              Papan Monitor Antrean Kantin
            </h1>
            <p className="text-xs text-gray-400">Silakan perhatikan nomor antrean pesanan Anda</p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-3xl lg:text-4xl font-black text-amber-400">{time}</div>
          <div className="text-xs text-gray-400 font-medium">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Main Boards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 mb-8">
        {/* Left Column: Sedang Disiapkan */}
        <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-800 mb-6 text-purple-400">
            <ChefHat className="w-6 h-6 animate-pulse" />
            <h2 className="text-xl font-black uppercase tracking-wider">Sedang Disiapkan</h2>
          </div>

          <div className="flex-1">
            {inProgressQueues.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 font-bold text-lg">
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

        {/* Right Column: Siap Diambil */}
        <div className="bg-gray-900/90 rounded-3xl border border-gray-800 p-6 flex flex-col shadow-2xl">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-800 mb-6 text-emerald-400">
            <BellRing className="w-6 h-6 animate-bounce" />
            <h2 className="text-xl font-black uppercase tracking-wider">Silakan Ambil (Siap)</h2>
          </div>

          <div className="flex-1">
            {readyQueues.length === 0 ? (
              <div className="h-full flex items-center justify-center text-gray-600 font-bold text-lg">
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

      {/* Bottom Bar: Antrean Menunggu */}
      <div className="bg-gray-900/80 rounded-2xl p-4 border border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Nomor antrean menunggu diproses ({waitingQueues.length}):</span>
          <div className="flex gap-2 ml-2 flex-wrap">
            {waitingQueues.slice(0, 6).map((q) => (
              <span key={q.id} className="bg-gray-800 px-2 py-0.5 rounded font-mono font-bold text-amber-300">
                {q.queueNumber}
              </span>
            ))}
            {waitingQueues.length > 6 && <span className="text-gray-500">+{waitingQueues.length - 6} lainnya</span>}
          </div>
        </div>

        <span className="text-gray-500 text-[11px] hidden sm:block">
          Sistem Antrean Kantin P3 &bull; Update Otomatis Tiap 4 Detik
        </span>
      </div>
    </div>
  );
};
