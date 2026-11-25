import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import {
  validatePaymentAmount,
  validatePaymentMethod,
  canTransitionPaymentStatus,
  PaymentStatus,
} from '../src/services/payment.service';
import { isValidPaymentTransition } from '../src/services/queue.service';

console.log('🧪 [Modul 3/6] Menjalankan 35 Unit Tests: Pembayaran QRIS & Rekonsiliasi (UT-076 s/d UT-110)...');

// 76 - 85: Validasi Nominal Pembayaran
runTest('validatePaymentAmount mengembalikan true jika nominal tagihan dan transfer sama persis', () => {
  assert.equal(validatePaymentAmount(25000, 25000), true);
});
runTest('validatePaymentAmount mengembalikan false jika nominal transfer kurang (underpayment)', () => {
  assert.equal(validatePaymentAmount(25000, 20000), false);
});
runTest('validatePaymentAmount mengembalikan false jika nominal transfer berlebih (overpayment)', () => {
  assert.equal(validatePaymentAmount(25000, 30000), false);
});
runTest('validatePaymentAmount menolak total tagihan bernilai 0', () => {
  assert.throws(() => validatePaymentAmount(0, 25000), /tidak valid/);
});
runTest('validatePaymentAmount menolak total tagihan negatif (-15000)', () => {
  assert.throws(() => validatePaymentAmount(-15000, 25000), /tidak valid/);
});
runTest('validatePaymentAmount menolak nominal pembayaran bernilai 0', () => {
  assert.throws(() => validatePaymentAmount(25000, 0), /lebih dari 0/);
});
runTest('validatePaymentAmount menolak nominal pembayaran bernilai negatif (-25000)', () => {
  assert.throws(() => validatePaymentAmount(25000, -25000), /lebih dari 0/);
});
runTest('validatePaymentAmount memverifikasi nominal besar (Rp 1.000.000) secara presisi', () => {
  assert.equal(validatePaymentAmount(1000000, 1000000), true);
});
runTest('validatePaymentAmount memverifikasi nominal ganjil (Rp 17.500) secara presisi', () => {
  assert.equal(validatePaymentAmount(17500, 17500), true);
});
runTest('validatePaymentAmount menolak perbedaan 1 rupiah sekalipun (presisi finansial)', () => {
  assert.equal(validatePaymentAmount(50000, 49999), false);
});

// 86 - 95: Validasi Metode Pembayaran QRIS
runTest('validatePaymentMethod menerima metode QRIS standar huruf kapital', () => {
  assert.equal(validatePaymentMethod('QRIS'), true);
});
runTest('validatePaymentMethod menerima metode qris huruf kecil (case-insensitive)', () => {
  assert.equal(validatePaymentMethod('qris'), true);
});
runTest('validatePaymentMethod menerima metode qris dengan spasi di awal atau akhir', () => {
  assert.equal(validatePaymentMethod('  QRIS  '), true);
});
runTest('validatePaymentMethod menolak metode CASH (karena MVP berbasis cashless)', () => {
  assert.equal(validatePaymentMethod('CASH'), false);
});
runTest('validatePaymentMethod menolak metode TRANSFER_BANK', () => {
  assert.equal(validatePaymentMethod('TRANSFER_BANK'), false);
});
runTest('validatePaymentMethod menolak metode CREDIT_CARD', () => {
  assert.equal(validatePaymentMethod('CREDIT_CARD'), false);
});
runTest('validatePaymentMethod menolak metode string kosong', () => {
  assert.equal(validatePaymentMethod(''), false);
});
runTest('validatePaymentMethod menolak metode whitespace murni', () => {
  assert.equal(validatePaymentMethod('   '), false);
});
runTest('validatePaymentMethod menolak metode PAYLATER', () => {
  assert.equal(validatePaymentMethod('PAYLATER'), false);
});
runTest('validatePaymentMethod menolak metode E_WALLET_OTHER', () => {
  assert.equal(validatePaymentMethod('GOPAY_DIRECT'), false);
});

// 96 - 110: Aturan Transisi Status Pembayaran & Integritas Finansial
runTest('canTransitionPaymentStatus mengizinkan persetujuan dari PENDING ke PAID', () => {
  assert.equal(canTransitionPaymentStatus('PENDING', 'PAID'), true);
});
runTest('canTransitionPaymentStatus mengizinkan penolakan dari PENDING ke REJECTED', () => {
  assert.equal(canTransitionPaymentStatus('PENDING', 'REJECTED'), true);
});
runTest('canTransitionPaymentStatus mengizinkan pembatalan dari PENDING ke CANCELLED', () => {
  assert.equal(canTransitionPaymentStatus('PENDING', 'CANCELLED'), true);
});
runTest('canTransitionPaymentStatus mengizinkan status tetap PENDING ke PENDING', () => {
  assert.equal(canTransitionPaymentStatus('PENDING', 'PENDING'), true);
});
runTest('canTransitionPaymentStatus mengunci status PAID agar tidak dapat dibatalkan ke REJECTED', () => {
  assert.equal(canTransitionPaymentStatus('PAID', 'REJECTED'), false);
});
runTest('canTransitionPaymentStatus mengunci status PAID agar tidak dapat dibatalkan ke CANCELLED', () => {
  assert.equal(canTransitionPaymentStatus('PAID', 'CANCELLED'), false);
});
runTest('canTransitionPaymentStatus mengunci status PAID agar tidak dapat kembali ke PENDING', () => {
  assert.equal(canTransitionPaymentStatus('PAID', 'PENDING'), false);
});
runTest('canTransitionPaymentStatus mengizinkan status tetap PAID ke PAID (idempotent)', () => {
  assert.equal(canTransitionPaymentStatus('PAID', 'PAID'), true);
});
runTest('canTransitionPaymentStatus menolak pembayaran REJECTED di-approve ke PAID secara langsung', () => {
  assert.equal(canTransitionPaymentStatus('REJECTED', 'PAID'), false);
});
runTest('canTransitionPaymentStatus menolak pembayaran CANCELLED di-approve ke PAID', () => {
  assert.equal(canTransitionPaymentStatus('CANCELLED', 'PAID'), false);
});
runTest('canTransitionPaymentStatus mengizinkan status tetap REJECTED ke REJECTED', () => {
  assert.equal(canTransitionPaymentStatus('REJECTED', 'REJECTED'), true);
});
runTest('canTransitionPaymentStatus mengizinkan status tetap CANCELLED ke CANCELLED', () => {
  assert.equal(canTransitionPaymentStatus('CANCELLED', 'CANCELLED'), true);
});
runTest('isValidPaymentTransition konsisten mengizinkan PENDING ke PAID', () => {
  assert.equal(isValidPaymentTransition('PENDING', 'PAID'), true);
});
runTest('isValidPaymentTransition konsisten menolak PAID ke REJECTED', () => {
  assert.equal(isValidPaymentTransition('PAID', 'REJECTED'), false);
});
runTest('isValidPaymentTransition konsisten menolak status tidak dikenal', () => {
  assert.equal(isValidPaymentTransition('UNKNOWN' as any, 'PAID'), false);
});

printTestSummary('Modul 3: Pembayaran QRIS & Rekonsiliasi (35 UT)');
