# Panduan Logging Aman & Pemecahan Masalah (Logging & Troubleshooting Guide)

**Aplikasi:** Sistem Antrean Kantin (KantinQueue)  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL) - Tugas P8  
**Standar Keamanan:** OWASP Application Security Standard  

Dokumen ini memuat standar implementasi logging aman, perbandingan format log, serta **katalog 5 skenario nyata log error**, penyebab teknisnya, dan tindakan perbaikannya langkah demi langkah.

---

## 1. Standar Implementasi Logging Aman (Safe Logging Standard)

Sistem mengadopsi prinsip **Zero Sensitive Data in Logs**:
1. **Masking Kredensial Otomatis:** Nilai field `password`, `passwordHash`, `token`, `secret`, `authorization`, dan bukti pembayaran disaring otomatis oleh modul `backend/src/utils/logger.ts` menjadi `[PROTECTED_MASKED]`.
2. **Format Terstruktur:** Setiap baris log mengikuti format:  
   `[TIMESTAMP_ISO8601] [LOG_LEVEL] [CONTEXT] Pesan Operasi | Data: {JSON}`
3. **Log Levels:**
   - `[INFO]`: Operasi normal (request HTTP, sinkronisasi pesanan, pembuatan antrean).
   - `[WARN]`: Peringatan sistem (fallback offline cache aktif, endpoint 404, validasi input ditolak).
   - `[ERROR]`: Kegagalan operasi sistem (database crash, error unhandled, sintaks query gagal).
   - `[SECURITY]`: Event keamanan (percobaan eskalasi privilege, token palsu, percobaan hapus kategori wajib).

---

## 2. Perbandingan Log Tidak Aman vs Log Aman

### ❌ Contoh Log Tidak Aman (Vulnerable / Unmasked)
```text
[2026-11-03 10:15:30] [INFO] User login request: email=penjual@kantin.ac.id, password=kantinadmin123, token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MX0...
[2026-11-03 10:15:35] [ERROR] DB Connection Failed: mysql://root:rahasia123@localhost:3306/kantin_queue
```
*Bahaya: Kata sandi pengguna dan kredensial database dapat dibaca oleh staf operasional, tersimpan di file log publik, atau terindeks ke server audit.*

### ✅ Contoh Log Aman Sistem Antrean Kantin (Safe & Masked)
```text
[2026-11-03T10:15:30.124Z] [SECURITY] [AuthService] Login attempt verified | Data: {"email":"penjual@kantin.ac.id","password":"[PROTECTED_MASKED]","token":"Bearer [MASKED_TOKEN]"}
[2026-11-03T10:15:35.450Z] [ERROR] [ErrorHandler] Database connection timeout pada 127.0.0.1:3306 | Data: {"service":"MySQL","status":"OFFLINE"}
```
*Keuntungan: Konteks audit tetap jelas untuk debugging tanpa ada risiko kebocoran data rahasia pengguna.*

---

## 3. Katalog Contoh Log Error, Penyebab, dan Tindakan Perbaikan

### 🔴 Kasus 1: Database Offline (`ECONNREFUSED` / Port 3306)

#### Tampilan Contoh Log Aman di Console:
```text
[2026-11-03T10:20:11.890Z] [ERROR] [ErrorHandler] Unhandled Server Error pada POST /api/orders | Data: {"errorName":"PrismaClientInitializationError","errorMessage":"Can't reach database server at `127.0.0.1:3306`. Please make sure your database server is running."}
[2026-11-03T10:20:11.892Z] [WARN] [OrderService] Mengaktifkan seamless offline cache fallback untuk transaksi ORD-20261103-8821
```

#### Penyebab Error:
Layanan MySQL pada XAMPP Control Panel belum diaktifkan (tombol **Start** pada modul MySQL belum diklik), atau port 3306 diblokir firewall Windows.

#### Tindakan Perbaikan:
1. Buka aplikasi **XAMPP Control Panel**.
2. Klik tombol **Start** pada baris modul **MySQL** hingga indikator berlatar belakang hijau (*Port 3306*).
3. Jika menggunakan terminal, nyalakan service MySQL via PowerShell Administrator:
   ```powershell
   net start MySQL
   ```
4. Sistem frontend Antrean Kantin dilengkapi pertahanan *Offline Cache Resiliency*, sehingga pesanan mahasiswa tetap tersimpan di penyimpanan lokal dan tidak langsung crash.

---

### 🔴 Kasus 2: Validasi Data Input Gagal (`400 Bad Request`)

