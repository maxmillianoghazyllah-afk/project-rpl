import React, { useState, useEffect } from 'react';
import {
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  X,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';

export type AuthModalMode = 'CREATE' | 'LOGIN' | 'CHANGE_PASSWORD';

interface SellerAuthModalProps {
  isOpen: boolean;
  mode: AuthModalMode;
  onSuccess: () => void;
  onClose: () => void;
}

export const SellerAuthModal: React.FC<SellerAuthModalProps> = ({
  isOpen,
  mode: initialMode,
  onSuccess,
  onClose,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setMode(initialMode);
    resetForm();
  }, [initialMode, isOpen]);

  const resetForm = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoginPassword('');
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  if (!isOpen) return null;

  const handleCreatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMessage('Password minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password tidak cocok! Silakan periksa kembali.');
      return;
    }

    // Simpan password di localStorage
    localStorage.setItem('kantin_seller_password', newPassword.trim());
    sessionStorage.setItem('kantin_seller_session', 'true');

    setSuccessMessage('Password penjual berhasil dibuat dan disimpan!');
    setTimeout(() => {
      resetForm();
      onSuccess();
    }, 900);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const savedPassword = localStorage.getItem('kantin_seller_password');
    if (!savedPassword) {
      // Belum ada password, alihkan ke mode buat password
      setMode('CREATE');
      return;
    }

    if (loginPassword.trim() !== savedPassword) {
      setErrorMessage('Password salah! Akses khusus penjual ditolak.');
      return;
    }

    // Set sesi penjual aktif
    sessionStorage.setItem('kantin_seller_session', 'true');
    setSuccessMessage('Password benar! Membuka akses penjual...');
    setTimeout(() => {
      resetForm();
      onSuccess();
    }, 600);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const savedPassword = localStorage.getItem('kantin_seller_password');

    if (oldPassword.trim() !== savedPassword) {
      setErrorMessage('Password lama yang Anda masukkan tidak sesuai.');
      return;
    }

    if (!newPassword || newPassword.trim().length < 4) {
      setErrorMessage('Password baru minimal harus terdiri dari 4 karakter.');
      return;
    }

    if (newPassword === oldPassword) {
      setErrorMessage('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi password baru tidak cocok.');
      return;
    }

    localStorage.setItem('kantin_seller_password', newPassword.trim());
    setSuccessMessage('Password penjual berhasil diperbarui! Harap catat password baru Anda.');

    setTimeout(() => {
      resetForm();
      onSuccess();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              {mode === 'CREATE' ? (
                <KeyRound className="w-5 h-5 text-amber-200" />
              ) : mode === 'LOGIN' ? (
                <Lock className="w-5 h-5 text-emerald-200" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-teal-200" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight leading-tight">
                {mode === 'CREATE'
                  ? 'Buat Password Penjual'
                  : mode === 'LOGIN'
                  ? 'Akses Khusus Penjual'
                  : 'Ganti Password Penjual'}
              </h2>
              <p className="text-xs text-white/80">
                {mode === 'CREATE'
                  ? 'Inisialisasi keamanan konter kantin'
                  : mode === 'LOGIN'
                  ? 'Otentikasi keamanan kasir & dapur'
                  : 'Pembaruan kata sandi penjual'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Peringatan Kritis: TIDAK ADA OPSI LUPA PASSWORD */}
          <div className="mb-5 bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl">
            <div className="flex gap-2.5 items-start">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <span className="font-bold block uppercase tracking-wide text-amber-800 mb-0.5">
                  Penting & Wajib Dicatat!
                </span>
                Harap simpan dan catat password ini baik-baik. Sistem{' '}
                <span className="font-bold underline">TIDAK memiliki opsi Lupa Password</span> demi
                menjamin keamanan data transaksi kantin dari akses mahasiswa/umum.
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form CREATE PASSWORD */}
          {mode === 'CREATE' && (
            <form onSubmit={handleCreatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Password Baru Penjual
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">Minimal 4 karakter</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition"
                >
                  Batal (Kembali)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  Simpan & Masuk Penjual
                </button>
              </div>
            </form>
          )}

          {/* Form LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                  Password Penjual
                </label>
                <div className="relative">
                  <input
                    type={showLogin ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan password penjual..."
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLogin(!showLogin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLogin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Hanya staf kantin yang berhak mengakses halaman ini.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition"
                >
                  Batal (Kembali ke Mahasiswa)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  Buka Sisi Penjual
                </button>
              </div>
            </form>
          )}

          {/* Form CHANGE PASSWORD */}
          {mode === 'CHANGE_PASSWORD' && (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Password Lama
                </label>
                <div className="relative">
                  <input
                    type={showOld ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Masukkan password lama..."
                    className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru..."
                    className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Konfirmasi Password Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru..."
                    className="w-full px-4 py-2 pr-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/30 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Simpan Password Baru
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
