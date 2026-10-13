
1. Jalankan Aplikasi:
   - Terminal 1: `cd backend && npm run dev` (API berjalan di `http://localhost:5000`)
   - Terminal 2: `cd frontend && npm run dev` (Web berjalan di `http://localhost:5173`)
2. Demo Fitur 1 (Pemesanan):
   - Buka `http://localhost:5173` dalam mode Mahasiswa.
   - Tambah *Nasi Goreng Spesial* (Rp 15.000) dan *Es Teh Manis Jumbo* (Rp 4.000) ke keranjang.
   - Buka halaman Keranjang, periksa total pesanan dihitung otomatis (Rp 19.000), lalu tekan **Lanjut Bayar QRIS**.
3. Demo Fitur 2 (Pembayaran QRIS & Antrean):
   - Di halaman pembayaran, periksa kode QRIS resmi kantin dan klik **Saya Sudah Bayar (Konfirmasi)**.
   - Klik toggle **Penjual** di sudut kanan atas navbar.
   - Di tab **Pesanan Masuk**, lihat pesanan baru lalu klik **Setujui Pembayaran**.
   - Perhatikan nomor antrean `A-001` langsung terbit otomatis.
   - Buka tab **Layar Display Monitor** di tab penjual dan periksa nomor `A-001` berpindah dari *Sedang Disiapkan* ke *Siap Diambil*.
