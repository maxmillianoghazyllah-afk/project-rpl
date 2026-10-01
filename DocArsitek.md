

## 1. Deskripsi Aplikasi

Sistem Antrean Kantin adalah aplikasi web untuk membantu mahasiswa memesan makanan dan minuman dari kantin kampus. Mahasiswa dapat melihat menu, membuat pesanan, membayar menggunakan QRIS, dan melihat status pesanan serta nomor antrean. Penjual menggunakan aplikasi untuk mengelola menu dan memperbarui pesanan.

Pada versi pertama, pembayaran QRIS diperiksa dan dikonfirmasi secara manual oleh penjual. Aplikasi belum terhubung langsung dengan penyedia layanan pembayaran.

## 2. Tujuan

- Membantu mahasiswa memesan makanan tanpa harus mengantre untuk memesan.
- Membantu penjual mencatat dan mengatur pesanan dengan lebih rapi.
- Memberikan nomor antrean dan informasi status pesanan kepada mahasiswa.
- Mengurangi kesalahan pencatatan pesanan.

## 3. Target Pengguna

### Mahasiswa

- Melihat menu dan harga.
- Memilih makanan atau minuman dan membuat pesanan.
- Melihat QRIS kantin untuk membayar.
- Mengirim konfirmasi pembayaran.
- Melihat status pesanan dan nomor antrean.

### Penjual atau petugas kantin

- Masuk ke halaman pengelolaan kantin.
- Menambah, mengubah, dan menonaktifkan menu.
- Memeriksa konfirmasi pembayaran.
- Memperbarui status pesanan.

## 4. Teknologi yang Digunakan

- **Frontend:** React, TypeScript, Vite, dan Tailwind CSS.
- **Backend:** Node.js, TypeScript, dan Express.
- **Database:** MySQL.
- **ORM:** Prisma untuk menghubungkan kode backend dengan database.
- **Komunikasi aplikasi:** REST API dengan data berformat JSON.
- **Lingkungan pengembangan:** Docker Compose untuk menjalankan layanan aplikasi dan database secara lokal.

## 5. Gambaran Arsitektur

Frontend menampilkan halaman yang digunakan mahasiswa dan penjual. Frontend mengirim permintaan ke backend melalui REST API. Backend memeriksa permintaan, menjalankan aturan aplikasi, lalu membaca atau menyimpan data ke MySQL melalui Prisma.

MySQL menyimpan data pengguna, menu, pesanan, detail pesanan, pembayaran, dan antrean. Docker Compose membantu menjalankan layanan yang diperlukan untuk pengembangan. Untuk versi pertama, QRIS hanya ditampilkan sebagai informasi pembayaran. Konfirmasi pembayaran dilakukan oleh penjual di aplikasi.

## 6. Entitas dan Relasi Database

### User

Menyimpan akun pengguna.

- `id`: identitas pengguna.
- `name`: nama pengguna.
- `email`: alamat email yang digunakan untuk masuk.
- `passwordHash`: kata sandi yang telah diubah menjadi hash.
- `role`: peran pengguna, misalnya `CUSTOMER` atau `SELLER`.
- `createdAt`: waktu akun dibuat.
- `updatedAt`: waktu data terakhir diperbarui.

### Menu

Menyimpan makanan atau minuman yang dijual.

- `id`: identitas menu.
- `name`: nama makanan atau minuman.
- `description`: keterangan menu, boleh kosong.
- `price`: harga menu.
- `imageUrl`: alamat gambar, boleh kosong.
- `isAvailable`: penanda apakah menu tersedia.
- `createdAt`: waktu menu dibuat.
- `updatedAt`: waktu menu terakhir diperbarui.

### Order

Menyimpan informasi utama pesanan.

- `id`: identitas pesanan.
- `userId`: pengguna yang membuat pesanan.
- `orderNumber`: nomor pesanan yang dapat dilihat pengguna.
- `totalAmount`: jumlah harga seluruh item.
- `status`: status pesanan.
- `createdAt`: waktu pesanan dibuat.
- `updatedAt`: waktu pesanan terakhir diperbarui.

### OrderItem

Menyimpan menu dan jumlahnya dalam suatu pesanan. Harga disimpan sebagai salinan saat pesanan dibuat supaya perubahan harga menu tidak mengubah catatan pesanan lama.

- `id`: identitas detail pesanan.
- `orderId`: pesanan yang memiliki detail ini.
- `menuId`: menu yang dipesan.
- `quantity`: jumlah item.
- `priceAtOrder`: harga satuan saat pesanan dibuat.
- `subtotal`: harga satuan dikalikan jumlah.

### Payment

Menyimpan informasi pembayaran untuk pesanan.

- `id`: identitas pembayaran.
- `orderId`: pesanan yang dibayar.
- `method`: metode pembayaran, pada versi pertama menggunakan QRIS.
- `amount`: jumlah yang harus dibayar.
- `status`: status pembayaran.
- `proofUrl`: alamat bukti pembayaran, boleh kosong.
- `confirmedBy`: pengguna penjual yang mengonfirmasi, boleh kosong.
- `createdAt`: waktu pembayaran dibuat.
- `updatedAt`: waktu pembayaran diperbarui.

