import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Gunakan './' saat build agar aset relatif kompatibel subpath (/kantin)
  // Gunakan '/' saat dev server agar modul Vite dan HMR berjalan lancar tanpa blank
  base: command === 'build' ? './' : '/',
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
}));
