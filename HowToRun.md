# Panduan Menjalankan Aplikasi (HowToRun.md)

**Aplikasi:** Sistem Antrean Kantin (KantinQueue) - MVP Version 1  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Teknologi:** React 18, TypeScript, Vite, Tailwind CSS, Node.js, Express, Prisma ORM, MySQL.

Dokumen ini memuat panduan lengkap langkah demi langkah untuk menjalankan, menguji, dan mendemonstrasikan aplikasi Sistem Antrean Kantin di komputer lokal.

---

## 1. Prasyarat Sistem (*Prerequisites*)

Sebelum menjalankan aplikasi, pastikan perangkat Anda telah terpasang:
1. **Node.js**: Versi LTS v18.x, v20.x, atau v24.x (disertai `npm`).
   - Cek versi: `node -v` dan `npm -v`
2. **Database MySQL**: Disarankan menggunakan **XAMPP** atau MySQL standalone di port `3306`.
3. **Web Browser Modern**: Google Chrome, Microsoft Edge, atau Mozilla Firefox.

---

## 2. Langkah Instalasi Dependensi

Buka terminal (PowerShell / Command Prompt / Bash) pada root folder proyek `RPL`:

```bash
# Opsi 1: Instalasi otomatis seluruh dependensi monorepo
npm run install:all

# Opsi 2: Instalasi manual per folder
cd backend
npm install
cd ../frontend
npm install
cd ..
```

---

## 3. Konfigurasi Basis Data (Database MySQL)

1. **Nyalakan Service MySQL**:
   - Jika menggunakan **XAMPP**, buka *XAMPP Control Panel* lalu klik tombol **Start** pada modul **MySQL**.
   - Atau via service Windows: pastikan service MySQL aktif di port `3306`.

2. **Periksa File Lingkungan (`.env`)**:
   Pastikan file `backend/.env` telah terisi konfigurasi database lokal Anda (bisa disalin dari `backend/.env.example`):
   ```env
   PORT=5000
   DATABASE_URL="mysql://root:@127.0.0.1:3306/kantin_queue"
   JWT_SECRET="kantin-secret-token-key-2026"
   CORS_ORIGIN="http://localhost:5173"
   ```

3. **Sinkronisasi Skema & Pengisian Data Awal (*Seeding*)**:
   Masuk ke folder `backend` dan jalankan perintah berikut:
   ```bash
   cd backend
   npx prisma db push
   npx ts-node prisma/seed.ts
   cd ..
   ```
   *Perintah ini akan membuat database `kantin_queue`, membuat tabel `User`, `Menu`, `Order`, `OrderItem`, `Payment`, `Queue`, serta mengisikan 8 menu awal dan akun contoh.*

---

## 4. Menjalankan Seluruh Unit Test (Verifikasi Aturan Bisnis)

Sistem dilengkapi dengan 5 file unit test terpisah yang menguji aturan bisnis tanpa ketergantungan koneksi jaringan.

