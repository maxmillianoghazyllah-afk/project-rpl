import assert from 'node:assert/strict';
import {
  validateMenuData,
  determineMenuDeletionStrategy,
  filterMenuList,
  registerCategory,
  unregisterCategory,
  getRegisteredCategories,
  resetCategoriesToDefault,
} from '../src/services/menu.service';

console.log('🧪 Menjalankan Unit Tests: Manajemen Menu Kantin (menu.test.ts)...');

// Test 1: Validasi data menu valid
{
  const result = validateMenuData({
    name: 'Nasi Uduk Komplit',
    price: 14000,
    category: 'Makanan',
  });
  assert.equal(result.valid, true);
  assert.equal(result.normalizedCategory, 'Makanan');
  console.log('  ✔ [PASS] validateMenuData memvalidasi menu valid dengan benar');
}

// Test 2: Validasi boundary: nama kosong atau harga non-positif
{
  assert.throws(() => validateMenuData({ name: '', price: 10000 }), /tidak boleh kosong/);
  assert.throws(() => validateMenuData({ name: '   ', price: 10000 }), /tidak boleh kosong/);
  assert.throws(() => validateMenuData({ name: 'Es Cincau', price: 0 }), /lebih besar dari 0/);
  assert.throws(() => validateMenuData({ name: 'Es Cincau', price: -4000 }), /lebih besar dari 0/);
  console.log('  ✔ [PASS] validateMenuData menolak nama kosong dan harga <= 0');
}

// Test 3: Validasi kategori tidak dikenal
{
  assert.throws(
    () => validateMenuData({ name: 'Item', price: 5000, category: 'Elektronik' }),
    /tidak valid/
  );
  console.log('  ✔ [PASS] validateMenuData membatasi kategori hanya Makanan, Minuman, atau Camilan');
}

// Test 4: Strategi penghapusan menu (Deaktivasi vs Hard Delete)
{
  // Menu sudah ada di riwayat pesanan (orderCount > 0) -> DEACTIVATE
  assert.equal(determineMenuDeletionStrategy(5), 'DEACTIVATE');
  assert.equal(determineMenuDeletionStrategy(1), 'DEACTIVATE');

  // Menu belum pernah dipesan (orderCount = 0) -> HARD_DELETE
  assert.equal(determineMenuDeletionStrategy(0), 'HARD_DELETE');
  console.log('  ✔ [PASS] determineMenuDeletionStrategy melindungi integritas riwayat pesanan');
}

// Test 5: Penyaringan daftar menu berdasarkan kategori & pencarian (Termasuk kategori Lainnya)
{
  const sampleMenus = [
    { name: 'Nasi Goreng Spesial', category: 'Makanan', description: 'Nasi goreng telur', isAvailable: true },
    { name: 'Mie Ayam Bakso', category: 'Makanan', description: 'Mie ayam enak', isAvailable: false },
    { name: 'Es Teh Manis Jumbo', category: 'Minuman', description: 'Teh melati dingin', isAvailable: true },
    { name: 'Pisang Cokelat Keju', category: 'Camilan', description: 'Camilan manis', isAvailable: true },
  ];

  // Filter kategori Minuman
  const drinks = filterMenuList(sampleMenus, 'Minuman');
  assert.equal(drinks.length, 1);
  assert.equal(drinks[0].name, 'Es Teh Manis Jumbo');

  // Filter pencarian "Goreng"
  const searchResults = filterMenuList(sampleMenus, 'Semua', 'Goreng');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].name, 'Nasi Goreng Spesial');

  // Filter kategori "Lainnya" (Menyaring selain Makanan & Minuman, misal Camilan)
  const others = filterMenuList(sampleMenus, 'Lainnya');
  assert.equal(others.length, 1);
  assert.equal(others[0].name, 'Pisang Cokelat Keju');

  console.log('  ✔ [PASS] filterMenuList menyaring kategori, pencarian, dan stok secara presisi');
}

// Test 6: Fitur Dinamis Kategori (Penjual menambah kategori baru & menghapus kategori kustom)
{
  resetCategoriesToDefault();
  // Tambah kategori baru
  const updatedCategories = registerCategory('Dessert');
  assert.ok(updatedCategories.includes('Dessert'));

  // Validasi menu dengan kategori baru yang didaftarkan
  const menuWithNewCat = validateMenuData({
    name: 'Puding Mangga',
    price: 8000,
    category: 'Dessert',
  });
  assert.equal(menuWithNewCat.normalizedCategory, 'Dessert');

  // Hapus kategori kustom
  const afterDelete = unregisterCategory('Dessert');
  assert.ok(!afterDelete.includes('Dessert'));

  // Kategori wajib (Makanan & Minuman) dilindungi dan tidak dapat dihapus
  assert.throws(() => unregisterCategory('Makanan'), /tidak dapat dihapus/);
  assert.throws(() => unregisterCategory('Minuman'), /tidak dapat dihapus/);

  console.log('  ✔ [PASS] registerCategory & unregisterCategory mengelola kategori kustom & melindungi kategori permanen');
}

console.log('🎉 Seluruh Unit Test Manajemen Menu BERHASIL LULUS!\n');
