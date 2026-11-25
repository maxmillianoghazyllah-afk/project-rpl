import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import {
  validateMenuData,
  determineMenuDeletionStrategy,
  filterMenuList,
  registerCategory,
  unregisterCategory,
  getRegisteredCategories,
  resetCategoriesToDefault,
} from '../src/services/menu.service';

console.log('🧪 [Modul 4/6] Menjalankan 30 Unit Tests: Manajemen Menu, Kategori & Stok (UT-111 s/d UT-140)...');

const sampleMenus = [
  { name: 'Nasi Goreng Spesial', category: 'Makanan', description: 'Nasi goreng harum', price: 15000, isAvailable: true },
  { name: 'Mie Goreng Seafood', category: 'Makanan', description: 'Mie gurih udang', price: 18000, isAvailable: false },
  { name: 'Es Teh Manis', category: 'Minuman', description: 'Teh melati dingin', price: 4000, isAvailable: true },
  { name: 'Kopi Susu Gula Aren', category: 'Minuman', description: 'Espresso robusta', price: 10000, isAvailable: true },
  { name: 'Pisang Goreng Madu', category: 'Camilan', description: 'Camilan krispi', price: 8000, isAvailable: true },
  { name: 'Tahu Walik Pedas', category: 'Camilan', description: 'Tahu isi ayam', price: 7000, isAvailable: false },
];

// 111 - 120: Validasi Input Menu
runTest('validateMenuData memvalidasi nama menu dan harga wajar', () => {
  const res = validateMenuData({ name: 'Ayam Bakar', price: 20000, category: 'Makanan' });
  assert.equal(res.valid, true);
  assert.equal(res.normalizedCategory, 'Makanan');
});
runTest('validateMenuData memangkas spasi berlebih pada nama menu', () => {
  const res = validateMenuData({ name: '  Ayam Krispi  ', price: 15000 });
  assert.equal(res.valid, true);
});
runTest('validateMenuData default kategori ke Makanan jika tidak diisi', () => {
  const res = validateMenuData({ name: 'Soto Ayam', price: 13000 });
  assert.equal(res.normalizedCategory, 'Makanan');
});
runTest('validateMenuData menolak nama menu berupa string kosong', () => {
  assert.throws(() => validateMenuData({ name: '', price: 10000 }), /tidak boleh kosong/);
});
runTest('validateMenuData menolak nama menu yang hanya berupa spasi', () => {
  assert.throws(() => validateMenuData({ name: '    ', price: 10000 }), /tidak boleh kosong/);
});
runTest('validateMenuData menolak harga 0 pada menu berbayar', () => {
  assert.throws(() => validateMenuData({ name: 'Es Cincau', price: 0 }), /lebih besar dari 0/);
});
runTest('validateMenuData menolak harga negatif', () => {
  assert.throws(() => validateMenuData({ name: 'Es Cincau', price: -5000 }), /lebih besar dari 0/);
});
runTest('validateMenuData menolak kategori tidak dikenal (e.g. Elektronik)', () => {
  assert.throws(() => validateMenuData({ name: 'Item', price: 5000, category: 'Elektronik' }), /tidak valid/);
});
runTest('determineMenuDeletionStrategy mengembalikan DEACTIVATE jika menu sudah punya riwayat pesanan (5 kali)', () => {
  assert.equal(determineMenuDeletionStrategy(5), 'DEACTIVATE');
});
runTest('determineMenuDeletionStrategy mengembalikan HARD_DELETE jika menu belum pernah dipesan (0 kali)', () => {
  assert.equal(determineMenuDeletionStrategy(0), 'HARD_DELETE');
});

