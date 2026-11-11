import assert from 'node:assert/strict';
import {
  calculateItemSubtotal,
  calculateOrderTotal,
  processOrderItems,
  generateOrderNumber,
  MenuItemInput,
} from '../src/services/order.service';

console.log('🧪 Menjalankan Unit Tests: Fitur 1 - Pemesanan & Kalkulasi Pesanan...');

// Test 1: Kalkulasi subtotal item normal
{
  const subtotal = calculateItemSubtotal(15000, 2);
  assert.equal(subtotal, 30000, 'Subtotal harus 30000 untuk 2 porsi @ 15000');
  console.log('  ✔ [PASS] calculateItemSubtotal mengembalikan subtotal yang benar');
}

// Test 2: Validasi kuantitas tidak valid (0 atau negatif)
{
  assert.throws(
    () => calculateItemSubtotal(15000, 0),
    /lebih dari nol/,
    'Harus melempar error jika kuantitas bernilai 0'
  );
  assert.throws(
    () => calculateItemSubtotal(15000, -2),
    /lebih dari nol/,
    'Harus melempar error jika kuantitas negatif'
  );
  console.log('  ✔ [PASS] calculateItemSubtotal menolak kuantitas <= 0');
}

// Test 3: Validasi harga negatif
{
  assert.throws(
    () => calculateItemSubtotal(-5000, 1),
    /tidak boleh negatif/,
    'Harus melempar error jika harga negatif'
  );
  console.log('  ✔ [PASS] calculateItemSubtotal menolak harga negatif');
}

// Test 4: Kalkulasi total order dari beberapa item
{
  const items = [
    { menuId: 1, name: 'Nasi Goreng', quantity: 2, priceAtOrder: 15000, subtotal: 30000 },
    { menuId: 2, name: 'Es Teh Manis', quantity: 2, priceAtOrder: 4000, subtotal: 8000 },
  ];
  const total = calculateOrderTotal(items);
  assert.equal(total, 38000, 'Total harus 38000 (30000 + 8000)');
  console.log('  ✔ [PASS] calculateOrderTotal menjumlahkan seluruh subtotal secara presisi');
}

// Test 5: processOrderItems dengan data valid
{
  const rawInput: MenuItemInput[] = [
    { menuId: 1, name: 'Ayam Geprek', price: 18000, quantity: 1, isAvailable: true },
    { menuId: 2, name: 'Kopi Susu', price: 8000, quantity: 2, isAvailable: true },
  ];
  const result = processOrderItems(rawInput);
  assert.equal(result.items.length, 2);
  assert.equal(result.totalAmount, 34000); // 18000 + 16000
  assert.equal(result.items[0].subtotal, 18000);
  assert.equal(result.items[1].subtotal, 16000);
  console.log('  ✔ [PASS] processOrderItems menghasilkan kalkulasi item dan total yang benar');
}

// Test 6: processOrderItems menolak item yang stoknya habis / tidak tersedia
{
  const unavailableInput: MenuItemInput[] = [
    { menuId: 1, name: 'Mie Ayam Bakso', price: 16000, quantity: 1, isAvailable: false },
  ];
  assert.throws(
    () => processOrderItems(unavailableInput),
    /sedang tidak tersedia/,
    'Harus melempar error jika menu habis'
  );
  console.log('  ✔ [PASS] processOrderItems menolak menu yang tidak tersedia (habis)');
}

// Test 7: generateOrderNumber format
{
  const fixedDate = new Date(2026, 9, 8); // Oktober = index 9
  const orderNum = generateOrderNumber(fixedDate, 1234);
  assert.equal(orderNum, 'ORD-20261008-1234');
  assert.match(generateOrderNumber(), /^ORD-\d{8}-\d{4}$/, 'Nomor pesanan harus sesuai pola regex');
  console.log('  ✔ [PASS] generateOrderNumber menghasilkan format ORD-YYYYMMDD-XXXX');
}

console.log('🎉 Seluruh Unit Test Fitur 1 (Order Service) BERHASIL LULUS!\n');
