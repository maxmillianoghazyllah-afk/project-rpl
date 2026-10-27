# Laporan Tugas Pertemuan 5: Pengembangan MVP Version 1 Secara Iteratif dengan AI Agent

**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Topik:** Pengembangan Iteratif MVP Version 1 (Brief → Plan → Build → Verify → Commit)  
**Aplikasi:** Sistem Antrean Kantin  
**Repositori:** `kantin-queue`  

---

## 1. Ringkasan Eksekutif MVP Version 1

Sistem Antrean Kantin adalah aplikasi web fullstack berbasis **React + TypeScript + Vite + Tailwind CSS** di sisi frontend dan **Node.js + Express + TypeScript + Prisma ORM + MySQL** di sisi backend. 

Sesuai instruksi Tugas Pertemuan 5, pengembangan tidak dilakukan sekaligus secara monolitik, melainkan secara **iteratif fitur demi fitur** dengan memilih **2 Fitur Inti** dari MVP:
1. **Fitur Inti 1:** Katalog Menu & Pemesanan Makanan (Menu Catalog & Order Creation with Safe Backend Price Calculation)
2. **Fitur Inti 2:** Pembayaran QRIS Manual & Manajemen Nomor Antrean (Manual QRIS Confirmation & Sequential Queue Lifecycle)

---

## 2. Proses Rekayasa Iteratif: Fitur Inti 1

### A. Brief
Mahasiswa membutuhkan cara untuk melihat menu makanan/minuman yang aktif beserta harganya dan memilih beberapa item untuk dipesan tanpa harus mengantre fisik di depan stan kantin. Sistem harus memastikan stok menu tersedia, menghitung subtotal dan total harga secara aman di server (mencegah manipulasi harga dari client), serta mencatat transaksi pesanan awal berstatus `WAITING_PAYMENT`.

### B. Plan
- **Service Layer:** Membuat modul `backend/src/services/order.service.ts` yang menampung fungsi murni:
  - `calculateItemSubtotal(price, quantity)`: Kalkulasi subtotal dan validasi kuantitas $\le 0$.
  - `calculateOrderTotal(items)`: Penjumlahan total pesanan.
  - `processOrderItems(rawItems)`: Validasi ketersediaan menu (`isAvailable`) dan perhitungan menyeluruh.
  - `generateOrderNumber()`: Pembuatan format nomor pesanan unik `ORD-YYYYMMDD-XXXX`.
- **Controller & Routes:** Menghubungkan service ke `order.controller.ts` dan rute `POST /api/orders` serta `GET /api/menus`.
- **Frontend UI:** Komponen katalog `MenuPage.tsx`, state `CartContext.tsx`, dan halaman checkout `CartPage.tsx`.
- **Unit Test:** Membuat file pengujian mandiri `backend/tests/order.test.ts` untuk menguji kalkulasi dan penanganan error/edge cases.

### C. Build
- Mengimplementasikan `order.service.ts` dengan interface `MenuItemInput` dan `CalculatedOrderItem`.
- Menyesuaikan `order.controller.ts` untuk mengambil harga resmi dari database MySQL lalu memprosesnya melalui `order.service.ts`.
- Membangun UI katalog dengan indikator ketersediaan (badge Habis/Tersedia) dan keranjang interaktif.
- Menulis unit test lengkap pada `backend/tests/order.test.ts`.

### D. Verify
Menjalankan pengujian unit test dan verifikasi API:
```bash
npm --prefix backend run test
```
**Hasil Verifikasi:**
- `calculateItemSubtotal` menghitung subtotal akurat (misal: 2 porsi @ 15.000 = 30.000).
- `calculateItemSubtotal` sukses melempar error ketika menerima kuantitas $\le 0$ atau harga negatif.
- `processOrderItems` sukses menolak pesanan jika salah satu menu sedang habis (`isAvailable: false`).
- Nomor pesanan terbukti sesuai format `ORD-YYYYMMDD-XXXX`.

### E. Commit
```bash
git commit -m "feat(order): implementasi katalog menu, kalkulasi harga backend, dan unit test pemesanan"
```

---

## 3. Proses Rekayasa Iteratif: Fitur Inti 2

