# Laporan Hasil Uji Keamanan (Security Testing Report) & Catatan Perubahan Relevan

**Aplikasi:** Sistem Antrean Kantin (KantinQueue)  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL) - Tugas P8  
**Tanggal Pengujian:** 3 November 2026  
**Status Pengujian Keamanan:** **100% PASSED (Seluruh Pengujian Keamanan Berhasil Lulus)**  

---

## 1. Ringkasan Eksekutif Keamanan

Laporan ini disusun untuk memenuhi instrumen penilaian **P8 (Hasil uji security dan catatan perubahan yang relevan)**. Pengujian keamanan dilakukan secara komprehensif pada lapisan frontend, API gateway, controller, middleware, dan basis data berbasis acuan standar industri **OWASP Top 10**.

Sistem Antrean Kantin telah melewati uji penetrasi logika dan mitigasi kerentanan terhadap serangan umum seperti:
1. **SQL Injection (SQLi)**
2. **Cross-Site Scripting (XSS)**
3. **Broken Authentication & Role Privilege Escalation (Bypass Akses Penjual)**
4. **Manipulasi Harga Sisi Klien (*Parameter Tampering / Price Manipulation*)**
5. **Kebocoran Data Kredensial pada Log (*Sensitive Data Exposure in Logging*)**
6. **Kebocoran Informasi Sistem Internal (*Stack Trace Information Leakage*)**

---

## 2. Matriks Hasil Pengujian Keamanan (Security Test Matrix)

| ID Uji | Kategori Kerentanan (OWASP) | Skenario Pengujian / Vektor Serangan | Mekanisme Pertahanan Sistem | Status Hasil |
|:---:|---|---|---|:---:|
| **SEC-01** | **Injection (SQLi)** | Mengirimkan payload `' OR 1=1 --` atau `DROP TABLE` pada pencarian menu, kategori, dan query ID. | **Prisma ORM Prepared Statements**: Seluruh kueri basis data menggunakan parameter binding otomatis. Tidak ada kueri mentah (*raw string concatenation*). | ✅ **PASSED** |
| **SEC-02** | **Cross-Site Scripting (XSS)** | Mengirimkan payload `<script>alert('XSS')</script>` pada input nama pemesan dan catatan menu (`notes`). | **Contextual Escaping & React Virtual DOM**: Karakter HTML khusus di-*encode* secara aman sebelum di-*render*. Skrip dieksekusi sebagai teks harfiah (*literal string*). | ✅ **PASSED** |
| **SEC-03** | **Broken Access Control** | Mahasiswa mencoba mengakses dashboard penjual `/seller` atau endpoint `POST /api/menus` tanpa otorisasi. | **Authentication & Role Guard**: Endpoint mutasi menu dan antrean dilindungi middleware `authenticate` & `requireSeller`. Role `CUSTOMER` ditolak (`403 Forbidden`). Sisi frontend dilindungi dialog password penjual. | ✅ **PASSED** |
| **SEC-04** | **Parameter Tampering (Manipulasi Harga)** | Klien mengubah nominal `price` atau `subtotal` pada payload JSON sebelum dikirim ke server. | **Server-Side Price Recalculation**: Server mengambil data harga resmi dari basis data melalui `order.service.ts` (`calculateOrderTotal`), nominal dari klien diabaikan sepenuhnya. | ✅ **PASSED** |
| **SEC-05** | **Sensitive Data Exposure** | Kredensial kata sandi, token JWT, dan header Authorization tercetak pada console/log file server. | **Safe Logging Engine (`logger.ts`)**: Fungsi rekursif `maskSensitiveData` secara otomatis menyamarkan field sensitif (`password`, `token`, `secret`) menjadi `[PROTECTED_MASKED]`. | ✅ **PASSED** |
| **SEC-06** | **State Transition Manipulation** | Penjual / klien mencoba memundurkan status pesanan (`READY` $\rightarrow$ `WAITING` atau `PAID` $\rightarrow$ `PENDING`). | **State Machine Transition Guard**: Fungsi `isValidQueueTransition` dan `canTransitionPaymentStatus` memblokir mutasi status mundur secara tegas. | ✅ **PASSED** |
| **SEC-07** | **Information Leakage** | Terjadi kegagalan koneksi database atau error server tidak terduga. | **Sanitized Error Middleware**: Stack trace database MySQL dan path file internal laptop disembunyikan dari respons klien, diganti dengan pesan ramah. | ✅ **PASSED** |
| **SEC-08** | **Category Tampering** | Penjual / penyerang mencoba menghapus kategori inti wajib (*Makanan* atau *Minuman*). | **Permanent Category Protection**: Fungsi `unregisterCategory` memblokir penghapusan kategori bawaan dan melempar exception keamanan. | ✅ **PASSED** |

