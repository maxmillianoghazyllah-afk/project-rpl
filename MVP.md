# Dokumen MVP Version 1: Sistem Antrean Kantin (KantinQueue)

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Aplikasi:** Sistem Antrean Kantin Kampus  
**Teknologi:** React, TypeScript, Vite, Tailwind CSS, Node.js, Express, Prisma ORM, MySQL.  

---

## 1. Identitas & Definisi MVP

**Nama MVP:** Sistem Antrean Kantin (KantinQueue)  
**Tujuan MVP:**  
Mengeliminasi antrean fisik berdesakan mahasiswa saat memesan makanan di kantin kampus melalui alur digital: melihat menu, memesan makanan dengan perhitungan harga server-side, melakukan pembayaran QRIS manual, mendapatkan nomor antrean sekuensial otomatis, dan memantau status pesanan hingga siap diambil.

---

## 2. Implementasi 5 User Story & Acceptance Criteria

### User Story 1: Menjelajahi Menu & Kategori Kantin (Mahasiswa)
> **Sebagai** Mahasiswa,  
> **Saya ingin** melihat katalog menu makanan dan minuman yang tersedia, memfilter berdasarkan kategori ("Semua", "Makanan", "Minuman"), dan melihat ketersediaan stok,  
> **Agar** saya dapat memilih makanan favorit tanpa harus bertanya langsung ke penjual di kasir.

**Acceptance Criteria:**
- [x] Sistem menampilkan card menu lengkap dengan nama, deskripsi, foto, dan harga dalam format Rupiah.
- [x] Menu yang berstatus `isAvailable: false` ditandai dengan badge "Habis" dan tombol tambah dinonaktifkan.
- [x] Filter kategori ("Semua", "Makanan", "Minuman") menyaring item menu secara akurat.
- [x] Fitur pencarian menyaring item menu berdasarkan nama dan deskripsi secara real-time.

---

### User Story 2: Pemesanan Makanan & Kalkulasi Harga Server-Side (Mahasiswa)
> **Sebagai** Mahasiswa,  
> **Saya ingin** memilih beberapa menu dan memesan makanan dari keranjang dengan perhitungan total harga yang dilakukan di server,  
> **Agar** rincian pesanan saya akurat, aman dari manipulasi harga, dan tercatat di database kantin.

**Acceptance Criteria:**
- [x] Kuantitas setiap item pesanan divalidasi harus berupa bilangan bulat positif $> 0$.
- [x] Harga pesanan (`priceAtOrder`) wajib diambil dari database resmi kantin, bukan mempercayai harga dari client browser.
- [x] Jika ada menu pesanan yang sedang habis (`isAvailable: false`), sistem menolak transaksi dengan pesan error jelas.
- [x] Transaksi pesanan tersimpan di tabel `Order` dengan nomor unik format `ORD-YYYYMMDD-XXXX` dan status awal `WAITING_PAYMENT`.

---

### User Story 3: Instruksi & Konfirmasi Pembayaran QRIS Manual (Mahasiswa)
> **Sebagai** Mahasiswa,  
> **Saya ingin** melihat instruksi dan kartu QRIS resmi kantin sesuai total tagihan, lalu menekan tombol konfirmasi "Saya Sudah Bayar",  
> **Agar** penjual kantin dapat memverifikasi pembayaran saya sebelum makanan mulai diproses.

**Acceptance Criteria:**
- [x] Halaman pembayaran menampilkan kode QRIS resmi merchant "KANTIN BERKAH KAMPUS" dan total tagihan tepat.
- [x] Mahasiswa dapat mengisi catatan atau link bukti transfer opsional.
- [x] Tombol "Saya Sudah Bayar (Konfirmasi)" mengubah catatan pembayaran menjadi `PENDING` (menunggu konfirmasi penjual).
- [x] Mahasiswa diarahkan ke halaman pemantauan antrean setelah konfirmasi berhasil dikirim.

---

### User Story 4: Verifikasi Pembayaran & Penomoran Antrean Otomatis (Penjual)
> **Sebagai** Penjual Kantin,  
> **Saya ingin** melihat pesanan masuk yang menunggu verifikasi, mencocokkan pembayaran, dan menyetujui (`APPROVE`) atau menolak (`REJECT`),  
> **Agar** pesanan yang valid otomatis mendapatkan nomor antrean urut dan pesanan palsu/tidak bayar dapat dibatalkan.

