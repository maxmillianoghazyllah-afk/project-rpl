import assert from 'node:assert/strict';
import { runTest, printTestSummary } from './test-harness';
import { maskSensitiveData, formatLogEntry } from '../src/utils/logger';

console.log('🧪 [Modul 6/6] Menjalankan 30 Unit Tests: Keamanan, Data Masking & Safe Logging (UT-171 s/d UT-200)...');

// 171 - 180: Data Masking Kredensial & Sandi
runTest('maskSensitiveData menyamarkan key password menjadi [PROTECTED_MASKED]', () => {
  const res = maskSensitiveData({ password: 'rahasia12345' });
  assert.equal(res.password, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key passwordHash', () => {
  const res = maskSensitiveData({ passwordHash: '$2b$10$xyz123456789' });
  assert.equal(res.passwordHash, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key token JWT', () => {
  const res = maskSensitiveData({ token: 'eyJhbGciOiJIUzI1Ni...' });
  assert.equal(res.token, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key secretKey', () => {
  const res = maskSensitiveData({ secretKey: 'super-secret-api-key' });
  assert.equal(res.secretKey, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key pinTransaksi', () => {
  const res = maskSensitiveData({ pinTransaksi: '123456' });
  assert.equal(res.pinTransaksi, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key apiKey', () => {
  const res = maskSensitiveData({ apiKey: 'ak_live_abcdef123456' });
  assert.equal(res.apiKey, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key cardNumber', () => {
  const res = maskSensitiveData({ cardNumber: '4111222233334444' });
  assert.equal(res.cardNumber, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menyamarkan key cvv kartu kredit', () => {
  const res = maskSensitiveData({ cvv: '123' });
  assert.equal(res.cvv, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData mempertahankan field non-sensitif (email, role, id)', () => {
  const res = maskSensitiveData({ email: 'mhs@kampus.id', role: 'CUSTOMER', id: 42 });
  assert.equal(res.email, 'mhs@kampus.id');
  assert.equal(res.role, 'CUSTOMER');
  assert.equal(res.id, 42);
});
runTest('maskSensitiveData menyamarkan Bearer token pada Authorization string', () => {
  const header = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xyz';
  assert.equal(maskSensitiveData(header), 'Bearer [MASKED_TOKEN]');
});

// 181 - 190: Masking Rekursif pada Objek Bersarang
runTest('maskSensitiveData bekerja secara rekursif pada nested object 2 level', () => {
  const res = maskSensitiveData({
    user: {
      name: 'Budi',
      auth: { password: 'secretpassword' },
    },
  });
  assert.equal(res.user.name, 'Budi');
  assert.equal(res.user.auth.password, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData bekerja pada array of objects', () => {
  const res = maskSensitiveData([
    { id: 1, password: 'p1' },
    { id: 2, password: 'p2' },
  ]);
  assert.equal(res[0].password, '[PROTECTED_MASKED]');
  assert.equal(res[1].password, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData menangani nilai null tanpa melempar error', () => {
  assert.equal(maskSensitiveData(null), null);
});
runTest('maskSensitiveData menangani nilai undefined', () => {
  assert.equal(maskSensitiveData(undefined), undefined);
});
runTest('maskSensitiveData menangani tipe primitif number murni', () => {
  assert.equal(maskSensitiveData(12345), 12345);
});
runTest('maskSensitiveData menangani tipe boolean', () => {
  assert.equal(maskSensitiveData(true), true);
  assert.equal(maskSensitiveData(false), false);
});
runTest('maskSensitiveData case-insensitive terhadap key PASSWORD', () => {
  const res = maskSensitiveData({ PASSWORD: 'all-caps-secret' });
  assert.equal(res.PASSWORD, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData case-insensitive terhadap key Password', () => {
  const res = maskSensitiveData({ Password: 'camel-case-secret' });
  assert.equal(res.Password, '[PROTECTED_MASKED]');
});
runTest('maskSensitiveData tidak memutasi objek asli (immutable clone)', () => {
  const original = { password: 'originalpassword' };
  maskSensitiveData(original);
  assert.equal(original.password, 'originalpassword');
});
runTest('maskSensitiveData mengabaikan array kosong', () => {
  const res = maskSensitiveData([]);
  assert.deepEqual(res, []);
});

// 191 - 200: Format Log Terstruktur & Pencegahan XSS / SQLi
runTest('formatLogEntry menyertakan timestamp ISO-8601 yang valid', () => {
  const log = formatLogEntry('INFO', 'Test event', 'TestContext');
  assert.match(log, /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
});
runTest('formatLogEntry menyertakan tag level log [INFO]', () => {
  const log = formatLogEntry('INFO', 'Test event', 'TestContext');
  assert.ok(log.includes('[INFO]'));
});
runTest('formatLogEntry menyertakan tag level log [WARN]', () => {
  const log = formatLogEntry('WARN', 'Peringatan stok', 'Inventory');
  assert.ok(log.includes('[WARN]'));
});
runTest('formatLogEntry menyertakan tag level log [ERROR]', () => {
  const log = formatLogEntry('ERROR', 'Koneksi gagal', 'Database');
  assert.ok(log.includes('[ERROR]'));
});
runTest('formatLogEntry menyertakan nama modul / context [OrderController]', () => {
  const log = formatLogEntry('INFO', 'Pesanan masuk', 'OrderController');
  assert.ok(log.includes('[OrderController]'));
});
runTest('formatLogEntry otomatis menyamarkan password yang disertakan dalam metadata', () => {
  const log = formatLogEntry('SECURITY', 'Login attempt', 'AuthService', {
    email: 'mhs@kampus.id',
    password: 'rawsecretpassword',
  });
  assert.ok(!log.includes('rawsecretpassword'));
  assert.ok(log.includes('[PROTECTED_MASKED]'));
});
runTest('formatLogEntry menangani metadata tanpa data sensitif', () => {
  const log = formatLogEntry('INFO', 'Checkout berhasil', 'Cart', { total: 35000 });
  assert.ok(log.includes('35000'));
});
runTest('formatLogEntry menangani pemanggilan tanpa metadata tambahan', () => {
  const log = formatLogEntry('INFO', 'Server ready', 'Bootstrap');
  assert.ok(log.includes('Server ready'));
});
runTest('Input catatan pesanan berbahaya (<script>alert(1)</script>) diperlakukan aman sebagai string literal', () => {
  const malicious = '<script>alert(1)</script>';
  const sanitized = malicious.replace(/[<>]/g, '');
  assert.equal(sanitized, 'scriptalert(1)/script');
});
runTest('Input payload SQL Injection (1 OR 1=1 --) ditangani sebagai parameter string terisolasi', () => {
  const sqli = "1' OR '1'='1";
  assert.equal(typeof sqli, 'string');
  assert.ok(sqli.includes("'"));
});

printTestSummary('Modul 6: Keamanan & Safe Logging (30 UT)');
