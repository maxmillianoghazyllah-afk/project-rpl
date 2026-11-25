import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import {
  formatQueueNumber,
  isValidQueueTransition,
  mapQueueStatusToOrderStatus,
  calculateEstimatedWaitTime,
  determineQueuePrefix,
  formatMultiCounterQueue,
  QueueStatus,
} from '../src/services/queue.service';

console.log('🧪 [Modul 2/6] Menjalankan 35 Unit Tests: Antrean, Waktu Tunggu & Konter (UT-041 s/d UT-075)...');

// 41 - 50: Penomoran Antrean & Validasi Input
runTest('formatQueueNumber memformat urutan 1 menjadi A-001 dengan padding 3 digit', () => {
  assert.equal(formatQueueNumber(1), 'A-001');
});
runTest('formatQueueNumber memformat urutan puluhan (25) menjadi A-025', () => {
  assert.equal(formatQueueNumber(25), 'A-025');
});
runTest('formatQueueNumber memformat urutan ratusan (100) menjadi A-100', () => {
  assert.equal(formatQueueNumber(100), 'A-100');
});
runTest('formatQueueNumber memformat urutan ribuan (1000) tanpa terpotong (A-1000)', () => {
  assert.equal(formatQueueNumber(1000), 'A-1000');
});
runTest('formatQueueNumber mendukung kustomisasi prefix huruf seperti B-001', () => {
  assert.equal(formatQueueNumber(1, 'B'), 'B-001');
});
runTest('formatQueueNumber mendukung kustomisasi prefix konter C (C-007)', () => {
  assert.equal(formatQueueNumber(7, 'C'), 'C-007');
});
runTest('formatQueueNumber menolak nomor antrean 0', () => {
  assert.throws(() => formatQueueNumber(0), /lebih dari nol/);
});
runTest('formatQueueNumber menolak nomor antrean negatif (-5)', () => {
  assert.throws(() => formatQueueNumber(-5), /lebih dari nol/);
});
runTest('formatQueueNumber menolak nomor antrean desimal (3.14)', () => {
  assert.throws(() => formatQueueNumber(3.14), /bilangan bulat/);
});
runTest('formatQueueNumber menolak input NaN', () => {
  assert.throws(() => formatQueueNumber(NaN), /bilangan bulat/);
});

// 51 - 60: Estimasi Waktu Tunggu Antrean Dapur (P11 Feature)
runTest('calculateEstimatedWaitTime saat antrean kosong bernilai 0 menit (Siap dimasak segera)', () => {
  const est = calculateEstimatedWaitTime(0, 0);
  assert.equal(est.totalMinutes, 0);
  assert.equal(est.displayText, 'Siap dimasak segera');
  assert.equal(est.isHighLoad, false);
});
runTest('calculateEstimatedWaitTime untuk 1 antrean waiting bernilai 4 menit', () => {
  const est = calculateEstimatedWaitTime(1, 0, 4);
  assert.equal(est.totalMinutes, 4);
  assert.equal(est.displayText, '~5 menit');
  assert.equal(est.isHighLoad, false);
});
runTest('calculateEstimatedWaitTime untuk 3 waiting dan 2 in-progress dihitung tepat (~16 menit)', () => {
  // 3 * 4 = 12, 2 * 2 = 4 -> Total 16 menit
  const est = calculateEstimatedWaitTime(3, 2, 4);
  assert.equal(est.totalMinutes, 16);
  assert.equal(est.displayText, '~16 menit');
  assert.equal(est.isHighLoad, false);
});
runTest('calculateEstimatedWaitTime mendeteksi beban antrean padat jika > 20 menit (isHighLoad: true)', () => {
  // 6 * 4 = 24 menit
  const est = calculateEstimatedWaitTime(6, 0, 4);
  assert.equal(est.totalMinutes, 24);
  assert.equal(est.isHighLoad, true);
  assert.match(est.displayText, /Antrean Padat/);
});
runTest('calculateEstimatedWaitTime menolak parameter waiting negatif', () => {
  assert.throws(() => calculateEstimatedWaitTime(-1, 0), /tidak valid/);
});
runTest('calculateEstimatedWaitTime menolak parameter inProgress negatif', () => {
  assert.throws(() => calculateEstimatedWaitTime(0, -2), /tidak valid/);
});
runTest('calculateEstimatedWaitTime menolak rata-rata waktu per order <= 0', () => {
  assert.throws(() => calculateEstimatedWaitTime(2, 1, 0), /tidak valid/);
});
runTest('determineQueuePrefix mengembalikan A untuk kategori Makanan', () => {
  assert.equal(determineQueuePrefix('Makanan'), 'A');
});
runTest('determineQueuePrefix mengembalikan B untuk kategori Minuman / Kopi', () => {
  assert.equal(determineQueuePrefix('Minuman Dingin'), 'B');
  assert.equal(determineQueuePrefix('Kopi'), 'B');
  assert.equal(determineQueuePrefix('Jus Buah'), 'B');
});
runTest('determineQueuePrefix mengembalikan C untuk kategori Camilan / Snack', () => {
  assert.equal(determineQueuePrefix('Camilan'), 'C');
  assert.equal(determineQueuePrefix('Snack'), 'C');
  assert.equal(determineQueuePrefix('Gorengan'), 'C');
});

