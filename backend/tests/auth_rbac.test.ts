import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import {
  isValidEmailFormat,
  isValidPassword,
  determineUserRole,
  hasSellerPrivilege,
} from '../src/services/auth.service';

console.log('🧪 [Modul 5/6] Menjalankan 30 Unit Tests: Autentikasi & Hak Akses RBAC (UT-141 s/d UT-170)...');

// 141 - 150: Validasi Format Email
runTest('isValidEmailFormat menerima email kampus standar (mahasiswa@kampus.ac.id)', () => {
  assert.equal(isValidEmailFormat('mahasiswa@kampus.ac.id'), true);
});
runTest('isValidEmailFormat menerima email umum (kantin@gmail.com)', () => {
  assert.equal(isValidEmailFormat('kantin@gmail.com'), true);
});
runTest('isValidEmailFormat menerima email dengan titik pada username (budi.santoso@univ.ac.id)', () => {
  assert.equal(isValidEmailFormat('budi.santoso@univ.ac.id'), true);
});
runTest('isValidEmailFormat menerima email dengan plus addressing (mhs+kantin@kampus.id)', () => {
  assert.equal(isValidEmailFormat('mhs+kantin@kampus.id'), true);
});
runTest('isValidEmailFormat menolak string polos tanpa simbol at (invalid-email)', () => {
  assert.equal(isValidEmailFormat('invalid-email'), false);
});
runTest('isValidEmailFormat menolak email tanpa domain (budi@)', () => {
  assert.equal(isValidEmailFormat('budi@'), false);
});
runTest('isValidEmailFormat menolak email tanpa username (@kampus.ac.id)', () => {
  assert.equal(isValidEmailFormat('@kampus.ac.id'), false);
});
runTest('isValidEmailFormat menolak email dengan spasi di tengah (budi @kampus.ac.id)', () => {
  assert.equal(isValidEmailFormat('budi @kampus.ac.id'), false);
});
runTest('isValidEmailFormat menolak email kosong string', () => {
  assert.equal(isValidEmailFormat(''), false);
});
runTest('isValidEmailFormat menolak input bukan string', () => {
  assert.equal(isValidEmailFormat(null as any), false);
});

// 151 - 160: Validasi Kekuatan Password
runTest('isValidPassword menerima password alfanumerik aman (password123)', () => {
  assert.equal(isValidPassword('password123'), true);
});
runTest('isValidPassword menerima password tepat panjang 6 karakter (123456)', () => {
  assert.equal(isValidPassword('123456'), true);
});
runTest('isValidPassword menerima password panjang kompleks dengan simbol', () => {
  assert.equal(isValidPassword('Kantin#Berkah_2026!'), true);
});
runTest('isValidPassword menolak password kurang dari 6 karakter (12345)', () => {
  assert.equal(isValidPassword('12345'), false);
});
runTest('isValidPassword menolak password 1 karakter', () => {
  assert.equal(isValidPassword('a'), false);
});
runTest('isValidPassword menolak password kosong string', () => {
  assert.equal(isValidPassword(''), false);
});
runTest('isValidPassword menolak password yang hanya berupa spasi', () => {
  assert.equal(isValidPassword('      '), false);
});
runTest('isValidPassword menolak input null atau undefined', () => {
  assert.equal(isValidPassword(undefined as any), false);
});
runTest('isValidPassword menolak input bertipe angka murni', () => {
  assert.equal(isValidPassword(123456 as any), false);
});
runTest('isValidPassword menerima password 64 karakter (boundary test)', () => {
  const longPass = 'A'.repeat(64);
  assert.equal(isValidPassword(longPass), true);
});

// 161 - 170: Role RBAC & Privilege Authorization
runTest('determineUserRole default ke CUSTOMER jika tanpa parameter', () => {
  assert.equal(determineUserRole(), 'CUSTOMER');
});
runTest('determineUserRole default ke CUSTOMER jika parameter string kosong', () => {
  assert.equal(determineUserRole(''), 'CUSTOMER');
});
runTest('determineUserRole menerima input eksplisit customer huruf kecil', () => {
  assert.equal(determineUserRole('customer'), 'CUSTOMER');
});
runTest('determineUserRole menerima input eksplisit CUSTOMER huruf besar', () => {
  assert.equal(determineUserRole('CUSTOMER'), 'CUSTOMER');
});
runTest('determineUserRole menerima input SELLER huruf besar', () => {
  assert.equal(determineUserRole('SELLER'), 'SELLER');
});
runTest('determineUserRole menerima input seller huruf kecil (case-insensitive)', () => {
  assert.equal(determineUserRole('seller'), 'SELLER');
});
runTest('determineUserRole mengembalikan CUSTOMER jika role tidak dikenal (e.g. SUPERADMIN)', () => {
  assert.equal(determineUserRole('SUPERADMIN'), 'CUSTOMER');
});
runTest('hasSellerPrivilege mengizinkan role SELLER', () => {
  assert.equal(hasSellerPrivilege('SELLER'), true);
});
runTest('hasSellerPrivilege menolak role CUSTOMER', () => {
  assert.equal(hasSellerPrivilege('CUSTOMER'), false);
});
runTest('hasSellerPrivilege menolak role undefined atau kosong', () => {
  assert.equal(hasSellerPrivilege(undefined), false);
  assert.equal(hasSellerPrivilege(''), false);
});

printTestSummary('Modul 5: Autentikasi & RBAC (30 UT)');
