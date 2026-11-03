# Checklist Fitur MVP, Status Pengujian & Keamanan (checklist_mvp.md)

**Aplikasi:** Sistem Antrean Kantin (KantinQueue) - MVP Version 1.0 (Penyempurnaan P8)  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL) - Tugas P8  
**Status Akhir Proyek:** **SELESAI & SIAP DIDEMONSTRASIKAN (READY FOR DEMO / DEPLOY)**  
**Status Pengujian Unit Test:** **100% PASSED (Seluruh 6 File Lulus: 32/32 Assertions)**  

---

## 1. Ringkasan Eksekutif MVP & Penyempurnaan P8

Sistem Antrean Kantin (**KantinQueue**) dikembangkan untuk mengeliminasi kerumunan fisik di depan konter kantin kampus melalui alur digital terintegrasi:
1. Pemesanan menu makanan/minuman dengan kalkulasi harga otomatis di keranjang.
2. **Fitur Catatan Pemesanan (P8)**: Mahasiswa dapat menambahkan catatan khusus per item (misal: *"Tidak pedas", "Es sedikit"*).
3. **Pop-up Konfirmasi Hapus (P8)**: Mahasiswa diberikan dialog konfirmasi *"Yakin ingin menghapus pesanan?"* untuk mencegah salah klik.
4. Pembayaran non-tunai berbasis **QRIS** (mendukung unggah QRIS kustom PNG/JPG oleh penjual) dengan konfirmasi 1-klik instan.
5. Verifikasi pesanan oleh penjual dan penerbitan **Nomor Antrean Otomatis** sekuensial (`A-001`, `A-002`).
6. **Manajemen Kategori Dinamis (P8)**: Penjual dapat menambah kategori baru dan menghapus kategori kustom (Kategori Makanan & Minuman dilindungi permanen).
7. **Filter Kategori Mahasiswa (P8)**: Tab filter mencakup *Semua*, *Makanan*, *Minuman*, dan *Lainnya* (mencakup Camilan & kategori kustom).
8. Pemantauan antrean real-time pada **Layar Display TV Konter 3 Kolom** (*Belum Dimasak*, *Sedang Disiapkan*, dan *Silakan Ambil*).
9. **Standar Logging Aman & Uji Keamanan OWASP (P8)**: Penyamaran data sensitif (masking password & token), sanitized error handling, serta proteksi SQLi/XSS.

---

## 2. Checklist 5 User Stories Inti & Acceptance Criteria

