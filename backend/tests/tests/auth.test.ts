import assert from 'node:assert/strict';
import {
  isValidEmailFormat,
  isValidPassword,
  determineUserRole,
  hasSellerPrivilege,
} from '../src/services/auth.service';

console.log('🧪 Menjalankan Unit Tests: Autentikasi & Hak Akses Pengguna (auth.test.ts)...');

// Test 1: Validasi format email pengguna
{
  assert.equal(isValidEmailFormat('mahasiswa@kampus.ac.id'), true);
  assert.equal(isValidEmailFormat('kantin@gmail.com'), true);
  assert.equal(isValidEmailFormat('budi.santoso@itb.ac.id'), true);
  assert.equal(isValidEmailFormat('invalid-email'), false);
  assert.equal(isValidEmailFormat('budi@'), false);
  assert.equal(isValidEmailFormat('@kampus.ac.id'), false);
  console.log('  ✔ [PASS] isValidEmailFormat memverifikasi struktur format email secara valid');
}

// Test 2: Validasi kekuatan password
{
  assert.equal(isValidPassword('password123'), true);
  assert.equal(isValidPassword('123456'), true, 'Panjang 6 karakter sah');
  assert.equal(isValidPassword('12345'), false, 'Kurang dari 6 karakter harus ditolak');
  assert.equal(isValidPassword(''), false, 'Password kosong harus ditolak');
  console.log('  ✔ [PASS] isValidPassword menerapkan syarat minimal 6 karakter');
}

// Test 3: Penentuan role pengguna (Default vs Eksplisit)
{
  assert.equal(determineUserRole(), 'CUSTOMER', 'Default tanpa input harus CUSTOMER');
  assert.equal(determineUserRole(''), 'CUSTOMER');
  assert.equal(determineUserRole('customer'), 'CUSTOMER');
  assert.equal(determineUserRole('SELLER'), 'SELLER');
  assert.equal(determineUserRole('seller'), 'SELLER', 'Harus case-insensitive');
  assert.equal(determineUserRole('ADMIN'), 'CUSTOMER', 'Role selain SELLER fallback ke CUSTOMER');
  console.log('  ✔ [PASS] determineUserRole menetapkan role CUSTOMER secara aman sebagai default');
}

// Test 4: Otorisasi hak akses penjual kantin
{
  assert.equal(hasSellerPrivilege('SELLER'), true);
  assert.equal(hasSellerPrivilege('seller'), true);
  assert.equal(hasSellerPrivilege('CUSTOMER'), false);
  assert.equal(hasSellerPrivilege(undefined), false);
  console.log('  ✔ [PASS] hasSellerPrivilege membatasi akses khusus penjual kantin');
}

console.log('🎉 Seluruh Unit Test Autentikasi & Hak Akses BERHASIL LULUS!\n');
