import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import {
  calculateItemSubtotal,
  calculateOrderTotal,
  processOrderItems,
  generateOrderNumber,
  MenuItemInput,
} from '../src/services/order.service';
import {
  applyPromoCode,
  calculateTakeawayFee,
  validatePromoCodeFormat,
} from '../src/services/promotion.service';

console.log('🧪 [Modul 1/6] Menjalankan 40 Unit Tests: Pemesanan, Kalkulasi & Promo (UT-001 s/d UT-040)...');

// 1 - 10: Kalkulasi Dasar & Subtotal
runTest('calculateItemSubtotal mengembalikan subtotal yang benar untuk 1 item', () => {
  assert.equal(calculateItemSubtotal(15000, 1), 15000);
});
runTest('calculateItemSubtotal mengembalikan subtotal untuk kuantitas jamak (3 porsi)', () => {
  assert.equal(calculateItemSubtotal(15000, 3), 45000);
});
runTest('calculateItemSubtotal mengembalikan subtotal untuk menu murah (Rp 1.000)', () => {
  assert.equal(calculateItemSubtotal(1000, 5), 5000);
});
runTest('calculateItemSubtotal menolak kuantitas 0 dengan pesan error valid', () => {
  assert.throws(() => calculateItemSubtotal(15000, 0), /lebih dari nol/);
});
runTest('calculateItemSubtotal menolak kuantitas negatif (-1)', () => {
  assert.throws(() => calculateItemSubtotal(15000, -1), /lebih dari nol/);
});
runTest('calculateItemSubtotal menolak kuantitas desimal (2.5 porsi)', () => {
  assert.throws(() => calculateItemSubtotal(15000, 2.5), /bilangan bulat/);
});
runTest('calculateItemSubtotal menolak harga negatif (-10000)', () => {
  assert.throws(() => calculateItemSubtotal(-10000, 1), /tidak boleh negatif/);
});
runTest('calculateItemSubtotal menerima harga 0 (promo gratis)', () => {
  assert.equal(calculateItemSubtotal(0, 2), 0);
});
runTest('calculateOrderTotal menjumlahkan array beberapa item secara presisi', () => {
  const items = [
    { menuId: 1, name: 'Nasi', quantity: 2, priceAtOrder: 5000, subtotal: 10000 },
    { menuId: 2, name: 'Ayam', quantity: 1, priceAtOrder: 15000, subtotal: 15000 },
  ];
  assert.equal(calculateOrderTotal(items), 25000);
});
runTest('calculateOrderTotal menolak array item kosong', () => {
  assert.throws(() => calculateOrderTotal([]), /tidak boleh kosong/);
});

// 11 - 20: Pemrosesan Order Items & Format Nomor Order
runTest('processOrderItems memproses 1 item valid dengan subtotal presisi', () => {
  const raw: MenuItemInput[] = [{ menuId: 1, name: 'Mie', price: 12000, quantity: 1, isAvailable: true }];
  const res = processOrderItems(raw);
  assert.equal(res.totalAmount, 12000);
  assert.equal(res.items.length, 1);
});
runTest('processOrderItems memproses beberapa item campuran dengan total benar', () => {
  const raw: MenuItemInput[] = [
    { menuId: 1, name: 'Mie', price: 12000, quantity: 2, isAvailable: true },
    { menuId: 2, name: 'Es Teh', price: 4000, quantity: 3, isAvailable: true },
  ];
  const res = processOrderItems(raw);
  assert.equal(res.totalAmount, 36000);
});
runTest('processOrderItems menolak menu yang statusnya tidak tersedia (isAvailable: false)', () => {
  const raw: MenuItemInput[] = [{ menuId: 1, name: 'Ayam Habis', price: 18000, quantity: 1, isAvailable: false }];
  assert.throws(() => processOrderItems(raw), /sedang tidak tersedia/);
});
runTest('processOrderItems menyimpan catatan khusus pesanan mahasiswa', () => {
  const raw: MenuItemInput[] = [
    { menuId: 1, name: 'Bakso', price: 15000, quantity: 1, isAvailable: true, notes: 'Jangan pakai tauge' },
  ];
  const res = processOrderItems(raw);
  assert.equal(res.items[0].notes, 'Jangan pakai tauge');
});
runTest('processOrderItems mengabaikan catatan yang hanya berupa whitespace kosong', () => {
  const raw: MenuItemInput[] = [
    { menuId: 1, name: 'Bakso', price: 15000, quantity: 1, isAvailable: true, notes: '   ' },
  ];
  const res = processOrderItems(raw);
  assert.equal(res.items[0].notes, undefined);
});
runTest('generateOrderNumber menghasilkan format prefix ORD-YYYYMMDD', () => {
  const num = generateOrderNumber(new Date(2026, 10, 25), 1234);
  assert.equal(num, 'ORD-20261125-1234');
});
runTest('generateOrderNumber memformat bulan 1 digit menjadi 2 digit (leading zero)', () => {
  const num = generateOrderNumber(new Date(2026, 4, 9), 5555);
  assert.equal(num, 'ORD-20260509-5555');
});
runTest('generateOrderNumber menghasilkan suffix random jika tidak dispesifikasikan', () => {
  const num = generateOrderNumber();
  assert.match(num, /^ORD-\d{8}-\d{4}$/);
});
runTest('processOrderItems menolak jika input pesanan bukan array valid', () => {
  assert.throws(() => processOrderItems(null as any), /minimal 1 item/);
});
runTest('processOrderItems menolak jika kuantitas item adalah 0', () => {
  const raw: MenuItemInput[] = [{ menuId: 1, name: 'Nasi', price: 5000, quantity: 0, isAvailable: true }];
  assert.throws(() => processOrderItems(raw), /lebih dari nol/);
});

