/**
 * Test Harness untuk Penomoran dan Verifikasi 200 Unit Tests (P11)
 * Menyediakan runner terstandar, penghitung tes, pencatatan waktu,
 * dan simulasi kegagalan (Failure Injection) untuk pengujian CI/CD Pipeline.
 */

let testCounter = 0;
let passedCount = 0;
let failedCount = 0;
const failures: { id: number; title: string; error: any }[] = [];

export const isFailureSimulated =
  process.env.SIMULATE_FAILURE === 'true' || process.argv.includes('--fail');

export function runTest(title: string, testFn: () => void): void {
  testCounter++;
  const currentId = testCounter;
  const padId = String(currentId).padStart(3, '0');

  // Simulasi failure sengaja pada test tertentu jika flag SIMULATE_FAILURE aktif
  if (isFailureSimulated && currentId === 42) {
    try {
      throw new Error(
        'Simulasi Kegagalan Sengaja [UT-042]: Aturan bisnis diskon voucher gagal memvalidasi batas minimum belanja!'
      );
    } catch (err: any) {
      failedCount++;
      failures.push({ id: currentId, title, error: err });
      console.log(`  ❌ [UT-${padId}/200] FAILED: ${title}`);
      console.log(`     └─ Error: ${err.message}`);
      return;
    }
  }

  try {
    testFn();
    passedCount++;
    console.log(`  ✔ [UT-${padId}/200] PASS: ${title}`);
  } catch (err: any) {
    failedCount++;
    failures.push({ id: currentId, title, error: err });
    console.log(`  ❌ [UT-${padId}/200] FAILED: ${title}`);
    console.log(`     └─ Error: ${err.message}`);
  }
}

export function printTestSummary(categoryTitle: string): void {
  console.log(`🎉 [Kategori Selesai] ${categoryTitle} - Total Berjalan: ${testCounter}\n`);
}

export function printFinalSummary(): boolean {
  console.log('\n================================================================');
  console.log('📊 REKAPITULASI HASIL EKSEKUSI 200 UNIT TESTS (P11)');
  console.log('================================================================');
  console.log(`Total Unit Tests Terdaftar : ${testCounter}`);
  console.log(`Lulus (PASSED)             : ${passedCount}`);
  console.log(`Gagal (FAILED)             : ${failedCount}`);
  console.log('================================================================');

  if (failedCount > 0) {
    console.log('❌ HASIL PENGUJIAN: TEST SUITE GAGAL (MERAH) 🛑');
    console.log(`Ditemukan ${failedCount} pengujian gagal:`);
    failures.forEach((f) => {
      console.log(` - [UT-${String(f.id).padStart(3, '0')}] ${f.title}`);
      console.log(`   Penyebab: ${f.error.message}`);
    });
    console.log('\n🚨 [EFEK KEGAGALAN TERHADAP PIPELINE]:');
    console.log(' 1. Auto-Build: DIBATALKAN (Command "npm run build" tidak dieksekusi).');
    console.log(' 2. Deployment: DIBLOKIR (Sistem menolak rilis kode bermasalah ke Cloud/Vercel).');
    console.log(' 3. Server Live: AMAN (Server produksi tetap menyajikan versi stabil sebelumnya).');
    console.log('================================================================\n');
    return false;
  }

  console.log('✅ SELURUH 200/200 UNIT TESTS LULUS DENGAN SEMPURNA (HIJAU) 🎉');
  console.log('🚀 [EFEK KELULUSAN TERHADAP PIPELINE]:');
  console.log(' 1. Auto-Build: DIIZINKAN (Otomatis melanjutkan ke proses tsc & vite build).');
  console.log(' 2. Deployment: DIIZINKAN (Kode siap dideploy ke Vercel / VPS produksi).');
  console.log(' 3. Server Live: STATUS AKTIF & SIAP DILAKUKAN TESTING TAHAP BERIKUTNYA.');
  console.log('================================================================\n');
  return true;
}