### A. Brief
Setelah pesanan dibuat, mahasiswa harus membayar melalui QRIS kantin dan mengirim konfirmasi *"Saya Sudah Bayar"*. Penjual memeriksa penerimaan uang dan menyetujui transaksi. Begitu disetujui, sistem wajib menerbitkan nomor antrean otomatis secara sekuensial (misal: `A-001`, `A-002`) dan mengelola transisi status antrean dapur: Menunggu (`WAITING`) $\rightarrow$ Dimasak (`IN_PROGRESS`) $\rightarrow$ Siap Diambil (`READY`) $\rightarrow$ Selesai (`COMPLETED`).

### B. Plan
- **Service Layer:** Membuat modul `backend/src/services/queue.service.ts`:
  - `formatQueueNumber(sequence, prefix)`: Memformat angka ke padding 3 digit (contoh: 1 $\rightarrow$ `A-001`).
  - `isValidPaymentTransition(current, target)`: Memastikan pembayaran yang sudah `PAID` tidak dapat ditolak, dan sebaliknya.
  - `isValidQueueTransition(current, target)`: Mencegah perubahan status antrean mundur ilegal (contoh: `COMPLETED` tidak boleh kembali ke `WAITING`).
  - `mapQueueStatusToOrderStatus(queueStatus)`: Sinkronisasi status antrean dengan status pesanan pelanggan.
- **Controller & Routes:** Menghubungkan service ke `payment.controller.ts` (`PATCH /api/orders/:id/payment/decision`) dan `queue.controller.ts` (`GET /api/queue`, `PATCH /api/queue/:id/status`).
- **Frontend UI:** Komponen tampilan `QRISCard.tsx`, halaman `PaymentInstructionPage.tsx`, pemantau antrean `QueueStatusPage.tsx`, serta display monitor antrean `SellerQueueDisplayPage.tsx`.
- **Unit Test:** Menulis file pengujian `backend/tests/queue.test.ts`.

### C. Build
- Mengimplementasikan `queue.service.ts` dan mengintegrasikannya ke controller Express.
- Membangun UI QRIS dinamis dengan instruksi transfer dompet digital/mobile banking.
- Membangun UI monitor antrean real-time dengan live polling setiap 4 detik.
- Menggabungkan seluruh pengujian ke dalam `backend/tests/run-all-tests.ts`.

### D. Verify
Menjalankan suite pengujian unit test dan simulasi siklus hidup pesanan:
```bash
npm --prefix backend test
```
**Hasil Verifikasi:**
- Penomoran antrean `A-001`, `A-002`, `A-025` terformat presisi dengan validasi bilangan bulat positif.
- Aturan transisi status pembayaran menolak perubahan ilegal pada pesanan yang sudah berstatus `PAID`.
- Aturan antrean dapur mencegah transisi mundur dari status `COMPLETED` atau `READY`.
- Pengujian end-to-end memastikan nomor antrean `A-001` terbit seketika saat penjual menekan *Approve*.

### E. Commit
```bash
git commit -m "feat(queue): implementasi alur konfirmasi QRIS, penomoran antrean otomatis, dan unit test antrean"
```

---

## 4. Penjelasan Mahasiswa (Refleksi Review & Engineering)

Sesuai kriteria evaluasi dosen/asisten lab, berikut adalah penjelasan rinci atas 4 pertanyaan wajib:

### 1. Apa yang dikerjakan oleh AI Agent?
AI Agent membantu:
- Menyusun arsitektur monorepo frontend (React + Tailwind) dan backend (Express + Prisma + MySQL).
- Mengeneralisasi skema database awal pada `schema.prisma` dan menyusun seeder data menu.
- Membuat draft awal controller Express dan komponen UI React.
- Mengonfigurasi lingkungan Windows (pemanggilan `npm.cmd`, daemon MySQL XAMPP).

### 2. Apa yang direview dan diubah oleh mahasiswa?
Setelah memeriksa kode hasil generasi awal AI Agent, mahasiswa menemukan beberapa kelemahan arsitektural dan melakukan perubahan penting:
1. **Pemisahan Controller Monolitik ke Service Layer:** Awalnya, AI Agent menaruh kalkulasi harga dan penomoran antrean langsung di dalam controller HTTP Express. Mahasiswa mereview bahwa hal ini membuat logika bisnis tidak bisa di-unit test tanpa database aktif. Mahasiswa meminta/mengekstrak logika tersebut ke `order.service.ts` dan `queue.service.ts`.
2. **Pencegahan Manipulasi Harga (Security Fix):** Mahasiswa memastikan bahwa harga menu (`priceAtOrder`) tidak diambil dari payload request body yang dikirim frontend, melainkan diambil langsung dari database MySQL oleh backend sebelum dikalkulasi.
3. **Penyempurnaan Boundary Validation (Edge Cases):** Mahasiswa menambahkan pengecekan bahwa kuantitas pesanan harus berupa bilangan bulat positif $> 0$, harga tidak boleh negatif, dan nomor antrean harus bernilai positif.
4. **Pencegahan Transisi Status Ilegal (State Machine):** Mahasiswa menambahkan aturan bahwa pesanan yang sudah berstatus `COMPLETED` tidak boleh dimundurkan kembali ke status `WAITING` atau `IN_PROGRESS`.
5. **Normalisasi Type Casting:** Menambahkan helper casting `parseInt(String(req.params.id), 10)` untuk mengatasi inkonsistensi tipe data Express v5 `@types/express`.

