import assert from 'node:assert/strict';
import {
  formatQueueNumber,
  isValidPaymentTransition,
  isValidQueueTransition,
  mapQueueStatusToOrderStatus,
} from '../src/services/queue.service';

console.log('🧪 Menjalankan Unit Tests: Fitur 2 - Pembayaran QRIS & Manajemen Antrean...');

// Test 1: Penomoran antrean berurutan
{
  assert.equal(formatQueueNumber(1), 'A-001');
  assert.equal(formatQueueNumber(5), 'A-005');
  assert.equal(formatQueueNumber(25), 'A-025');
  assert.equal(formatQueueNumber(100), 'A-100');
  console.log('  ✔ [PASS] formatQueueNumber menghasilkan padding 3 digit yang tepat (A-001)');
}

// Test 2: Validasi input penomoran tidak valid
{
  assert.throws(() => formatQueueNumber(0), /lebih dari nol/);
  assert.throws(() => formatQueueNumber(-3), /lebih dari nol/);
  assert.throws(() => formatQueueNumber(1.5), /bilangan bulat/);
  console.log('  ✔ [PASS] formatQueueNumber menolak angka 0, negatif, atau desimal');
}

// Test 3: Aturan alur status pembayaran QRIS
{
  assert.equal(isValidPaymentTransition('PENDING', 'PAID'), true);
  assert.equal(isValidPaymentTransition('PENDING', 'REJECTED'), true);
  assert.equal(isValidPaymentTransition('PAID', 'REJECTED'), false, 'Pembayaran yang sudah lunas tidak boleh ditolak');
  assert.equal(isValidPaymentTransition('REJECTED', 'PAID'), false, 'Pembayaran yang sudah ditolak tidak boleh di-approve');
  console.log('  ✔ [PASS] isValidPaymentTransition memvalidasi alur persetujuan & penolakan QRIS');
}

// Test 4: Aturan alur transisi status antrean dapur
{
  // Alur maju normal: WAITING -> IN_PROGRESS -> READY -> COMPLETED
  assert.equal(isValidQueueTransition('WAITING', 'IN_PROGRESS'), true);
  assert.equal(isValidQueueTransition('IN_PROGRESS', 'READY'), true);
  assert.equal(isValidQueueTransition('READY', 'COMPLETED'), true);

  // Alur mundur ilegal
  assert.equal(isValidQueueTransition('COMPLETED', 'WAITING'), false, 'Pesanan selesai tidak boleh mundur');
  assert.equal(isValidQueueTransition('COMPLETED', 'IN_PROGRESS'), false, 'Pesanan selesai tidak boleh dimasak lagi');
  assert.equal(isValidQueueTransition('READY', 'IN_PROGRESS'), false, 'Pesanan siap saji tidak boleh mundur');
  console.log('  ✔ [PASS] isValidQueueTransition mencegah perubahan status antrean mundur ilegal');
}

// Test 5: Pemetaan status antrean ke status pesanan utama
{
  assert.equal(mapQueueStatusToOrderStatus('WAITING'), 'CONFIRMED');
  assert.equal(mapQueueStatusToOrderStatus('IN_PROGRESS'), 'PREPARING');
  assert.equal(mapQueueStatusToOrderStatus('READY'), 'READY');
  assert.equal(mapQueueStatusToOrderStatus('COMPLETED'), 'COMPLETED');
  console.log('  ✔ [PASS] mapQueueStatusToOrderStatus menyinkronkan status pesanan secara presisi');
}

console.log('🎉 Seluruh Unit Test Fitur 2 (Queue Service) BERHASIL LULUS!\n');