// 21 - 30: Fitur Diskon & Voucher Promo Mahasiswa (P11)
runTest('applyPromoCode tanpa kode voucher mengembalikan nilai utuh tanpa diskon', () => {
  const res = applyPromoCode(50000, '');
  assert.equal(res.discountAmount, 0);
  assert.equal(res.finalAmount, 50000);
});
runTest('applyPromoCode dengan voucher persentase MABA2026 (20%) menghitung diskon benar', () => {
  const res = applyPromoCode(30000, 'MABA2026');
  assert.equal(res.discountAmount, 6000); // 20% dari 30.000 = 6.000
  assert.equal(res.finalAmount, 24000);
});
runTest('applyPromoCode menerapkan batas diskon maksimal (cap) untuk MABA2026 (max Rp 10.000)', () => {
  const res = applyPromoCode(100000, 'MABA2026');
  assert.equal(res.discountAmount, 10000); // 20% dari 100.000 = 20.000, dicap ke 10.000
  assert.equal(res.finalAmount, 90000);
});
runTest('applyPromoCode menolak MABA2026 jika belanja kurang dari minimum Rp 20.000', () => {
  assert.throws(() => applyPromoCode(15000, 'MABA2026'), /Minimal belanja/);
});
runTest('applyPromoCode dengan voucher flat HEMAT5K memotong tepat Rp 5.000', () => {
  const res = applyPromoCode(40000, 'HEMAT5K');
  assert.equal(res.discountAmount, 5000);
  assert.equal(res.finalAmount, 35000);
});
runTest('applyPromoCode menolak HEMAT5K jika belanja di bawah Rp 25.000', () => {
  assert.throws(() => applyPromoCode(20000, 'HEMAT5K'), /Minimal belanja/);
});
runTest('applyPromoCode mendukung penulisan kode promo huruf kecil secara case-insensitive', () => {
  const res = applyPromoCode(30000, 'maba2026');
  assert.equal(res.discountAmount, 6000);
});
runTest('applyPromoCode menolak kode voucher yang tidak terdaftar', () => {
  assert.throws(() => applyPromoCode(50000, 'KODEPALSU'), /tidak ditemukan/);
});
runTest('applyPromoCode menolak voucher yang sudah expired atau tidak aktif', () => {
  assert.throws(() => applyPromoCode(50000, 'EXPIREDPROMO'), /tidak aktif atau kedaluwarsa/);
});
runTest('applyPromoCode dengan KANTINBERKAH (50% max 15.000) pada order Rp 40.000 menghasilkan diskon Rp 15.000', () => {
  const res = applyPromoCode(40000, 'KANTINBERKAH');
  assert.equal(res.discountAmount, 15000);
  assert.equal(res.finalAmount, 25000);
});

// 31 - 40: Takeaway Packaging Fee & Edge Cases
runTest('calculateTakeawayFee bernilai 0 jika pesanan adalah Dine-In (makan di tempat)', () => {
  assert.equal(calculateTakeawayFee(false, 3), 0);
});
runTest('calculateTakeawayFee menghitung Rp 1.000 per kemasan untuk Takeaway (bungkus)', () => {
  assert.equal(calculateTakeawayFee(true, 4), 4000);
});
runTest('calculateTakeawayFee untuk 1 item bernilai tepat Rp 1.000', () => {
  assert.equal(calculateTakeawayFee(true, 1), 1000);
});
runTest('calculateTakeawayFee menolak kuantitas item 0 pada takeaway', () => {
  assert.throws(() => calculateTakeawayFee(true, 0), /tidak valid/);
});
runTest('calculateTakeawayFee menolak kuantitas negatif pada takeaway', () => {
  assert.throws(() => calculateTakeawayFee(true, -2), /tidak valid/);
});
runTest('validatePromoCodeFormat menerima format kode alfabet dan angka 4-15 karakter', () => {
  assert.equal(validatePromoCodeFormat('MABA2026'), true);
  assert.equal(validatePromoCodeFormat('HEMAT5K'), true);
});
runTest('validatePromoCodeFormat menolak kode kurang dari 4 karakter', () => {
  assert.equal(validatePromoCodeFormat('ABC'), false);
});
runTest('validatePromoCodeFormat menolak kode yang mengandung karakter spesial ilegal', () => {
  assert.equal(validatePromoCodeFormat('DISKON!@#'), false);
});
runTest('applyPromoCode menolak total belanja negatif', () => {
  assert.throws(() => applyPromoCode(-5000, 'MABA2026'), /tidak boleh bernilai negatif/);
});
runTest('applyPromoCode memastikan finalAmount tidak pernah lebih kecil dari 0', () => {
  const res = applyPromoCode(30000, 'HEMAT5K');
  assert.ok(res.finalAmount >= 0);
});

printTestSummary('Modul 1: Pemesanan & Promo (40 UT)');