### Queue

Menyimpan nomor antrean untuk pesanan.

- `id`: identitas antrean.
- `orderId`: pesanan yang mendapat nomor antrean.
- `queueNumber`: nomor antrean.
- `status`: status antrean.
- `createdAt`: waktu nomor antrean dibuat.

### Relasi antarentitas

- Satu `User` dapat memiliki banyak `Order`. Setiap `Order` dibuat oleh satu `User`.
- Satu `Order` memiliki satu atau lebih `OrderItem`.
- Satu `Menu` dapat muncul di banyak `OrderItem`. Setiap `OrderItem` merujuk ke satu `Menu`.
- Satu `Order` memiliki satu catatan `Payment` untuk versi pertama.
- Satu `Order` memiliki satu nomor `Queue`.
- `Payment.confirmedBy` merujuk ke `User` penjual yang mengonfirmasi pembayaran. Nilainya kosong sebelum pembayaran diperiksa.

## 7. Alur Pemesanan

1. Mahasiswa membuka aplikasi dan melihat menu yang tersedia.
2. Mahasiswa memilih menu dan jumlah yang diinginkan.
3. Mahasiswa meninjau isi keranjang dan total harga.
4. Mahasiswa membuat pesanan.
5. Backend memeriksa ketersediaan menu dan menghitung ulang total harga.
6. Sistem menyimpan pesanan, detail item, dan catatan pembayaran dengan status menunggu pembayaran.
7. Sistem menampilkan QRIS kantin dan jumlah yang harus dibayar.
8. Mahasiswa membayar melalui aplikasi pembayaran yang dimilikinya.
9. Mahasiswa mengirim konfirmasi pembayaran dan, jika tersedia, bukti pembayaran.
10. Penjual memeriksa pembayaran secara manual. Penjual dapat menyetujui atau menolak konfirmasi.
11. Jika pembayaran disetujui, status pembayaran menjadi berhasil. Sistem memberikan nomor antrean dan pesanan masuk ke proses persiapan.
12. Penjual memperbarui status pesanan hingga siap diambil dan selesai.
13. Mahasiswa melihat perubahan status di halaman pesanan.

## 8. Implementasi QRIS Manual

- QRIS kantin disiapkan sebagai gambar atau informasi yang dikelola untuk ditampilkan di halaman pembayaran.
- Aplikasi menampilkan QRIS dan jumlah pembayaran kepada mahasiswa.
- Mahasiswa melakukan pembayaran melalui aplikasi pembayaran di luar sistem.
- Mahasiswa menekan tombol konfirmasi dan dapat mengunggah bukti pembayaran jika fitur unggah disediakan.
- Penjual mencocokkan pembayaran dengan catatan transaksi secara manual.
- Penjual menyetujui atau menolak konfirmasi di halaman pengelolaan pesanan.
- Aplikasi tidak memeriksa transaksi langsung ke bank atau penyedia QRIS.
- Nomor antrean dibuat setelah penjual menyetujui pembayaran.

## 9. Status Pembayaran dan Pesanan

### Status pembayaran

- `PENDING`: menunggu pembayaran atau pemeriksaan penjual.
- `PAID`: pembayaran sudah diperiksa dan disetujui penjual.
- `REJECTED`: konfirmasi pembayaran ditolak penjual.
- `CANCELLED`: pembayaran atau pesanan dibatalkan.

### Status pesanan

- `WAITING_PAYMENT`: pesanan dibuat dan menunggu pembayaran.
- `CONFIRMED`: pembayaran telah disetujui dan pesanan diterima.
- `PREPARING`: pesanan sedang disiapkan.
- `READY`: pesanan siap diambil.
- `COMPLETED`: pesanan telah diambil atau diselesaikan.
- `CANCELLED`: pesanan dibatalkan.

Status antrean dapat menggunakan `WAITING`, `IN_PROGRESS`, `READY`, dan `COMPLETED` agar penjual dapat mengatur antrean kerja.

## 10. Fitur Backend

- Mengelola akun dan peran pengguna.
- Menyediakan data menu dan mengelola perubahan menu oleh penjual.
- Membuat pesanan dan memeriksa ketersediaan menu.
- Menghitung total harga di backend.
- Menyimpan item pesanan beserta harga saat pesanan dibuat.
- Menyimpan dan memperbarui status pembayaran.
- Menyediakan tindakan penjual untuk menyetujui atau menolak pembayaran.
- Membuat nomor antrean setelah pembayaran disetujui.
- Memperbarui status pesanan dan antrean.
- Memvalidasi masukan dan mengirim respons REST API dalam format JSON.

## 11. Fitur Frontend

### Halaman mahasiswa

- Halaman daftar menu.
- Keranjang dan formulir checkout.
- Halaman instruksi pembayaran QRIS.
- Formulir konfirmasi pembayaran.
- Halaman daftar pesanan dan detail status pesanan.
- Tampilan nomor antrean setelah pembayaran disetujui.

### Halaman penjual

