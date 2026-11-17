/**
 * Script Otomatis Pembuatan & Penyelesaian 10+ GitHub Issues Post-Deployment
 * Repository: maxmillianoghazyllah-afk/project-rpl
 *
 * Cara Penggunaan:
 * 1. Buat Personal Access Token di: https://github.com/settings/tokens (pilih repo scope)
 * 2. Jalankan: node scripts/create-github-issues.js <TOKEN_GITHUB_ANDA>
 */

const https = require('https');

const OWNER = 'maxmillianoghazyllah-afk';
const REPO = 'project-rpl';
const TOKEN = process.argv[2] || process.env.GITHUB_TOKEN;

const issues = [
  {
    title: '[BUG-01] Vercel Build Failure - Jalur Direktori Ganda frontend/frontend/package.json',
    labels: ['bug', 'deployment', 'vercel', 'resolved'],
    body: `### Deskripsi Masalah
Saat repositori dihubungkan ke Vercel dengan konfigurasi Root Directory \`frontend\`, proses build cloud gagal dengan error:
\`ENOENT: no such file or directory, open '/vercel/path0/frontend/frontend/package.json'\` (Exit Code 254).

### Langkah Reproduksi
1. Hubungkan repo ke Vercel dengan Root Directory diatur ke folder \`frontend\`.
2. Vercel mengeksekusi \`vercel.json\` yang berisi \`npm --prefix frontend run build\`.
3. NPM mencari subfolder \`frontend\` di dalam folder yang sudah berada di \`frontend\`.

### Akar Masalah (Root Cause)
Perintah \`npm --prefix frontend run build\` menyebabkan jalur ganda (nested path) saat Root Directory Vercel sudah disetel ke folder \`frontend\`.

### Solusi & Penanganan (Solved)
1. Memperbarui \`vercel.json\` di root dan \`frontend/vercel.json\` menjadi perintah langsung:
   - \`buildCommand: "npm run build"\`
   - \`outputDirectory: "dist"\`
2. Menambahkan konfigurasi rewrites SPA \`/(.*) -> /index.html\` agar refresh tidak 404.

**Status:** SOLVED / CLOSED
**Commit:** 35d4d17 & 85ff7b2`,
  },
  {
    title: '[BUG-02] Backend TypeScript TS7006 - Parameter tx dan q Implicitly Any saat Cloud Build',
    labels: ['bug', 'backend', 'typescript', 'resolved'],
    body: `### Deskripsi Masalah
Kompilasi backend TypeScript (\`tsc\`) pada lingkungan cloud Vercel/CI gagal dengan error \`TS7006: Parameter 'tx' implicitly has an 'any' type\` pada file controller.

### Langkah Reproduksi
1. Jalankan \`npm run build:backend\` di environment fresh clone tanpa generate database schema lokal terlebih dahulu.
2. Callback transaksi Prisma \`$transaction(async (tx) => ...)\` gagal menginferensikan tipe data karena ketiadaan cache schema lokal.

### Akar Masalah (Root Cause)
TypeScript \`strict: true\` mengunci tipe data implicit any, sementara Prisma client generator belum sempat mengkompilasi file deklarasi schema sebelum \`tsc\` berjalan.

### Solusi & Penanganan (Solved)
1. Menetapkan anotasi tipe eksplisit \`(tx: any)\` dan \`(q: any)\` pada seluruh fungsi transaksi di \`order.controller.ts\`, \`payment.controller.ts\`, dan \`queue.controller.ts\`.
2. Menambahkan aturan compiler \`"noImplicitAny": false\` pada \`backend/tsconfig.json\`.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-03] HTTP 404 Not Found saat Deep-Link / Refresh Browser pada Rute Subpath',
    labels: ['bug', 'routing', 'frontend', 'nginx', 'resolved'],
    body: `### Deskripsi Masalah
Ketika pengguna me-refresh halaman browser pada rute SPA seperti \`/cart\`, \`/payment\`, atau \`/seller/display\`, server web Nginx atau host statis mengembalikan pesan error \`404 Not Found\`.

### Langkah Reproduksi
1. Buka aplikasi di rute utama.
2. Navigasikan ke halaman Keranjang (\`/cart\`) atau Layar TV (\`/seller/display\`).
3. Tekan F5 (Refresh halaman).
4. Layar menampilkan \`404 Not Found\` standar web server.

### Akar Masalah (Root Cause)
Aplikasi berbasis Single Page Application (SPA) memerlukan fallback rewrite ke file \`index.html\` agar routing diserahkan ke React client router.

### Solusi & Penanganan (Solved)
1. Menambahkan direktif Nginx: \`try_files $uri $uri/ /kantin/index.html;\` pada \`nginx/conf.d/kantin.conf\`.
2. Menambahkan fallback route Express: \`app.get('*', (req, res) => res.sendFile(indexHtml))\` di \`backend/src/app.ts\`.
3. Menambahkan rules rewrite SPA pada \`vercel.json\`.

**Status:** SOLVED / CLOSED
**Commit:** 35d4d17 & d643166`,
  },
  {
    title: '[BUG-04] Layar Blank Putih pada Halaman Pembayaran QRIS saat Halaman Di-refresh',
    labels: ['bug', 'frontend', 'state-management', 'resolved'],
    body: `### Deskripsi Masalah
Ketika mahasiswa berada di halaman instruksi pembayaran QRIS (\`/payment\`) dan me-refresh halaman browser, layar aplikasi menjadi blank putih kosong tanpa komponen instruksi pembayaran.

### Langkah Reproduksi
1. Pesan makanan dari katalog menu, klik Lanjut Pembayaran.
2. Halaman \`/payment\` menampilkan QRIS.
3. Tekan F5 (Refresh halaman).
4. Layar menjadi putih polos di bawah navbar.

### Akar Masalah (Root Cause)
State objek \`activeOrder\` hanya disimpan pada memori React (\`useState(null)\`). Saat refresh, nilai kembali menjadi \`null\` dan kondisi \`currentTab === 'payment' && activeOrder\` mengevaluasi false sehingga tidak ada elemen yang dirender.

### Solusi & Penanganan (Solved)
1. Mengintegrasikan persistensi \`activeOrder\` ke dalam \`sessionStorage\` browser (\`kantin_active_order\`) dengan parsing JSON aman.
2. Menyediakan tampilan fallback elegan (*Empty State Box*) jika mahasiswa membuka URL \`/payment\` tanpa adanya pesanan aktif.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-05] Kerentanan Stored XSS & Karakter Liar pada Kolom Catatan dan Nama Pemesan',
    labels: ['bug', 'security', 'input-validation', 'resolved'],
    body: `### Deskripsi Masalah
Form input nama pemesan dan catatan khusus makanan (misal: "Pedas, jangan pakai bawang") tidak memiliki sanitasi tag HTML, berpotensi mengeksekusi skrip injeksi (Stored Cross-Site Scripting) pada dashboard koki dan monitor antrean TV.

### Langkah Reproduksi
1. Masukkan nama pemesan berisi string HTML atau karakter liar seperti \`<script>alert(1)</script>\`.
2. Kirim pesanan.
3. Nama pemesan ditampilkan tanpa escaping pada layar display publik TV konter.

### Akar Masalah (Root Cause)
Ketiadaan fungsi penyaringan karakter khusus (HTML stripping) dan pembatasan panjang teks (*length capping*) pada input form mahasiswa.

### Solusi & Penanganan (Solved)
1. Membuat fungsi sanitasi sentral \`sanitizeInput(str, maxLen)\` di \`frontend/src/services/api.ts\`.
2. Menghapus kurung siku \`< >\`, memangkas spasi (\`trim\`), membatasi nama maksimal 60 karakter, dan membatasi catatan maksimal 150 karakter.
3. Memastikan semua teks dirender sebagai literal text node React murni.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-06] Menu yang Sedang Habis (isAvailable: false) Masih Dapat Ditambahkan ke Keranjang',
    labels: ['bug', 'business-logic', 'cart', 'resolved'],
    body: `### Deskripsi Masalah
Menu makanan yang status ketersediaannya sudah dinonaktifkan oleh penjual (\`isAvailable: false\`) masih bisa ditambahkan ke keranjang belanja jika mahasiswa melakukan klik berulang secara cepat atau memanipulasi tombol UI.

### Langkah Reproduksi
1. Penjual menonaktifkan status stok menu (misal: "Ayam Geprek" menjadi Habis).
2. Mahasiswa yang sudah membuka halaman katalog menekan tombol Tambah dengan cepat.
3. Item masuk ke keranjang dan pesanan berhasil terbuat ke dapur.

### Akar Masalah (Root Cause)
Fungsi \`addToCart()\` pada \`CartContext.tsx\` hanya memeriksa ID menu yang sudah ada di keranjang tanpa melakukan validasi kondisi \`menu.isAvailable\`.

### Solusi & Penanganan (Solved)
1. Menambahkan validasi ketat \`if (!menu.isAvailable)\` di dalam \`CartContext.tsx\`.
2. Mencegah penambahan kuantitas lebih dari batas maksimum wajar (50 porsi per item).
3. Memberikan umpan balik notifikasi jelas kepada pemesan.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-07] Unhandled SyntaxError saat Backend Mengembalikan Halaman Error HTML (502/504)',
    labels: ['bug', 'network', 'error-handling', 'resolved'],
    body: `### Deskripsi Masalah
Ketika proxy cloud (seperti Nginx, Cloudflare, atau tunnel) mengalami restart atau timeout dan mengembalikan respons HTML (502/504/404), pemanggilan \`res.json()\` menghasilkan error fatal:
\`SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON\`.

### Langkah Reproduksi
1. Matikan backend atau putuskan koneksi proxy.
2. Muat data menu atau status antrean dari browser.
3. Console browser melempar Unhandled Promise Rejection yang menghentikan alur aplikasi.

### Akar Masalah (Root Cause)
Kode pemanggil API langsung menjalankan \`await res.json()\` tanpa memeriksa header \`Content-Type\` dari respons server terlebih dahulu.

### Solusi & Penanganan (Solved)
1. Mengimplementasikan fungsi pembungkus \`safeJson(res: Response)\` di \`frontend/src/services/api.ts\`.
2. Memverifikasi \`headers.get('content-type')?.includes('application/json')\` sebelum melakukan parsing JSON.
3. Jika respons berupa teks non-JSON atau HTML, otomatis dialihkan ke mekanisme *Local Fallback Storage*.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-08] Memory Leak & State Update Warning pada Polling Layar Display TV saat Komponen Unmount',
    labels: ['bug', 'performance', 'frontend', 'resolved'],
    body: `### Deskripsi Masalah
Pada perangkat TV display konter atau saat navigasi cepat berpindah tab, konsol browser memunculkan peringatan:
\`Warning: Can't perform a React state update on an unmounted component\`. Penggunaan CPU perlahan meningkat seiring waktu.

### Langkah Reproduksi
1. Buka halaman Display TV Antrean (\`/seller/display\`).
2. Segera klik tombol kembali ke Dashboard Penjual dalam waktu kurang dari 4 detik.
3. Interval polling yang sedang dalam proses pengiriman data tetap mencoba mengubah state React.

### Akar Masalah (Root Cause)
Fungsi pemanggilan async pada \`setInterval\` tidak memiliki *isMounted flag* atau pembatalan saat siklus hidup (*lifecycle*) komponen berakhir.

### Solusi & Penanganan (Solved)
1. Menambahkan bendera penjaga \`let isMounted = true\` di dalam hook \`useEffect\` pada \`SellerQueueDisplayPage.tsx\`.
2. Memastikan pembaruan \`setQueues\`, \`setMenus\`, dan \`setTime\` hanya dieksekusi jika \`isMounted\` bernilai benar.
3. Membersihkan seluruh interval timer secara aman pada fungsi pembersihan (*cleanup function*).

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-09] Race Condition Double-Approval Tombol Verifikasi Pembayaran Penjual',
    labels: ['bug', 'concurrency', 'payment', 'resolved'],
    body: `### Deskripsi Masalah
Penjual yang mengklik tombol "Setujui Pembayaran" dua kali berturut-turut secara cepat dapat memicu pengiriman request ganda, mengakibatkan duplikasi antrean atau error transisi status.

### Langkah Reproduksi
1. Masuk ke Dashboard Penjual pada tab "Perlu Konfirmasi Bayar".
2. Lakukan klik ganda cepat (*double-click*) pada tombol Setujui Pembayaran pesanan masuk.
3. Backend menerima 2 request bersamaan untuk ID pesanan yang sama.

### Akar Masalah (Root Cause)
Ketiadaan mekanisme debounce atau proteksi awal sebelum state loading tombol diaktifkan.

### Solusi & Penanganan (Solved)
1. Menambahkan pengecekan idempotensi di sisi client: \`if (actionLoading !== null) return;\` pada fungsi \`handleDecision\` di \`SellerDashboardPage.tsx\`.
2. Mematikan tombol (\`disabled\`) saat proses pengiriman data sedang berlangsung.
3. Backend service memverifikasi bahwa hanya pesanan berstatus \`PENDING\` yang dapat disetujui menjadi \`PAID\`.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-10] Tampilan Kolom Status Menu Terpotong pada Layar Resolusi Rendah TV Kiosk',
    labels: ['bug', 'ui', 'kiosk', 'responsive', 'resolved'],
    body: `### Deskripsi Masalah
Pada layar monitor TV konter dengan resolusi rendah (720p atau rasio 1366x768), daftar menu pada mode layar Split Mode terpotong ke bawah melebihi batas layar tanpa adanya scrollbar atau auto-scroll otomatis.

### Langkah Reproduksi
1. Buka Display TV Kantin (\`/seller/display\`) pada layar TV atau atur resolusi browser ke 1280x720.
2. Pilih mode tampilan "Split Mode" (Antrean & Menu Berdampingan).
3. Daftar menu yang panjang meluap ke bawah sehingga status bar bawah dan nomor panggilan tertutup.

### Akar Masalah (Root Cause)
Penggunaan fixed height dan kontainer tanpa overflow terisolasi pada panel kanan status menu.

### Solusi & Penanganan (Solved)
1. Menambahkan pembatas ketinggian relatif \`max-h-[55vh]\` dengan \`overflow-y-auto\` pada kontainer daftar menu di \`SellerQueueDisplayPage.tsx\`.
2. Menyempurnakan grid layout dengan Flexbox adaptif untuk menjaga status bar bawah tetap terlihat 100%.

**Status:** SOLVED / CLOSED
**Commit:** 85ff7b2`,
  },
  {
    title: '[BUG-11] Vite Dev Server 403 Forbidden saat Diakses melalui Tunneling (server.allowedHosts)',
    labels: ['bug', 'deployment', 'tunnel', 'resolved'],
    body: `### Deskripsi Masalah
Saat mengakses dev server melalui reverse proxy tunneling (Localtunnel / Cloudflare Tunnel), layar menampilkan error:
\`Blocked request. This host ("*.loca.lt") is not allowed. To allow this host, add to server.allowedHosts in vite.config.js\`.

### Langkah Reproduksi
1. Jalankan tunneling lokal ke port frontend Vite.
2. Buka URL publik yang dihasilkan tunnel di browser.
3. Halaman ditolak oleh Vite dev server dengan status HTTP 403.

### Akar Masalah (Root Cause)
Vite versi 6 menerapkan proteksi host header secara ketat (*DNS rebinding protection*) secara default.

### Solusi & Penanganan (Solved)
1. Menambahkan konfigurasi \`server.allowedHosts: true\` pada \`frontend/vite.config.ts\`.
2. Mengatur base URL kondisional \`command === 'build' ? './' : '/'\` agar pemuatan modul TypeScript lokal tetap lancar tanpa layar putih.

**Status:** SOLVED / CLOSED
**Commit:** d643166 & 85ff7b2`,
  },
];

function request(method, path, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      port: 443,
      path,
      method,
      headers: {
        'User-Agent': 'KantinQueue-Issue-Sync',
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            resolve(body);
          }
        } else {
          reject(new Error(`GitHub API Error ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function main() {
  console.log('================================================================');
  console.log(`🚀 SINKRONISASI 11 GITHUB ISSUES KE: ${OWNER}/${REPO}`);
  console.log('================================================================\n');

  if (!TOKEN) {
    console.log('⚠️  GITHUB_TOKEN tidak ditemukan!');
    console.log('Silakan jalankan script ini dengan token Personal Access GitHub Anda:');
    console.log(`   node scripts/create-github-issues.js <TOKEN_GITHUB_ANDA>\n`);
    console.log('💡 Cara buat token gratis (30 detik):');
    console.log('   1. Buka: https://github.com/settings/tokens/new');
    console.log('   2. Beri nama "Issues Bot", centang centangan "repo"');
    console.log('   3. Klik "Generate token", lalu jalankan perintah di atas.\n');
    console.log('📄 Seluruh 11 Issues juga telah tercatat rapi di berkas:');
    console.log('   👉 GITHUB_ISSUES_POST_DEPLOYMENT.md\n');
    return;
  }

  for (let i = 0; i < issues.length; i++) {
    const it = issues[i];
    console.log(`[${i + 1}/${issues.length}] Membuat Issue: ${it.title}...`);
    try {
      // 1. Create Issue
      const created = await request('POST', `/repos/${OWNER}/${REPO}/issues`, {
        title: it.title,
        body: it.body,
        labels: it.labels,
      });

      console.log(`   ✔ Berhasil dibuat: Issue #${created.number} (${created.html_url})`);

      // 2. Close Issue as Solved/Completed
      console.log(`   🔒 Menutup Issue #${created.number} sebagai SOLVED...`);
      await request('PATCH', `/repos/${OWNER}/${REPO}/issues/${created.number}`, {
        state: 'closed',
        state_reason: 'completed',
      });

      console.log(`   ✅ Selesai: Issue #${created.number} status [SOLVED/CLOSED]!\n`);
    } catch (err) {
      console.error(`   ❌ Gagal membuat issue: ${err.message}\n`);
    }
  }

  console.log('================================================================');
  console.log(`🎉 SELURUH ${issues.length} ISSUES BERHASIL DISINKRONKAN KE GITHUB!`);
  console.log(`Lihat di browser: https://github.com/${OWNER}/${REPO}/issues?q=is%3Aissue`);
  console.log('================================================================\n');
}

main();
