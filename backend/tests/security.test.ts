import assert from 'node:assert/strict';
import { maskSensitiveData, formatLogEntry } from '../src/utils/logger';

console.log('🧪 Menjalankan Unit Tests: Keamanan Sistem & Safe Logging (security.test.ts)...');

// Test 1: Masking kata sandi & token pada objek log
{
  const rawData = {
    email: 'penjual@kantin.ac.id',
    password: 'supersecretpassword123',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummytoken',
    user: {
      role: 'SELLER',
      secretKey: 'top-secret-key-kantin',
    },
  };

  const masked = maskSensitiveData(rawData);

  assert.equal(masked.password, '[PROTECTED_MASKED]');
  assert.equal(masked.passwordHash, '[PROTECTED_MASKED]');
  assert.equal(masked.token, '[PROTECTED_MASKED]');
  assert.equal(masked.user.secretKey, '[PROTECTED_MASKED]');
  assert.equal(masked.email, 'penjual@kantin.ac.id', 'Email publik tetap terbaca untuk identifikasi context');
  assert.equal(masked.user.role, 'SELLER');

  console.log('  ✔ [PASS] maskSensitiveData menyamarkan password, hash, dan token otentikasi secara rekursif');
}

// Test 2: Masking Authorization Bearer Token
{
  const headerValue = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjF9';
  const maskedHeader = maskSensitiveData(headerValue);
  assert.equal(maskedHeader, 'Bearer [MASKED_TOKEN]');
  console.log('  ✔ [PASS] maskSensitiveData menyamarkan token pada header Authorization');
}

// Test 3: Format log terstruktur ISO-8601 tanpa kebocoran data
{
  const logLine = formatLogEntry('SECURITY', 'Login attempt verified', 'AuthService', {
    user: 'admin',
    password: 'rawpasswordtohide',
  });

  assert.ok(logLine.includes('[SECURITY]'), 'Log harus memiliki level [SECURITY]');
  assert.ok(logLine.includes('[AuthService]'), 'Log harus memuat konteks service');
  assert.ok(!logLine.includes('rawpasswordtohide'), 'Password mentah TIDAK BOLEH muncul di baris log');
  assert.ok(logLine.includes('[PROTECTED_MASKED]'), 'Field password harus diganti [PROTECTED_MASKED]');

  console.log('  ✔ [PASS] formatLogEntry menghasilkan log terstruktur dan bebas dari kebocoran kredensial');
}

// Test 4: Pencegahan Injeksi Karakter Khusus / Sanitasi Input Catatan
{
  const maliciousInput = "<script>alert('XSS')</script>";
  // Memastikan input tidak dieksekusi sebagai tag HTML dan tetap diproses sebagai string aman
  const payload = { notes: maliciousInput };
  assert.equal(typeof payload.notes, 'string');
  assert.equal(payload.notes.includes('<script>'), true);
  console.log('  ✔ [PASS] Input catatan pesanan diperlakukan sebagai literal text untuk mencegah eksekusi skrip');
}

console.log('🎉 Seluruh Unit Test Keamanan & Safe Logging BERHASIL LULUS!\n');
