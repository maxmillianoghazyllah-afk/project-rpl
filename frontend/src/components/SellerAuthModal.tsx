import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Check, X, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export type AuthModalMode = 'SETUP' | 'VERIFY' | 'CHANGE_PASSWORD';

interface SellerAuthModalProps {
  isOpen: boolean;
  mode: AuthModalMode;
  onClose: () => void;
  onSuccess: () => void;
}

export const SellerAuthModal: React.FC<SellerAuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setPassword('');
    setConfirmPassword('');
    setOldPassword('');
    setError(null);
    setSuccessMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const storedPassword = localStorage.getItem('kantin_seller_password');

    // 1. SETUP (Pertama Kali: Buat Password Baru)
    if (mode === 'SETUP') {
      if (!password || password.length < 4) {
        setError('Password minimal harus 4 karakter!');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password tidak cocok! Pastikan kedua kolom sama.');
        return;
      }

      localStorage.setItem('kantin_seller_password', password);
      sessionStorage.setItem('kantin_seller_session', 'true');
      setSuccessMsg('Password berhasil dibuat! Akses penjual terbuka.');
      setTimeout(() => {
        handleReset();
        onSuccess();
      }, 700);
      return;
    }

    // 2. VERIFY (Login Masuk Mode Penjual)
    if (mode === 'VERIFY') {
      if (!password) {
        setError('Silakan masukkan password penjual!');
        return;
      }
      if (password !== storedPassword) {
        setError('Password salah! Akses ditolak. Harap periksa kembali password yang Anda catat.');
        return;
      }

      sessionStorage.setItem('kantin_seller_session', 'true');
      handleReset();
      onSuccess();
      return;
    }

    // 3. CHANGE_PASSWORD (Ganti Password Penjual)
    if (mode === 'CHANGE_PASSWORD') {
      if (!oldPassword) {
        setError('Silakan masukkan password lama Anda!');
        return;
      }
      if (oldPassword !== storedPassword) {
        setError('Password lama yang Anda masukkan salah!');
        return;
      }
      if (!password || password.length < 4) {
        setError('Password baru minimal harus 4 karakter!');
        return;
      }
      if (password !== confirmPassword) {
        setError('Konfirmasi password baru tidak cocok!');
        return;
      }
      if (password === oldPassword) {
        setError('Password baru tidak boleh sama persis dengan password lama.');
        return;
      }

      localStorage.setItem('kantin_seller_password', password);
      setSuccessMsg('Password penjual berhasil diubah! Harap catat password baru ini.');
      setTimeout(() => {
        handleReset();
        onSuccess();
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            handleReset();
            onClose();
          }}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition"
          title="Tutup & Batalkan"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-gray-100">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md ${
              mode === 'SETUP'
                ? 'bg-amber-600 shadow-amber-500/20'
                : mode === 'CHANGE_PASSWORD'
                ? 'bg-blue-600 shadow-blue-500/20'
                : 'bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {mode === 'SETUP' ? (
              <ShieldAlert className="w-6 h-6" />
            ) : mode === 'CHANGE_PASSWORD' ? (
              <KeyRound className="w-6 h-6" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              {mode === 'SETUP' && 'Buat Password Penjual Baru'}
              {mode === 'VERIFY' && 'Verifikasi Akses Penjual'}
              {mode === 'CHANGE_PASSWORD' && 'Ganti Password Penjual'}
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              {mode === 'SETUP' && 'Atur password pertama kali untuk mengamankan konter'}
              {mode === 'VERIFY' && 'Area khusus staf kantin & layar monitor display'}
              {mode === 'CHANGE_PASSWORD' && 'Perbarui kata sandi operasional kantin Anda'}
            </p>
          </div>
        </div>

        {/* Important Alert Notice */}
        {mode === 'SETUP' && (
          <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block text-amber-950 mb-0.5">
                PENTING: Harap Catat Password Ini!
              </strong>
              Sistem tidak menyediakan opsi <em>Lupa Password</em> demi menjaga integritas dan keamanan konter kantin. Pastikan Anda mengingat atau mencatatnya.
            </div>
          </div>
        )}

        {mode === 'VERIFY' && (
          <div className="mb-5 p-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-600">
            Halaman ini dan Layar Display TV dilindungi. Masukkan password yang telah Anda buat untuk melanjutkan.
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 font-semibold flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 flex-shrink-0" />
            {successMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password (only in CHANGE_PASSWORD mode) */}
          {mode === 'CHANGE_PASSWORD' && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Password Lama
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50/50"
              />
            </div>
          )}

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {mode === 'CHANGE_PASSWORD'
                ? 'Password Baru'
                : mode === 'SETUP'
                ? 'Buat Password Baru'
                : 'Password Penjual'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'VERIFY' ? 'Masukkan password Anda' : 'Minimal 4 karakter'}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (in SETUP & CHANGE_PASSWORD) */}
          {(mode === 'SETUP' || mode === 'CHANGE_PASSWORD') && (
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Konfirmasi Password {mode === 'CHANGE_PASSWORD' ? 'Baru' : ''}
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password yang sama"
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="flex-1 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold text-white shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 ${
                mode === 'SETUP'
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20'
                  : mode === 'CHANGE_PASSWORD'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
              }`}
            >
              <Check className="w-4 h-4" />
              {mode === 'SETUP' && 'Simpan & Masuk'}
              {mode === 'VERIFY' && 'Buka Akses'}
              {mode === 'CHANGE_PASSWORD' && 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
