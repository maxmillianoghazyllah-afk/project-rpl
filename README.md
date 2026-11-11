# Sistem Antrean Kantin (KantinQueue)

Aplikasi web modern berbasis arsitektur client-server monorepo untuk mengeliminasi kerumunan antrean di konter kantin kampus melalui alur digital terpadu: **Pemesanan Menu $\rightarrow$ Pembayaran QRIS $\rightarrow$ Verifikasi Penjual $\rightarrow$ Panggilan Nomor Antrean pada Monitor TV Konter 3 Kolom**.

---

## 📌 Ringkasan Teknologi (*Tech Stack*)

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend API:** Node.js, Express.js, TypeScript
- **ORM & Database:** Prisma ORM, MySQL (Disarankan via XAMPP port 3306)
- **Pengujian (Testing):** Node.js Native Test Runner & Assertions (`npm test`)
- **Status Pengujian:** ✅ **100% PASSED (Seluruh 6 Unit Test Files Lulus: 32 Assertions)**

---

## 🚀 Panduan Instalasi Ulang (*Fresh Clone Repository Guide*)

Ikuti langkah-langkah di bawah ini untuk menginstalasi ulang aplikasi dari *fresh clone repository* hingga aplikasi siap dijalankan:

### 1. Clone Repository & Masuk ke Folder Proyek
```bash
git clone https://github.com/AkunAnda/KantinQueue.git
cd RPL
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` di dalam folder `backend`:
```bash
# Windows Command Prompt
copy backend\.env.example backend\.env

# Atau PowerShell / Linux / MacOS
cp backend/.env.example backend/.env
```

Isi default konfigurasi `.env`:
```env
PORT=5000
DATABASE_URL="mysql://root:@127.0.0.1:3306/kantin_queue"
JWT_SECRET="kantin-secret-token-key-2026"
CORS_ORIGIN="http://localhost:5173"
```

### 3. Instalasi Seluruh Dependensi (*Monorepo Dependencies*)
Jalankan perintah instalasi otomatis untuk root, backend, dan frontend sekaligus:
```bash
npm run install:all
```
*(Atau lakukan secara manual: `cd backend && npm install`, lalu `cd ../frontend && npm install`).*

---

## 🗄️ Sinkronisasi Basis Data & Seeding Awal

1. **Nyalakan Service MySQL**: Buka **XAMPP Control Panel**, lalu klik tombol **Start** pada modul **MySQL** (pastikan aktif di port `3306`).
2. **Sinkronkan Skema & Isi Data Contoh**:
   ```bash
   # Dari root folder RPL:
   npm run prisma:push
   npm run prisma:seed
   ```
   *Perintah ini akan membuat database `kantin_queue` beserta tabel `User`, `Menu`, `Order`, `OrderItem`, `Payment`, `Queue`, dan mengisi 8 menu awal.*

> **Catatan Ketahanan Offline (*Offline Cache Resiliency*):**  
> Jika MySQL lokal belum menyala saat demonstrasi berlangsung, sistem memiliki *fallback caching* otomatis pada browser dan API client sehingga aplikasi tetap dapat mendemonstrasikan katalog menu, keranjang, dan pemesanan tanpa mengalami crash *Can't reach database server*.

---

## 🧪 Menjalankan Seluruh Unit Test (Verifikasi Aturan Bisnis & Keamanan)

Sistem dilengkapi **6 file unit test komprehensif** yang menguji aturan bisnis tanpa ketergantungan koneksi jaringan:

```bash
# Dari root folder RPL:
npm test

# Atau masuk ke folder backend:
cd backend
npm test
```

