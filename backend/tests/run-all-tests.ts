/**
 * Runner Sentral Eksekusi 200 Unit Tests (Tugas P11)
 * Menjalankan 6 modul pengujian komprehensif (40 + 35 + 35 + 30 + 30 + 30 = 200 UT).
 *
 * Mode Eksekusi:
 * 1. Normal (All Passed - Hijau) : ts-node tests/run-all-tests.ts
 * 2. Failure Simulation (Merah) : SIMULATE_FAILURE=true ts-node tests/run-all-tests.ts
 */

import { printFinalSummary } from './test-harness';

console.log('================================================================');
console.log('🚀 MEMULAI EKSEKUSI 200 UNIT TESTS KANTIN QUEUE (P11)');
console.log('================================================================\n');

// 1. Modul 1: Pemesanan, Kalkulasi & Promo (UT-001 s/d UT-040) - 40 UT
import './order_promo.test';

// 2. Modul 2: Antrean, Waktu Tunggu & Konter (UT-041 s/d UT-075) - 35 UT
import './queue_timing.test';

// 3. Modul 3: Pembayaran QRIS & Rekonsiliasi (UT-076 s/d UT-110) - 35 UT
import './payment_recon.test';

// 4. Modul 4: Manajemen Menu, Kategori & Stok (UT-111 s/d UT-140) - 30 UT
import './menu_stock.test';

// 5. Modul 5: Autentikasi & Hak Akses RBAC (UT-141 s/d UT-170) - 30 UT
import './auth_rbac.test';

// 6. Modul 6: Keamanan, Data Masking & Safe Logging (UT-171 s/d UT-200) - 30 UT
import './security_safe.test';

// Rekapitulasi Akhir & Exit Code
const isSuccess = printFinalSummary();
if (!isSuccess) {
  process.exit(1);
}