Jalankan perintah berikut di folder `backend`:
```bash
cd backend
npm test
```
**Hasil yang Diharapkan:**
```text
🧪 Menjalankan Unit Tests: Fitur 1 - Pemesanan & Kalkulasi Pesanan...
  ✔ [PASS] calculateItemSubtotal mengembalikan subtotal yang benar
  ✔ [PASS] calculateItemSubtotal menolak kuantitas <= 0
  ✔ [PASS] calculateItemSubtotal menolak harga negatif
  ✔ [PASS] calculateOrderTotal menjumlahkan seluruh subtotal secara presisi
  ✔ [PASS] processOrderItems menghasilkan kalkulasi item dan total yang benar
  ✔ [PASS] processOrderItems menolak menu yang tidak tersedia (habis)
  ✔ [PASS] generateOrderNumber menghasilkan format ORD-YYYYMMDD-XXXX
🎉 Seluruh Unit Test Fitur 1 (Order Service) BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Fitur 2 - Pembayaran QRIS & Manajemen Antrean...
  ✔ [PASS] formatQueueNumber menghasilkan padding 3 digit yang tepat (A-001)
  ✔ [PASS] formatQueueNumber menolak angka 0, negatif, atau desimal
  ✔ [PASS] isValidPaymentTransition memvalidasi alur persetujuan & penolakan QRIS
  ✔ [PASS] isValidQueueTransition mencegah perubahan status antrean mundur ilegal
  ✔ [PASS] mapQueueStatusToOrderStatus menyinkronkan status pesanan secara presisi
🎉 Seluruh Unit Test Fitur 2 (Queue Service) BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Pembayaran QRIS (payment.test.ts)...
  ✔ [PASS] validatePaymentAmount memverifikasi nominal tagihan secara tepat
  ✔ [PASS] validatePaymentAmount menolak nominal negatif atau nol
  ✔ [PASS] validatePaymentMethod memastikan hanya QRIS yang diizinkan pada MVP 1
  ✔ [PASS] canTransitionPaymentStatus mengizinkan transisi valid dari PENDING
  ✔ [PASS] canTransitionPaymentStatus mengunci status PAID agar tidak dapat dibatalkan sembarangan
🎉 Seluruh Unit Test Pembayaran QRIS BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Manajemen Menu Kantin (menu.test.ts)...
  ✔ [PASS] validateMenuData memvalidasi menu valid dengan benar
  ✔ [PASS] validateMenuData menolak nama kosong dan harga <= 0
  ✔ [PASS] validateMenuData membatasi kategori hanya Makanan, Minuman, atau Camilan
  ✔ [PASS] determineMenuDeletionStrategy melindungi integritas riwayat pesanan
  ✔ [PASS] filterMenuList menyaring kategori, pencarian, dan stok secara presisi
🎉 Seluruh Unit Test Manajemen Menu BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Autentikasi & Hak Akses Pengguna (auth.test.ts)...
  ✔ [PASS] isValidEmailFormat memverifikasi struktur format email secara valid
  ✔ [PASS] isValidPassword menerapkan syarat minimal 6 karakter
  ✔ [PASS] determineUserRole menetapkan role CUSTOMER secara aman sebagai default
  ✔ [PASS] hasSellerPrivilege membatasi akses khusus penjual kantin
🎉 Seluruh Unit Test Autentikasi & Hak Akses BERHASIL LULUS!

================================================================
✅ SELURUH 5 UNIT TEST FILES FITUR INTI MVP 1 BERHASIL LULUS (ALL PASSED)
================================================================
```

---

## 5. Menjalankan Server Aplikasi (Mode Development)

Buka **2 terminal terpisah**:

### Terminal 1: Menjalankan Backend API Server
```bash
cd backend
npm run dev
```
*Server API Express akan aktif pada alamat:* **`http://localhost:5000`**  
*Cek health endpoint:* `http://localhost:5000/api/health`

### Terminal 2: Menjalankan Frontend Web UI
```bash
cd frontend
npm run dev
```
*Aplikasi Web UI Vite akan aktif pada alamat:* **`http://localhost:5173`**

---

## 6. Skenario Demonstrasi Lengkap (Demo Walkthrough)

Buka browser Anda ke **`http://localhost:5173`**:

### Skenario A: Alur Mahasiswa (Pemesanan & Pembayaran QRIS)
1. **Pilih Menu**:
   - Telusuri menu kantin, coba gunakan filter kategori (**Semua**, **Makanan**, **Minuman**) atau kolom pencarian (misal: ketik "Goreng").
   - Klik tombol **+ Tambah** pada menu *Nasi Goreng Spesial* (Rp 15.000) dan *Es Teh Manis Jumbo* (Rp 4.000).