| ID User Story | User Story | Acceptance Criteria (Kriteria Keberterimaan) | Status Implementasi | Status Verifikasi |
|---|---|---|:---:|:---:|
| **US-01** | **Sebagai Mahasiswa**, saya ingin melihat daftar menu kantin beserta harga, kategori, dan status ketersediaan secara real-time agar saya dapat memilih makanan tanpa harus datang berkerumun di konter. | 1. Menampilkan daftar menu dengan gambar, nama, harga (format IDR), dan kategori.<br>2. Menu yang habis memiliki label *Habis* dan tombol tambah nonaktif.<br>3. Tersedia fitur filter kategori (*Semua, Makanan, Minuman, Lainnya*) dan pencarian teks. | ✅ **TERSELESAIKAN** | Terverifikasi di UI & `menu.test.ts` |
| **US-02** | **Sebagai Mahasiswa**, saya ingin memilih menu, mengatur jumlah porsi di keranjang, memasukkan nama pemesan, dan melihat kalkulasi total harga otomatis agar pesanan saya akurat sebelum membayar. | 1. Input nama pemesan mandiri (tanpa default nama orang lain).<br>2. Opsi input catatan pemesanan per item makanan/minuman.<br>3. Pop-up konfirmasi sebelum menghapus pesanan dari keranjang.<br>4. Subtotal per item dan total pembayaran dikalkulasi akurat.<br>5. Tombol checkout dinonaktifkan jika keranjang kosong. | ✅ **TERSELESAIKAN** | Terverifikasi di UI & `order.test.ts` |
| **US-03** | **Sebagai Mahasiswa**, saya ingin membayar pesanan menggunakan QRIS resmi kantin dan mengonfirmasi pembayaran 1-klik agar pesanan saya dapat segera diproses penjual. | 1. Sistem menerbitkan kode pesanan unik (format: `ORD-YYYYMMDD-XXXX`).<br>2. Tampilan QRIS memuat tagihan presisi dan mendukung gambar QRIS kustom toko.<br>3. Tombol konfirmasi 1-klik langsung mengirim status ke penjual tanpa input catatan tambahan.<br>4. Status pesanan awal tercatat sebagai `WAITING_PAYMENT`. | ✅ **TERSELESAIKAN** | Terverifikasi di UI & `payment.test.ts` |
| **US-04** | **Sebagai Penjual Kantin**, saya ingin memverifikasi pembayaran QRIS mahasiswa, menerbitkan nomor antrean otomatis, dan menghapus antrean agar pesanan tidak menumpuk. | 1. Penjual melihat daftar pesanan yang menunggu verifikasi beserta catatan khusus pemesan.<br>2. Penjual dapat menyetujui (*Approve*) atau menolak (*Reject*) pembayaran.<br>3. Saat pembayaran disetujui, sistem otomatis menerbitkan nomor antrean sekuensial (`A-001`, `A-002`).<br>4. Penjual dapat menghapus antrean per item atau membersihkan seluruh antrean sekaligus. | ✅ **TERSELESAIKAN** | Terverifikasi di UI & `queue.test.ts` |
| **US-05** | **Sebagai Mahasiswa & Penjual**, saya ingin memantau dan memperbarui progres antrean (Belum Dimasak $\rightarrow$ Disiapkan $\rightarrow$ Siap Diambil $\rightarrow$ Selesai) secara real-time agar alur tertib. | 1. Penjual dapat memajukan status pesanan secara bertahap (`WAITING` $\rightarrow$ `PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`).<br>2. Halaman **Layar Display TV Konter** menampilkan **3 Kolom Lengkap**: *Belum Dimasak*, *Sedang Disiapkan*, dan *Silakan Ambil* (auto-refresh 4 detik).<br>3. Tersedia opsi Papan Ketersediaan Menu (*Tersedia / Habis*) di layar monitor TV.<br>4. Sistem mencegah transisi mundur ilegal. | ✅ **TERSELESAIKAN** | Terverifikasi di UI & `queue.test.ts` |

---

## 3. Checklist Fitur Tambahan & Penyempurnaan P8

| Fitur | Deskripsi | Status | Keterangan |
|---|---|---|---|
| **Catatan Pemesanan Khusus** | Mahasiswa dapat mengetik catatan per item (misal: "Jangan pedas", "Es sedikit"). | ✅ **LENGKAP** | Ditampilkan di keranjang belanja dan kartu pesanan penjual. |
| **Pop-up Konfirmasi Hapus** | Muncul dialog konfirmasi *"Yakin ingin menghapus pesanan?"* saat klik hapus item / kosongkan keranjang. | ✅ **LENGKAP** | Mencegah terhapusnya pesanan secara tidak sengaja. |
| **Manajemen Kategori Dinamis** | Penjual dapat menambah kategori baru dan menghapus kategori kustom. | ✅ **LENGKAP** | Kategori *Makanan* dan *Minuman* dilindungi permanen (tidak dapat dihapus). |
| **Kategori "Lainnya" Mahasiswa** | Kategori Camilan dan seluruh kategori baru otomatis dikelompokkan ke tab *"Lainnya"*. | ✅ **LENGKAP** | Menyederhanakan navigasi filter di sisi mahasiswa. |
| **Safe Logging & Data Masking** | Masking otomatis data sensitif (password, JWT token) pada log server. | ✅ **LENGKAP** | Mengikuti standar OWASP Zero Sensitive Data Exposure. |
| **Layar Display TV 3 Kolom** | Menampilkan antrean lengkap: 1) Belum Dimasak, 2) Sedang Disiapkan, 3) Silakan Ambil. | ✅ **LENGKAP** | Auto-refresh 4 detik di route `/seller/display`. |
| **Proteksi Password Penjual & Display** | Mahasiswa diblokir dari sisi penjual dan layar TV; membutuhkan verifikasi password mandiri. | ✅ **LENGKAP** | Pop-up setup pertama kali, verifikasi, ganti password, dan kunci mode. |
| **Offline Cache Resiliency** | Sistem tetap dapat memesan dan memproses antrean meskipun MySQL sedang offline. | ✅ **LENGKAP** | Mencegah crash *Can't reach database server* saat demonstrasi. |

---

## 4. Matriks Pengujian Unit Test (6 File Aturan Bisnis & Keamanan - ALL PASSED)