### 3. Bagaimana fitur diverifikasi?
Fitur diverifikasi melalui 3 lapisan pengujian:
1. **Automated Unit Testing (`npm test`):**
   - File `backend/tests/order.test.ts` (7 assertions lulus 100%).
   - File `backend/tests/queue.test.ts` (5 assertions lulus 100%).
   - File `backend/tests/run-all-tests.ts` sebagai agregator suite pengujian.
2. **Automated End-to-End API Test:**
   - Menjalankan simulasi request HTTP nyata dari `POST /api/orders` $\rightarrow$ `POST /api/orders/:id/payment/confirmation` $\rightarrow$ `PATCH /api/orders/:id/payment/decision` $\rightarrow$ `GET /api/queue` $\rightarrow$ `PATCH /api/orders/:id/status`. Seluruh alur menghasilkan respons status 200/201 dan data tersimpan ke MySQL.
3. **Manual Browser & UI Verification:**
   - Membuka `http://localhost:5173` di browser.
   - Menguji mode Mahasiswa (tambah menu ke keranjang, checkout, periksa tampilan kartu QRIS, kirim konfirmasi).
   - Menguji mode Penjual (klik tombol approve pembayaran, cek terbitnya nomor antrean `A-001`, update status memasak, dan melihat papan display antrean live).

### 4. Mengapa perubahan tersebut diperlukan?
- **Separation of Concerns & Testability:** Memisahkan logika bisnis dari protokol transport HTTP membuat kode mudah diuji (*testable*), mudah dirawat (*maintainable*), dan tidak rapuh saat framework di-upgrade.
- **Integritas Transaksi Finansial:** Kalkulasi harga di sisi server melindungi kantin dari manipulasi harga oleh pengguna nakal yang mengubah nilai nominal di browser.
- **Kenyamanan Operasional Kantin:** Validasi alur antrean menjamin bahwa nomor urut antrean tidak lompat dan juru masak kantin tidak mengalami kebingungan urutan pesanan.

---

## 5. Bukti Eksekusi Unit Test (Terminal Output)

```
> kantin-queue-backend@1.0.0 test
> ts-node tests/run-all-tests.ts

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

==================================================
✅ SELURUH UNIT TEST FITUR INTI MVP 1 BERHASIL LULUS 100%
==================================================
```

---

## 6. Skenario Demo Singkat (Untuk Penilaian)

1. **Jalankan Aplikasi:**
   - Terminal 1: `cd backend && npm run dev` (API berjalan di `http://localhost:5000`)
   - Terminal 2: `cd frontend && npm run dev` (Web berjalan di `http://localhost:5173`)
2. **Demo Fitur 1 (Pemesanan):**
   - Buka `http://localhost:5173` dalam mode Mahasiswa.
   - Tambah *Nasi Goreng Spesial* (Rp 15.000) dan *Es Teh Manis Jumbo* (Rp 4.000) ke keranjang.
   - Buka halaman Keranjang, periksa total pesanan dihitung otomatis (Rp 19.000), lalu tekan **Lanjut Bayar QRIS**.
3. **Demo Fitur 2 (Pembayaran QRIS & Antrean):**
   - Di halaman pembayaran, periksa kode QRIS resmi kantin dan klik **Saya Sudah Bayar (Konfirmasi)**.
   - Klik toggle **Penjual** di sudut kanan atas navbar.
   - Di tab **Pesanan Masuk**, lihat pesanan baru lalu klik **Setujui Pembayaran**.
   - Perhatikan nomor antrean `A-001` langsung terbit otomatis.
   - Buka tab **Layar Display Monitor** di tab penjual dan periksa nomor `A-001` berpindah dari *Sedang Disiapkan* ke *Siap Diambil*.
