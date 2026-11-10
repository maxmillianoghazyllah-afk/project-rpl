# Panduan Deployment: VPS & Single Board Computer (Raspberry Pi / Orange Pi)

**Aplikasi:** Sistem Antrean Kantin (KantinQueue)  
**Mata Kuliah:** Rekayasa Perangkat Lunak (RPL)  
**Format URL Akses Live:** `https://<IP_ADDRESS>/kantin`  
**Standar Keamanan:** HTTPS (Port 443), SSL/TLS, Nginx Reverse Proxy, Docker Multi-Architecture (AMD64 & ARM64)  

---

## 1. Ringkasan Eksekutif Deployment

Aplikasi **KantinQueue** dirancang portabel dan fleksibel untuk dijalankan pada 2 skenario infrastruktur produksi:
1. **VPS Cloud (Ubuntu / Debian / CentOS / AlmaLinux)**: Berbasis arsitektur **x86_64 / AMD64** untuk jangkauan online publik melalui IP publik atau domain.
2. **Single Board Computer (Raspberry Pi 4/5 atau Orange Pi 3/5)**: Berbasis arsitektur **aarch64 / ARM64** yang dipasang langsung di area kantin kampus, hemat daya (5V), dan kabel HDMI-nya langsung terhubung ke **Layar Monitor TV Kantin** untuk panggilan antrean otomatis.

Reviewer dapat mengakses aplikasi secara live melalui tautan:
- **Web App (Mahasiswa & Penjual):** `https://<ip>/kantin`
- **Layar Display TV (3 Kolom Antrean):** `https://<ip>/kantin/seller/display`
- **Dashboard Pengelola Penjual:** `https://<ip>/kantin/seller`

---

## 2. Pilihan Tautan Percobaan (*Live Test Links*)

Untuk demonstrasi kepada reviewer, terdapat 3 opsi tautan online yang dapat digunakan:

### Opsi A: Menggunakan IP Publik VPS / Server Kampus
- **URL Utama:** `https://<IP_VPS>/kantin` (contoh: `https://103.175.218.45/kantin`)
- **Port:** `443` (HTTPS otomatis dengan sertifikat SSL)

### Opsi B: Menggunakan Raspberry Pi / Orange Pi di Jaringan Lokal Kampus
- **URL IP Lokal:** `https://192.168.1.50/kantin`
- **URL mDNS Lokal:** `https://kantin.local/kantin`
- **Auto-Kiosk Monitor TV:** Langsung tayang fullscreen pada monitor TV yang dicolokkan ke HDMI board.

### Opsi C: Tautan Online Instan via Cloudflare Tunnel (Tanpa Perlu Beli VPS)
Jika Anda mendemokan aplikasi dari laptop atau Raspberry Pi tanpa IP publik tetap, Anda dapat membuka akses publik HTTPS gratis dalam 30 detik:
```bash
# 1. Download & jalankan cloudflared (gratis dari Cloudflare)
# Windows:
winget install Cloudflare.cloudflared
cloudflared tunnel --url https://localhost:443 --no-tls-verify

# Linux / Raspberry Pi / Orange Pi:
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared.deb
cloudflared tunnel --url https://localhost:443 --no-tls-verify
```
*Cloudflare akan memberikan tautan publik HTTPS gratis, contoh:*  
`https://kantin-queue-demo.trycloudflare.com/kantin`

---

## 3. Langkah Deployment di VPS (Ubuntu 22.04 / 24.04 LTS)

### Langkah 1: Persiapan Server VPS
Hubungkan ke VPS via SSH:
```bash
ssh root@<IP_VPS>
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw
```

### Langkah 2: Konfigurasi Firewall UFW
Buka port HTTP (80), HTTPS (443), dan SSH (22):
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Langkah 3: Install Docker & Docker Compose
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Langkah 4: Clone Repositori Proyek
```bash
git clone https://github.com/AkunAnda/KantinQueue.git /var/www/kantin
cd /var/www/kantin
```

### Langkah 5: Generate Sertifikat SSL Mandiri (Self-Signed)
Jalankan skrip generator SSL yang telah disediakan di folder `nginx/`:
```bash
chmod +x nginx/generate-ssl.sh
./nginx/generate-ssl.sh
```
*Sertifikat otomatis tersimpan di `nginx/ssl/kantin.crt` dan `nginx/ssl/kantin.key`.*

### Langkah 6: Jalankan Seluruh Container Aplikasi
```bash
docker compose up -d --build
```

Periksa status container:
```bash
docker compose ps
```
**Output yang Diharapkan:**
```text
NAME              IMAGE              COMMAND                  SERVICE      STATUS      PORTS
kantin_mysql      mysql:8.0          "docker-entrypoint.s…"   mysql        running     0.0.0.0:3306->3306/tcp
kantin_backend    kantin_backend     "docker-entrypoint.s…"   backend      running     5000/tcp
kantin_frontend   kantin_frontend    "/docker-entrypoint.…"   frontend     running     80/tcp
kantin_nginx      nginx:alpine       "/docker-entrypoint.…"   nginx        running     0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

Reviewer sekarang dapat langsung membuka browser ke: **`https://<IP_VPS>/kantin`**

---

## 4. Langkah Deployment di Raspberry Pi / Orange Pi

Single Board Computer (SBC) seperti Raspberry Pi atau Orange Pi adalah perangkat komputasi fisik ideal untuk kantin karena berukuran saku, hemat daya (5-10 Watt), dan dapat dinyalakan terus-menerus 24/7 di stan kantin.