2. **Review Keranjang & Isi Nama Pemesan**:
   - Klik tab **Keranjang** di navbar atas.
   - Masukkan nama Anda pada kolom **Nama Pemesan** (contoh: Alex / Sinta).
   - Ubah jumlah porsi menggunakan tombol `+` atau `-`. Periksa total harga yang terkalkulasi otomatis.
   - Klik tombol **Lanjut Bayar QRIS**.
3. **Pembayaran QRIS & Konfirmasi 1-Klik**:
   - Perhatikan tampilan kartu resmi QRIS kantin dengan total tagihan yang sesuai (mendukung gambar QRIS toko yang diunggah penjual).
   - Klik tombol hijau **Saya Sudah Bayar (Konfirmasi)** (konfirmasi langsung 1-klik tanpa perlu mengisi catatan/link bukti transfer).
   - Klik **Pantau Status Antrean** untuk diarahkan ke layar pemantau antrean mahasiswa.

### Skenario B: Alur Penjual (Approval Bayar, Manajemen Antrean, & Display TV)
1. **Beralih ke Mode Penjual & Verifikasi Password**:
   - Di sudut kanan atas navbar, klik tombol switch **Penjual** (atau buka URL `http://localhost:5173/seller`).
   - Masukkan password penjual pada pop-up keamanan (jika pertama kali, buat password baru dan catat dengan baik).
2. **Unggah QRIS Toko Kustom (Opsional)**:
   - Klik tombol **Unggah QRIS Toko** di bar atas dashboard.
   - Pilih file gambar QRIS resmi kantin Anda (.png atau .jpg). Gambar ini langsung tampil pada layar pembayaran QRIS mahasiswa.
3. **Persetujuan Pembayaran & Penomoran Antrean**:
   - Pada tab **Pesanan Masuk**, cari pesanan mahasiswa yang baru masuk (berstatus *WAITING_PAYMENT*).
   - Klik tombol **Setujui Pembayaran**.
   - Sistem akan otomatis mengubah status pembayaran menjadi `PAID`, pesanan menjadi `CONFIRMED`, dan **menerbitkan nomor antrean sekuensial (misal: `A-001`)**.
4. **Layar Display Monitor Panggilan Antrean 3 Kolom**:
   - Buka tab **Layar Display Monitor** (`http://localhost:5173/seller/display`).
   - Amati tampilan papan TV 3 kolom:
     - **Kolom 1 (Kuning): Belum Dimasak** (nomor antrean mahasiswa yang baru disetujui).
     - **Kolom 2 (Ungu): Sedang Disiapkan** (setelah koki klik *Mulai Masak*).
     - **Kolom 3 (Hijau): Silakan Ambil** (setelah pesanan matang dan siap diambil di konter).
   - Terdapat juga tombol **Menu Tersedia** untuk menampilkan menu yang Tersedia vs Habis.
5. **Pembersihan & Penghapusan Antrean (Mencegah Antrean Menumpuk)**:
   - Penjual dapat menghapus antrean pesanan secara individual menggunakan ikon **Tong Sampah** pada setiap kartu pesanan.
   - Penjual juga dapat mengklik tombol **Bersihkan Semua Antrean** di bar atas untuk mengosongkan seluruh antrean selesai sekaligus agar daftar antrean tidak menumpuk.
6. **Kelola Menu**:
   - Klik tab **Kelola Menu** untuk menambah menu baru atau mematikan switch ketersediaan (*Tersedia* $\rightarrow$ *Habis*).

---

## 7. Pemecahan Masalah Umum (*Troubleshooting*)

- **Error: `Can't reach database server at 127.0.0.1:3306`**:  
  Pastikan service MySQL di XAMPP sudah dalam kondisi **Running** (berwarna hijau).
- **Error PowerShell: `cannot be loaded because running scripts is disabled`**:  
  Jalankan perintah ini di PowerShell sekali saja:  
  `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
- **Port 5000 / 5173 Sedang Dipakai**:  
  Pastikan tidak ada instance node lain yang berjalan di background, atau ubah nilai port di `.env` dan `vite.config.ts`.