Pengujian logika domain bisnis dieksekusi melalui runner: `cd backend && npm test`

| No | File Unit Test | Fokus Aturan Bisnis & Keamanan yang Diuji | Jumlah Assertions | Hasil Pengujian |
|:---:|---|---|:---:|:---:|
| 1 | **`order.test.ts`** | - Perhitungan subtotal ($harga \times kuantitas$).<br>- Penolakan kuantitas $\le 0$ & harga negatif.<br>- Kalkulasi total pembayaran pesanan secara presisi.<br>- Penolakan menu habis.<br>- Format nomor pesanan unik (`ORD-YYYYMMDD-XXXX`).<br>- Penyimpanan catatan pemesanan per item. | 8 Kasus Uji | **PASSED** (100%) |
| 2 | **`queue.test.ts`** | - Padding nomor antrean sekuensial 3 digit (`A-001`).<br>- Penolakan nomor antrean nol/negatif.<br>- Validasi alur persetujuan & penolakan QRIS.<br>- Validasi State Machine transisi antrean (mencegah mundur).<br>- Sinkronisasi status antrean ke status pesanan. | 5 Kasus Uji | **PASSED** (100%) |
| 3 | **`payment.test.ts`** | - Validasi nominal tagihan harus sama persis.<br>- Penolakan nominal pembayaran $\le 0$.<br>- Pembatasan metode pembayaran wajib `QRIS` pada MVP 1.<br>- Validasi transisi status pembayaran `PENDING` $\rightarrow$ `PAID` / `FAILED`.<br>- Penguncian status `PAID` agar tidak dibatalkan sembarangan. | 5 Kasus Uji | **PASSED** (100%) |
| 4 | **`menu.test.ts`** | - Validasi atribut menu (nama wajib, harga $> 0$).<br>- Pembatasan kategori menu.<br>- Proteksi referensial (soft-delete menu pernah dipesan).<br>- Logika penyaringan katalog (filter kategori, pencarian teks, stok).<br>- Manajemen kategori dinamis & proteksi kategori wajib Makanan/Minuman. | 6 Kasus Uji | **PASSED** (100%) |
| 5 | **`auth.test.ts`** | - Validasi struktur sintaks email pengguna.<br>- Syarat minimum kata sandi ($\ge 6$ karakter).<br>- Penentuan role default aman (`CUSTOMER`).<br>- Pengecekan hak akses khusus penjual (*Authorization Guard*). | 4 Kasus Uji | **PASSED** (100%) |
| 6 | **`security.test.ts`** | - Masking rekursif data sensitif (`password`, `token`, `secret`).<br>- Masking token pada header Authorization.<br>- Pemformatan log terstruktur ISO-8601 bebas kebocoran kredensial.<br>- Sanitasi input karakter khusus / pencegahan eksekusi skrip (XSS). | 4 Kasus Uji | **PASSED** (100%) |
| **TOTAL** | **6 File Unit Test** | **Seluruh Aturan Bisnis & Standar Keamanan Sistem Antrean Kantin** | **32 Kasus Uji** | **ALL PASSED (32/32)** |

---

## 5. Status Berkas Pengumpulan Tugas P8

| No | Berkas Deliverable P8 | Lokasi File | Status | Keterangan |
|:---:|---|---|:---:|---|
| 01 | **Hasil Uji Security & Catatan Perubahan** | [`SECURITY_TESTING_REPORT.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/SECURITY_TESTING_REPORT.md) | ✅ **LENGKAP** | Matriks pengujian OWASP, mitigasi SQLi, XSS, RBAC, dan changelog keamanan relevan. |
| 02 | **Panduan Instalasi Ulang Fresh Clone** | [`README.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/README.md) | ✅ **LENGKAP** | Langkah fresh clone, instalasi, build, deploy, panduan demo, dan akses halaman. |
| 03 | **Contoh Log Aman, Error & Perbaikan** | [`LOGGING_AND_TROUBLESHOOTING.md`](file:///c:/Users/VIVOBOOK/Downloads/RPL/LOGGING_AND_TROUBLESHOOTING.md) | ✅ **LENGKAP** | Standar logging aman, perbandingan unmasked vs masked, dan 5 skenario error nyata beserta solusinya. |
| 04 | **Fresh Clone Build & Unit Test Verification** | Monorepo (`backend` & `frontend`) | ✅ **LENGKAP** | Build bersih 0 error, unit test 100% lulus (6/6 files, 32/32 assertions passed). |