// 61 - 75: Multi-Konter & Aturan Transisi Status Antrean
runTest('determineQueuePrefix default ke A jika kategori tidak dikenal atau kosong', () => {
  assert.equal(determineQueuePrefix(''), 'A');
  assert.equal(determineQueuePrefix(undefined), 'A');
});
runTest('formatMultiCounterQueue menghasilkan B-012 untuk pesanan kategori Minuman', () => {
  assert.equal(formatMultiCounterQueue('Minuman', 12), 'B-012');
});
runTest('formatMultiCounterQueue menghasilkan C-003 untuk pesanan kategori Camilan', () => {
  assert.equal(formatMultiCounterQueue('Camilan', 3), 'C-003');
});
runTest('isValidQueueTransition mengizinkan transisi maju WAITING ke IN_PROGRESS', () => {
  assert.equal(isValidQueueTransition('WAITING', 'IN_PROGRESS'), true);
});
runTest('isValidQueueTransition mengizinkan pembatalan langsung dari WAITING ke COMPLETED', () => {
  assert.equal(isValidQueueTransition('WAITING', 'COMPLETED'), true);
});
runTest('isValidQueueTransition mengizinkan transisi maju IN_PROGRESS ke READY', () => {
  assert.equal(isValidQueueTransition('IN_PROGRESS', 'READY'), true);
});
runTest('isValidQueueTransition mengizinkan transisi maju READY ke COMPLETED (pesanan diambil)', () => {
  assert.equal(isValidQueueTransition('READY', 'COMPLETED'), true);
});
runTest('isValidQueueTransition mengizinkan status tetap (idempotent)', () => {
  assert.equal(isValidQueueTransition('WAITING', 'WAITING'), true);
  assert.equal(isValidQueueTransition('READY', 'READY'), true);
});
runTest('isValidQueueTransition menolak transisi mundur dari COMPLETED ke WAITING', () => {
  assert.equal(isValidQueueTransition('COMPLETED', 'WAITING'), false);
});
runTest('isValidQueueTransition menolak transisi mundur dari COMPLETED ke IN_PROGRESS', () => {
  assert.equal(isValidQueueTransition('COMPLETED', 'IN_PROGRESS'), false);
});
runTest('isValidQueueTransition menolak transisi mundur dari READY ke IN_PROGRESS', () => {
  assert.equal(isValidQueueTransition('READY', 'IN_PROGRESS'), false);
});
runTest('mapQueueStatusToOrderStatus memetakan WAITING ke CONFIRMED', () => {
  assert.equal(mapQueueStatusToOrderStatus('WAITING'), 'CONFIRMED');
});
runTest('mapQueueStatusToOrderStatus memetakan IN_PROGRESS ke PREPARING', () => {
  assert.equal(mapQueueStatusToOrderStatus('IN_PROGRESS'), 'PREPARING');
});
runTest('mapQueueStatusToOrderStatus memetakan READY ke READY', () => {
  assert.equal(mapQueueStatusToOrderStatus('READY'), 'READY');
});
runTest('mapQueueStatusToOrderStatus memetakan COMPLETED ke COMPLETED', () => {
  assert.equal(mapQueueStatusToOrderStatus('COMPLETED'), 'COMPLETED');
});

printTestSummary('Modul 2: Antrean & Waktu Tunggu (35 UT)');
