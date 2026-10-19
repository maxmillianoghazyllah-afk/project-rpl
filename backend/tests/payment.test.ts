import assert from 'node:assert/strict';
import {
  validatePaymentAmount,
  validatePaymentMethod,
  canTransitionPaymentStatus,
} from '../src/services/payment.service';

console.log('🧪 Menjalankan Unit Tests: Pembayaran QRIS (payment.test.ts)...');

// Test 1: Validasi kecocokan nominal pembayaran
{
  assert.equal(validatePaymentAmount(38000, 38000), true);
  assert.equal(validatePaymentAmount(15000, 10000), false, 'Nominal tidak cocok harus mengembalikan false');
  console.log('  ✔ [PASS] validatePaymentAmount memverifikasi nominal tagihan secara tepat');
}

// Test 2: Validasi boundary error pada nominal
{
  assert.throws(() => validatePaymentAmount(0, 38000), /tidak valid/);
  assert.throws(() => validatePaymentAmount(38000, 0), /lebih dari 0/);
  assert.throws(() => validatePaymentAmount(38000, -5000), /lebih dari 0/);
  console.log('  ✔ [PASS] validatePaymentAmount menolak nominal negatif atau nol');
}

// Test 3: Validasi metode pembayaran yang didukung
{
  assert.equal(validatePaymentMethod('QRIS'), true);
  assert.equal(validatePaymentMethod('qris'), true, 'Harus case-insensitive');
  assert.equal(validatePaymentMethod('  QRIS  '), true, 'Harus mentolerir whitespace');
  assert.equal(validatePaymentMethod('CASH'), false, 'Metode tunai belum didukung di versi 1');
  assert.equal(validatePaymentMethod('BANK_TRANSFER'), false);
  console.log('  ✔ [PASS] validatePaymentMethod memastikan hanya QRIS yang diizinkan pada MVP 1');
}

// Test 4: Aturan alur transisi status pembayaran yang sah
{
  assert.equal(canTransitionPaymentStatus('PENDING', 'PAID'), true);
  assert.equal(canTransitionPaymentStatus('PENDING', 'REJECTED'), true);
  assert.equal(canTransitionPaymentStatus('PENDING', 'CANCELLED'), true);
  console.log('  ✔ [PASS] canTransitionPaymentStatus mengizinkan transisi valid dari PENDING');
}

// Test 5: Perlindungan pembayaran yang sudah berstatus PAID (Integritas Finansial)
{
  assert.equal(canTransitionPaymentStatus('PAID', 'REJECTED'), false, 'Pembayaran lunas tidak boleh ditolak');
  assert.equal(canTransitionPaymentStatus('PAID', 'PENDING'), false, 'Pembayaran lunas tidak boleh kembali pending');
  assert.equal(canTransitionPaymentStatus('REJECTED', 'PAID'), false, 'Pembayaran ditolak tidak boleh di-approve langsung');
  assert.equal(canTransitionPaymentStatus('CANCELLED', 'PAID'), false);
  console.log('  ✔ [PASS] canTransitionPaymentStatus mengunci status PAID agar tidak dapat dibatalkan sembarangan');
}

console.log('🎉 Seluruh Unit Test Pembayaran QRIS BERHASIL LULUS!\n');