- Halaman masuk.
- Halaman daftar pesanan dan konfirmasi pembayaran.
- Halaman untuk memperbarui status pesanan.
- Halaman untuk menambah, mengubah, atau menonaktifkan menu.

## 12. API Endpoint

Endpoint berikut adalah rancangan awal. Semua data dikirim dan diterima sebagai JSON, kecuali pengiriman bukti pembayaran jika fitur unggah digunakan.

### Akun

- `POST /api/auth/register`: membuat akun.
- `POST /api/auth/login`: masuk ke aplikasi.
- `GET /api/auth/me`: melihat akun yang sedang masuk.

### Menu

- `GET /api/menus`: melihat menu yang tersedia.
- `GET /api/menus/:id`: melihat detail menu.
- `POST /api/menus`: menambah menu; khusus penjual.
- `PATCH /api/menus/:id`: mengubah data atau ketersediaan menu; khusus penjual.
- `DELETE /api/menus/:id`: menghapus menu jika belum dipakai dalam catatan pesanan; khusus penjual. Jika sudah dipakai, menu sebaiknya dinonaktifkan.

### Pesanan

- `POST /api/orders`: membuat pesanan.
- `GET /api/orders`: melihat pesanan milik pengguna yang sedang masuk. Penjual dapat melihat daftar pesanan kantin.
- `GET /api/orders/:id`: melihat detail pesanan.
- `PATCH /api/orders/:id/status`: memperbarui status pesanan; khusus penjual.

### Pembayaran

- `POST /api/orders/:id/payment/confirmation`: mengirim konfirmasi pembayaran oleh mahasiswa.
- `PATCH /api/orders/:id/payment/decision`: menyetujui atau menolak pembayaran; khusus penjual.

### Antrean

- `GET /api/queue`: melihat nomor dan status antrean yang relevan.
- `PATCH /api/queue/:id/status`: memperbarui status antrean; khusus penjual.

## 13. Struktur Folder

- `frontend/src/components/` berisi bagian tampilan yang dapat digunakan kembali.
- `frontend/src/pages/` berisi halaman aplikasi.
- `frontend/src/services/` berisi fungsi frontend untuk memanggil API.
- `frontend/src/types/` berisi tipe data TypeScript untuk frontend.
- `frontend/src/App.tsx` mengatur tampilan utama dan rute halaman.
- `frontend/src/main.tsx` menjadi titik awal frontend.
- `backend/prisma/schema.prisma` berisi rancangan tabel dan relasi database.
- `backend/src/routes/` menentukan alamat API.
- `backend/src/controllers/` menangani permintaan yang masuk.
- `backend/src/services/` berisi aturan dan proses utama aplikasi.
- `backend/src/middleware/` berisi pemeriksaan umum seperti autentikasi.
- `backend/src/app.ts` menyiapkan aplikasi Express.
- `backend/src/server.ts` menjalankan server backend.
- `docker-compose.yml` mengatur layanan untuk pengembangan lokal.
- `README.md` berisi petunjuk menjalankan proyek.

## 14. Fitur yang Tidak Dikerjakan

- Pembayaran QRIS otomatis melalui integrasi bank atau payment gateway.
- Pengembalian dana otomatis.
- Pengantaran makanan ke lokasi mahasiswa.
- Aplikasi khusus Android atau iOS.
- Sistem poin, kupon, promosi, atau langganan.
- Banyak cabang kantin dengan pengaturan terpisah.
- Notifikasi SMS atau WhatsApp.
- Laporan keuangan tingkat lanjut.

## 15. Kriteria Berhasil

- Mahasiswa dapat melihat menu dan harga yang masih tersedia.
- Mahasiswa dapat membuat pesanan dengan lebih dari satu item.
- Total harga dihitung dengan benar oleh backend.
- Pesanan dan detail item tersimpan di database.
- Mahasiswa dapat melihat QRIS dan mengirim konfirmasi pembayaran.
- Penjual dapat memeriksa, menyetujui, atau menolak konfirmasi pembayaran.
- Nomor antrean hanya diberikan setelah pembayaran disetujui.
- Penjual dapat memperbarui status pesanan.
- Mahasiswa dapat melihat status terbaru pesanan.
- Data utama tetap tersimpan dengan benar saat aplikasi dijalankan kembali.

## 16. Batasan Versi Pertama

- Aplikasi dibuat sebagai proyek web sederhana untuk satu kantin.
- Pemeriksaan pembayaran dilakukan manual oleh penjual.
- QRIS yang digunakan adalah QRIS kantin yang sudah disiapkan, bukan QRIS unik yang dibuat otomatis untuk setiap pesanan.
- Sistem tidak dapat memastikan pembayaran berhasil secara langsung.
- Pengguna perlu membuka halaman pesanan untuk melihat perubahan status; pembaruan langsung tanpa memuat ulang bukan kebutuhan versi pertama.
- Fitur difokuskan pada pemesanan, konfirmasi pembayaran, antrean, dan pengelolaan menu dasar.
- Keamanan dan pengelolaan akun dibuat sesuai kebutuhan aplikasi tugas kuliah dan dapat ditingkatkan pada versi berikutnya.
