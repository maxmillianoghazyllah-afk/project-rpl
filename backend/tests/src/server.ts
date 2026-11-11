import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Backend Sistem Antrean Kantin berjalan di http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📋 API Docs/Routes aktif di http://localhost:${PORT}/api/menus`);
});