**Acceptance Criteria:**
- [x] Penjual dapat melihat pesanan masuk berstatus `WAITING_PAYMENT` beserta detail menu dan nominal bayar.
- [x] Menekan tombol `APPROVE` mengubah status pembayaran menjadi `PAID`, pesanan menjadi `CONFIRMED`, dan otomatis menerbitkan nomor antrean berurutan (contoh: `A-001`, `A-002`).
- [x] Menekan tombol `REJECT` mengubah status pembayaran menjadi `REJECTED` dan status pesanan menjadi `CANCELLED`.
- [x] Pembayaran yang telah berstatus `PAID` terkunci secara finansial dan tidak dapat diubah menjadi `REJECTED`.

---

### User Story 5: Manajemen Alur Memasak & Layar Display Antrean (Penjual & Mahasiswa)
> **Sebagai** Penjual dan Mahasiswa,  
> **Saya ingin** status pengerjaan pesanan diperbarui secara bertahap (`PREPARING` $\rightarrow$ `READY` $\rightarrow$ `COMPLETED`) dan ditampilkan di layar monitor kantin,  
> **Agar** alur memasak tertib dan mahasiswa segera mengambil makanan di meja konter begitu nomornya dipanggil.

**Acceptance Criteria:**
- [x] Penjual dapat memajukan alur kerja: "Mulai Masak" (`PREPARING`) $\rightarrow$ "Tandai Siap Diambil" (`READY`) $\rightarrow$ "Selesai Diambil" (`COMPLETED`).
- [x] Sistem memvalidasi state machine sehingga status antrean tidak dapat dimundurkan secara ilegal (misal `COMPLETED` tidak boleh kembali ke `WAITING`).
- [x] Layar display monitor (`SellerQueueDisplayPage`) menampilkan nomor antrean "Sedang Disiapkan" vs "Siap Diambil di Konter" dengan auto-refresh berkala.
- [x] Halaman Pantau Antrean Mahasiswa menampilkan progres tahapan alur memasak dan nomor antrean yang aktif dipanggil.

---

## 3. Daftar 5 File Unit Test Aturan Bisnis

Unit test terletak pada direktori [`backend/tests/`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests) dan menguji logika bisnis secara mandiri (*pure business rules*):

| No | File Unit Test | Aturan Bisnis yang Diuji | Status |
|:--:|---|---|:---:|
| 1 | [`order.test.ts`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests/order.test.ts) | Kalkulasi subtotal, total order, penolakan kuantitas $\le 0$, penolakan harga negatif, penolakan menu habis, format regex `ORD-YYYYMMDD-XXXX`. | **ALL PASSED** |
| 2 | [`queue.test.ts`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests/queue.test.ts) | Format nomor antrean 3-digit `A-001`, penolakan nomor urut $\le 0$ atau desimal, validasi alur transisi maju, pencegahan transisi status mundur ilegal, pemetaan status antrean ke status pesanan. | **ALL PASSED** |
| 3 | [`payment.test.ts`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests/payment.test.ts) | Validasi nominal pembayaran cocok dengan total tagihan, pembatasan metode bayar hanya QRIS, transisi status bayar, proteksi status `PAID` agar tidak dapat diubah menjadi `REJECTED`. | **ALL PASSED** |
| 4 | [`menu.test.ts`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests/menu.test.ts) | Validasi nama menu & harga positif, validasi kategori resmi (Makanan/Minuman/Camilan), strategi deaktivasi alih-alih hard delete jika sudah ada riwayat transaksi, penyaringan daftar menu. | **ALL PASSED** |
| 5 | [`auth.test.ts`](file:///c:/Users/VIVOBOOK/Downloads/RPL/backend/tests/auth.test.ts) | Validasi pola format email pengguna, validasi kekuatan password minimal 6 karakter, penentuan role aman (default `CUSTOMER`), otorisasi hak akses khusus `SELLER`. | **ALL PASSED** |

---

## 4. Cara Menjalankan & Memverifikasi

### Menjalankan Seluruh Unit Test:
```bash
cd backend
npm test
```
*Output: 26 assertions teruji, 5 unit test files sukses, All Passed (100%).*

### Menjalankan Aplikasi (Runnable):
- **Backend API:** `cd backend && npm run dev` $\rightarrow$ Aktif di [http://localhost:5000](http://localhost:5000)
- **Frontend UI:** `cd frontend && npm run dev` $\rightarrow$ Aktif di [http://localhost:5173](http://localhost:5173)