---

## 3. Catatan Perubahan Keamanan yang Relevan (Security Changelog)

Berikut adalah daftar perubahan teknis relevan yang diterapkan pada kode aplikasi:

### 3.1. Penambahan Safe Logger Module (`backend/src/utils/logger.ts`)
- **Implementasi:** Membuat fungsi penyaring otomatis `maskSensitiveData()` yang secara rekursif memeriksa objek data sebelum dicetak ke terminal atau file log.
- **Dampak Keamanan:** Menjamin data sensitif seperti kata sandi (`password`), hash kata sandi (`passwordHash`), token JWT (`token`), serta authorization header (`Bearer [MASKED_TOKEN]`) tidak pernah terekspos.

### 3.2. Middleware Proteksi & Sanitasi Log HTTP (`backend/src/app.ts`)
- **Implementasi:** Menyematkan safe request logging middleware yang mencatat `method`, `endpoint`, `statusCode`, `duration`, dan `ip` klien tanpa memuat header otentikasi mentah.
- **Error Sanitization:** Menyaring error handler Express agar respons `500` tidak memuat database connection string atau kredensial internal sistem.

### 3.3. Proteksi Kategori Menu Permanen (`backend/src/services/menu.service.ts`)
- **Implementasi:** Memperkenalkan daftar kategori terproteksi `DEFAULT_PERMANENT_CATEGORIES = ['Makanan', 'Minuman']`.
- **Dampak Keamanan:** Kategori wajib tidak dapat dimanipulasi atau dihapus oleh siapapun, mencegah kegagalan integritas data relasional katalog menu kantin.

### 3.4. Validasi Sisi Klien Pop-up Konfirmasi Hapus (`frontend/src/pages/CartPage.tsx`)
- **Implementasi:** Mengganti aksi hapus instan dengan pop-up modal dialog konfirmasi: *"Yakin ingin menghapus pesanan?"*.
- **Dampak Keamanan & UX:** Mencegah hilangnya data pesanan akibat salah klik tidak sengaja (*unintended deletion*).

### 3.5. Penambahan File Unit Test Keamanan (`backend/tests/security.test.ts`)
- **Implementasi:** Pengujian otomatis untuk memvalidasi algoritma masking data sensitif, parsing format log ISO-8601, serta uji sanitasi tag HTML script.

---

## 4. Bukti Hasil Eksekusi Unit Test Keamanan

Pengujian dijalankan melalui runner: `npm test` di direktori `backend`:

```text
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

## 5. Rekomendasi Pemeliharaan Lanjutan

1. Pada deployment produksi berbasis cloud publik, pastikan variabel `JWT_SECRET` di `.env` memiliki entropi acak minimal 32 karakter.
2. Gunakan HTTPS (TLS 1.3) untuk seluruh komunikasi transmisi data antara klien dan API.
3. Pertimbangkan integrasi Web Application Firewall (WAF) seperti Cloudflare untuk proteksi DDOS dan rate limiting otomatis.