#### Tampilan Contoh Log Aman di Console:
```text
[2026-11-03T10:25:44.210Z] [WARN] [MenuService] Input data menu ditolak | Data: {"name":"","price":-5000,"category":"Elektronik","reason":"Nama menu tidak boleh kosong dan harga harus lebih besar dari 0"}
[2026-11-03T10:25:44.212Z] [INFO] [HTTP] POST /api/menus - Status: 400 (3ms) | Data: {"ip":"::1","userRole":"SELLER"}
```

#### Penyebab Error:
Pengguna mengirimkan data yang melanggar batasan bisnis, misalnya nama menu kosong, harga berupa angka negatif/nol, atau kategori tidak dikenal yang belum didaftarkan penjual.

#### Tindakan Perbaikan:
1. Periksa form isian pada modal tambah menu atau keranjang.
2. Pastikan field **Nama Menu** telah terisi minimal 1 karakter.
3. Pastikan **Harga Satuan** diisi bilangan bulat positif (contoh: `15000`).
4. Jika ingin menggunakan kategori baru (contoh: *Dessert*), daftarkan kategori tersebut terlebih dahulu melalui tombol **Kelola Kategori** pada dashboard penjual.

---

### 🔴 Kasus 3: Akses Tidak Diizinkan / Privilege Escalation (`403 Forbidden`)

#### Tampilan Contoh Log Aman di Console:
```text
[2026-11-03T10:30:15.002Z] [SECURITY] [AuthGuard] Akses ditolak: Role pengguna tidak memiliki hak penjual | Data: {"userId":4,"role":"CUSTOMER","attemptedEndpoint":"DELETE /api/orders","ip":"::1"}
[2026-11-03T10:30:15.004Z] [INFO] [HTTP] DELETE /api/orders - Status: 403 (2ms) | Data: {"ip":"::1","userRole":"CUSTOMER"}
```

#### Penyebab Error:
Mahasiswa atau pihak luar mencoba menembak API mutasi admin (seperti menghapus antrean, mengubah stok menu, atau menyetujui pembayaran) tanpa menggunakan header atau token role `SELLER`.

#### Tindakan Perbaikan:
1. Pastikan pengguna membuka halaman Penjual resmi di `http://localhost:5173/seller`.
2. Masukkan password penjual pada pop-up dialog verifikasi keamanan.
3. Di sisi pengujian API (Postman / cURL), sertakan header:
   ```http
   x-user-role: SELLER
   ```

---

### 🔴 Kasus 4: Endpoint atau Sumber Daya Tidak Ditemukan (`404 Not Found`)

#### Tampilan Contoh Log Aman di Console:
```text
[2026-11-03T10:35:01.315Z] [WARN] [Router] Endpoint tidak ditemukan: GET /api/menuss | Data: {"ip":"::1","userRole":"ANONYMOUS"}
[2026-11-03T10:35:01.316Z] [INFO] [HTTP] GET /api/menuss - Status: 404 (1ms) | Data: {"ip":"::1","userRole":"ANONYMOUS"}
```

#### Penyebab Error:
Terdapat kesalahan pengetikan URL API (*typo* pada path), atau ID pesanan/menu yang dicari telah dihapus dari basis data.

#### Tindakan Perbaikan:
1. Periksa kembali struktur URL API. Daftar endpoint resmi:
   - `GET /api/menus` (Katalog menu)
   - `GET /api/menus/categories` (Daftar kategori)
   - `GET /api/orders` (Daftar pesanan)
   - `GET /api/queues` (Daftar nomor antrean aktif)
   - `GET /api/health` (Pengecekan status server)
2. Pastikan ID pesanan yang diminta memang ada di sistem.

---

### 🔴 Kasus 5: Port Server Bentrok (`EADDRINUSE: Port 5000 / 5173`)

#### Tampilan Contoh Log Aman di Console:
```text
[2026-11-03T10:40:08.100Z] [ERROR] [ServerInit] Gagal menjalankan backend server | Data: {"code":"EADDRINUSE","port":5000,"message":"Port 5000 is already in use by another process"}
```

#### Penyebab Error:
Terdapat terminal atau proses Node.js sebelumnya yang masih berjalan di latar belakang dan belum dimatikan (*hanging process*).

#### Tindakan Perbaikan:
1. **Matikan proses yang menyandera port** via PowerShell / Command Prompt:
   ```cmd
   netstat -ano | findstr :5000
   taskkill /PID <PID_NOMOR> /F
   ```
2. Atau matikan seluruh instance node yang menggantung:
   ```cmd
   taskkill /IM node.exe /F
   ```
3. Jalankan kembali server backend:
   ```bash
   cd backend
   npm run dev
   ```