### Hasil Pengujian yang Diharapkan:
```text
🧪 Menjalankan Unit Tests: Fitur 1 - Pemesanan & Kalkulasi Pesanan...
  ✔ [PASS] calculateItemSubtotal mengembalikan subtotal yang benar
  ✔ [PASS] calculateItemSubtotal menolak kuantitas <= 0
  ✔ [PASS] calculateItemSubtotal menolak harga negatif
  ✔ [PASS] calculateOrderTotal menjumlahkan seluruh subtotal secara presisi
  ✔ [PASS] processOrderItems menghasilkan kalkulasi item dan total yang benar
  ✔ [PASS] processOrderItems menolak menu yang tidak tersedia (habis)
  ✔ [PASS] generateOrderNumber menghasilkan format ORD-YYYYMMDD-XXXX
  ✔ [PASS] processOrderItems menyimpan catatan khusus pesanan mahasiswa dengan benar
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
  ✔ [PASS] registerCategory & unregisterCategory mengelola kategori kustom & melindungi kategori permanen
🎉 Seluruh Unit Test Manajemen Menu BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Autentikasi & Hak Akses Pengguna (auth.test.ts)...
  ✔ [PASS] isValidEmailFormat memverifikasi struktur format email secara valid
  ✔ [PASS] isValidPassword menerapkan syarat minimal 6 karakter
  ✔ [PASS] determineUserRole menetapkan role CUSTOMER secara aman sebagai default
  ✔ [PASS] hasSellerPrivilege membatasi akses khusus penjual kantin
🎉 Seluruh Unit Test Autentikasi & Hak Akses BERHASIL LULUS!

🧪 Menjalankan Unit Tests: Keamanan Sistem & Safe Logging (security.test.ts)...
  ✔ [PASS] maskSensitiveData menyamarkan password, hash, dan token otentikasi secara rekursif
  ✔ [PASS] maskSensitiveData menyamarkan token pada header Authorization
  ✔ [PASS] formatLogEntry menghasilkan log terstruktur dan bebas dari kebocoran kredensial
  ✔ [PASS] Input catatan pesanan diperlakukan sebagai literal text untuk mencegah eksekusi skrip
🎉 Seluruh Unit Test Keamanan & Safe Logging BERHASIL LULUS!

================================================================
✅ SELURUH 6 UNIT TEST FILES FITUR INTI & KEAMANAN P8 BERHASIL LULUS (ALL PASSED)
================================================================
```

---

## 📦 Membangun Aplikasi untuk Produksi (*Production Build*)

Jalankan perintah build dari root proyek untuk memverifikasi tidak ada kesalahan TypeScript pada frontend maupun backend:
```bash
npm run build
```
- Output backend tersimpan di: `backend/dist/`
- Output frontend tersimpan di: `frontend/dist/`

---

## 💻 Menjalankan Server Aplikasi (Mode Development)

Buka **2 jendela terminal terpisah**:

### Terminal 1: Backend Server (Port 5000)
```bash
cd backend
npm run dev
```
*Backend API aktif di:* **`http://localhost:5000`** *(Health check: `http://localhost:5000/api/health`)*

### Terminal 2: Frontend Web UI (Port 5173)
```bash
cd frontend
npm run dev
```
*Frontend UI aktif di:* **`http://localhost:5173`**

---

## 🖥️ Alamat Akses & Skenario Demonstrasi Aplikasi

Buka browser Anda dan gunakan 3 tab untuk mensimulasikan lingkungan kantin nyata:

| Peran Pengguna | URL Halaman | Fitur Utama yang Didemonstrasikan |
|---|---|---|
| **Mahasiswa** *(Pemesan)* | `http://localhost:5173/` | 1. Melihat menu makanan/minuman.<br>2. Filter kategori: **Semua**, **Makanan**, **Minuman**, dan **Lainnya** (mencakup Camilan & kategori kustom penjual).<br>3. Tambah menu ke keranjang.<br>4. **Fitur Catatan Pemesanan**: Menambahkan catatan khusus per item (misal: *"Tidak pedas, es sedikit"*).<br>5. **Pop-up Konfirmasi Hapus**: Dialog konfirmasi *"Yakin ingin menghapus pesanan?"* saat klik hapus.<br>6. Checkout QRIS & konfirmasi bayar instan 1-klik.<br>7. Pantau status nomor antrean langsung dari HP. |
| **Penjual Kantin** *(Pengelola)* | `http://localhost:5173/seller` | 1. **Proteksi Password**: Dialog verifikasi keamanan (setup awal password mandiri / demo: `admin123`).<br>2. **Unggah QRIS Toko Kustom**: Mengunggah gambar QRIS resmi (.png / .jpg) yang langsung tayang pada layar checkout mahasiswa.<br>3. **Verifikasi Pembayaran & Terbit Antrean Otomatis**: Menyetujui tagihan QRIS dan sistem langsung menerbitkan nomor antrean sekuensial unik (`A-001`).<br>4. **Tampilan Catatan Mahasiswa**: Koki dapat melihat catatan khusus pemesan di setiap item kartu pesanan.<br>5. **Pembersihan Antrean**: Hapus antrean per item atau klik *"Bersihkan Semua Antrean"* agar tidak menumpuk.<br>6. **Manajemen Kategori Dinamis**: Tambah kategori baru dan hapus kategori kustom (Kategori Makanan & Minuman permanen dan dilindungi). |
| **Layar Monitor TV Kantin** | `http://localhost:5173/seller/display` | 1. Tampilan layar lebar konter TV dengan **3 Kolom Antrean Lengkap**: 🟡 **Belum Dimasak**, 🟣 **Sedang Disiapkan**, 🟢 **Silakan Ambil** (Auto-refresh 4 detik).<br>2. Opsi tombol **Menu Tersedia** (menampilkan status stok menu Tersedia vs Habis untuk mahasiswa yang lewat).<br>3. Opsi **Split Mode** (Antrean dan Ketersediaan Menu berdampingan).<br>*(Tekan F11 pada keyboard untuk fullscreen TV mode)*. |

---

## 📑 Dokumen Kelengkapan Tugas P8

| Dokumen | Path Berkas | Deskripsi & Isi Dokumen |
|---|---|---|
| **Laporan Hasil Uji Security** | [`SECURITY_TESTING_REPORT.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/SECURITY_TESTING_REPORT.md) | Hasil pengujian OWASP Top 10 (SQLi, XSS, RBAC, Data Masking, State Machine) & Catatan Perubahan Keamanan Relevan. |
| **Panduan Deployment (VPS & RPi)** | [`DEPLOYMENT.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/DEPLOYMENT.md) | Panduan instalasi di VPS & Raspberry Pi/Orange Pi, Docker Compose, Nginx SSL, subpath `https://<ip>/kantin`, dan Kiosk TV. |
| **Laporan Resmi Deployment** | [`LAPORAN_DEPLOYMENT.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/LAPORAN_DEPLOYMENT.md) | Tautan percobaan live reviewer, bukti hasil build & unit test, serta panduan screenshot 6 alur aplikasi. |
| **Panduan Logging & Troubleshooting** | [`LOGGING_AND_TROUBLESHOOTING.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/LOGGING_AND_TROUBLESHOOTING.md) | Standar log aman tanpa kebocoran data, perbandingan log unmasked vs masked, serta **5 kasus nyata log error, penyebab, dan tindakan perbaikannya**. |
| **Checklist Fitur & Pengujian** | [`checklist_mvp.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/checklist_mvp.md) | Matriks 5 User Story, Kriteria Keberterimaan, Fitur P8, dan bukti unit test 100% PASSED. |
| **Panduan Skenario Rekaman Demo** | [`LANGKAH_PENGGUNAAN_DEMO.txt`](file:///c:/Users/VIVOBOOK/Downloads/RPL/LANGKAH_PENGGUNAAN_DEMO.txt) | Naskah urutan aksi dan percakapan langkah demi langkah siap pakai saat perekaman video presentasi. |

---

## 🛡️ Kebijakan Keamanan dan Berkas yang Diabaikan Git

File-file berikut telah diatur di dalam [`.gitignore`](file:///c:/Users/VIVOBOOK/Downloads/RPL/.gitignore) dan tidak di-push ke GitHub untuk mencegah kebocoran data rahasia dan membengkaknya ukuran repositori:
- `node_modules/` *(Folder dependensi library)*
- `backend/.env` *(Konfigurasi kredensial lokal)*
- `dist/` & `build/` *(Hasil kompilasi build produksi)*
- `*.log` *(File catatan log aktivitas sistem)*