// 121 - 130: Filter Kategori & Pencarian
runTest('filterMenuList menyaring kategori Makanan dengan tepat', () => {
  const res = filterMenuList(sampleMenus, 'Makanan');
  assert.equal(res.length, 2);
  assert.ok(res.every((m) => m.category === 'Makanan'));
});
runTest('filterMenuList menyaring kategori Minuman dengan tepat', () => {
  const res = filterMenuList(sampleMenus, 'Minuman');
  assert.equal(res.length, 2);
  assert.ok(res.every((m) => m.category === 'Minuman'));
});
runTest('filterMenuList menyaring kategori Camilan dengan tepat', () => {
  const res = filterMenuList(sampleMenus, 'Camilan');
  assert.equal(res.length, 2);
  assert.ok(res.every((m) => m.category === 'Camilan'));
});
runTest('filterMenuList kategori Semua mengembalikan seluruh menu', () => {
  const res = filterMenuList(sampleMenus, 'Semua');
  assert.equal(res.length, 6);
});
runTest('filterMenuList menyaring kategori Lainnya untuk kategori selain Makanan & Minuman', () => {
  const res = filterMenuList(sampleMenus, 'Lainnya');
  assert.equal(res.length, 2);
  assert.ok(res.every((m) => m.category === 'Camilan'));
});
runTest('filterMenuList dengan query pencarian "Goreng" menemukan menu yang cocok', () => {
  const res = filterMenuList(sampleMenus, 'Semua', 'Goreng');
  assert.equal(res.length, 3); // Nasi Goreng, Mie Goreng, Pisang Goreng
});
runTest('filterMenuList pencarian bersifat case-insensitive ("teh" cocok dengan "Es Teh Manis")', () => {
  const res = filterMenuList(sampleMenus, 'Semua', 'teh');
  assert.equal(res.length, 1);
  assert.equal(res[0].name, 'Es Teh Manis');
});
runTest('filterMenuList pencarian cocok dengan deskripsi menu ("robusta")', () => {
  const res = filterMenuList(sampleMenus, 'Semua', 'robusta');
  assert.equal(res.length, 1);
  assert.equal(res[0].name, 'Kopi Susu Gula Aren');
});
runTest('filterMenuList dengan pencarian tidak cocok mengembalikan array kosong', () => {
  const res = filterMenuList(sampleMenus, 'Semua', 'PizzaItalia123');
  assert.equal(res.length, 0);
});
runTest('filterMenuList mengabaikan spasi pada query pencarian', () => {
  const res = filterMenuList(sampleMenus, 'Semua', '   ');
  assert.equal(res.length, 6);
});

// 131 - 140: Manajemen Kategori Dinamis Penjual
runTest('resetCategoriesToDefault mengembalikan kategori default (Makanan, Minuman, Camilan)', () => {
  resetCategoriesToDefault();
  const cats = getRegisteredCategories();
  assert.ok(cats.includes('Makanan'));
  assert.ok(cats.includes('Minuman'));
  assert.ok(cats.includes('Camilan'));
});
runTest('registerCategory menambah kategori baru berhasil', () => {
  const cats = registerCategory('Dessert');
  assert.ok(cats.includes('Dessert'));
});
runTest('registerCategory menolak nama kategori kosong', () => {
  assert.throws(() => registerCategory(''), /tidak boleh kosong/);
});
runTest('registerCategory menolak duplikasi kategori yang sudah ada', () => {
  assert.throws(() => registerCategory('Makanan'), /sudah terdaftar/);
});
runTest('validateMenuData menerima kategori baru yang baru didaftarkan', () => {
  const res = validateMenuData({ name: 'Es Krim Vanila', price: 8000, category: 'Dessert' });
  assert.equal(res.normalizedCategory, 'Dessert');
});
runTest('unregisterCategory menghapus kategori kustom yang sudah terdaftar', () => {
  const cats = unregisterCategory('Dessert');
  assert.ok(!cats.includes('Dessert'));
});
runTest('unregisterCategory menolak menghapus kategori permanen Makanan', () => {
  assert.throws(() => unregisterCategory('Makanan'), /tidak dapat dihapus/);
});
runTest('unregisterCategory menolak menghapus kategori permanen Minuman', () => {
  assert.throws(() => unregisterCategory('Minuman'), /tidak dapat dihapus/);
});
runTest('unregisterCategory menolak nama kategori yang tidak ditemukan', () => {
  assert.throws(() => unregisterCategory('KategoriPalsu99'), /tidak ditemukan/);
});
runTest('resetCategoriesToDefault menjaga integritas daftar kategori', () => {
  resetCategoriesToDefault();
  assert.equal(getRegisteredCategories().length, 3);
});

printTestSummary('Modul 4: Menu, Kategori & Stok (30 UT)');