### Langkah 1: Persiapan Sistem Operasi
- Gunakan **Raspberry Pi OS 64-bit** (Debian Bookworm) atau **Armbian (Ubuntu 22.04 LTS ARM64)** untuk Orange Pi.
- Pastikan koneksi Wi-Fi atau kabel LAN kantin terhubung.

### Langkah 2: Pasang Dependensi
```bash
sudo apt update && sudo apt install -y git nodejs npm nginx unclutter chromium-browser
```

### Langkah 3: Clone & Build Aplikasi
```bash
git clone https://github.com/AkunAnda/KantinQueue.git /var/www/kantin
cd /var/www/kantin
npm run install:all
npm run build
```

### Langkah 4: Konfigurasi Nginx Native dengan SSL
Salin file konfigurasi Nginx yang telah disiapkan:
```bash
sudo cp deployment/systemd/nginx-kantin.conf /etc/nginx/sites-available/kantin
sudo ln -s /etc/nginx/sites-available/kantin /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Buat SSL certificate
sudo mkdir -p /etc/nginx/ssl
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/kantin.key \
  -out /etc/nginx/ssl/kantin.crt \
  -subj "/C=ID/ST=Jawa Barat/L=Bandung/O=KantinQueue/OU=IT/CN=kantin.local"

sudo nginx -t && sudo systemctl reload nginx
```

### Langkah 5: Pasang Service Backend API (Auto-Restart via Systemd)
```bash
sudo cp deployment/systemd/kantin-backend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now kantin-backend
sudo systemctl status kantin-backend
```

### Langkah 6: Auto-Kiosk Mode pada Monitor TV Kantin (HDMI Boot)
Agar Raspberry Pi / Orange Pi otomatis membuka Layar Display TV saat dinyalakan tanpa perlu keyboard/mouse:
```bash
chmod +x deployment/rpi/kiosk-display.sh
```
Tambahkan ke autostart desktop:
```bash
mkdir -p ~/.config/autostart
cat << 'EOF' > ~/.config/autostart/kiosk.desktop
[Desktop Entry]
Type=Application
Name=Kantin TV Kiosk
Exec=/var/www/kantin/deployment/rpi/kiosk-display.sh
X-GNOME-Autostart-enabled=true
EOF
```
*Hasil: Saat Raspberry Pi/Orange Pi dinyalakan, TV kantin otomatis menampilkan **Layar Display Antrean 3 Kolom Fullscreen** tanpa kursor mouse.*

---

## 5. Bukti Hasil Test & Build (*Test & Build Verification*)

### A. Hasil Unit Test (Seluruh 6 File Lulus 100%)
Perintah: `npm test`
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
✅ SELURUH 6 UNIT TEST FILES FITUR INTI & KEAMANAN P8 BERHASIL LULUS (ALL PASSED: 32/32)
================================================================
```

### B. Hasil Kompilasi & Build Produksi (0 Errors)
Perintah: `npm run build`
```text
> kantin-queue-monorepo@1.0.0 build
> npm --prefix backend run build && npm --prefix frontend run build

> kantin-queue-backend@1.0.0 build
> tsc

> kantin-queue-frontend@1.0.0 build
> tsc && vite build

vite v6.4.3 building for production...
transforming...
✓ 1585 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.05 kB │ gzip:  0.64 kB
dist/assets/index-_5vdFqsX.css   41.08 kB │ gzip:  7.30 kB
dist/assets/index-BXxJSvHO.js   266.95 kB │ gzip: 72.25 kB
✓ built in 6.73s
```

---

## 6. Panduan Screenshot Aplikasi untuk Reviewer

Dokumentasikan screenshot pada laporan tugas dengan alur berikut:

1. **Screenshot 1: Katalog Menu Mahasiswa (`https://<ip>/kantin/`)**  
   *Menampilkan banner antrean, filter kategori (Semua, Makanan, Minuman, Lainnya), pencarian, dan tombol tambah ke keranjang.*
2. **Screenshot 2: Keranjang Pesanan & Catatan Khusus (`https://<ip>/kantin/cart`)**  
   *Menampilkan daftar menu yang dipilih, input nama pemesan mandiri, kolom catatan khusus per item, dan pop-up konfirmasi hapus pesanan.*
3. **Screenshot 3: Halaman Pembayaran QRIS (`https://<ip>/kantin/payment`)**  
   *Menampilkan kartu QRIS toko resmi, nomor pesanan unik, total nominal tagihan, dan tombol konfirmasi instan 1-klik.*
4. **Screenshot 4: Dashboard Pengelolaan Pesanan Penjual (`https://<ip>/kantin/seller`)**  
   *Menampilkan verifikasi pembayaran masuk, catatan khusus pemesan, tombol terbit nomor antrean (`A-001`), dan opsi bersihkan antrean.*
5. **Screenshot 5: Layar Monitor TV Kantin 3 Kolom (`https://<ip>/kantin/seller/display`)**  
   *Menampilkan monitor konter fullscreen: 🟡 Belum Dimasak, 🟣 Sedang Disiapkan, 🟢 Silakan Ambil, serta tombol Papan Menu Tersedia.*
6. **Screenshot 6: Terminal Eksekusi Unit Test & Build**  
   *Menampilkan bukti `npm test` ALL PASSED (32 assertions) dan `npm run build` sukses tanpa error.*
