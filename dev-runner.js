const { spawn } = require('child_process');
const path = require('path');

console.log('========================================================');
console.log('   SISTEM ANTREAN KANTIN (KantinQueue) - SINGLE RUNNER  ');
console.log('========================================================\n');

console.log('🚀 Menjalankan Backend & Frontend dalam 1 Terminal...\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

// Jalankan Backend
const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Jalankan Frontend
const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  stdio: 'inherit',
  shell: true
});

// Buka browser setelah 4 detik
setTimeout(() => {
  console.log('\n🌐 Membuka browser: http://localhost:5173 ...');
  if (isWin) {
    spawn('cmd.exe', ['/c', 'start', 'http://localhost:5173'], { stdio: 'ignore' });
  }
}, 4000);

// Hubungkan tunnel ke Port 5000 dengan subdomain tetap
setTimeout(() => {
  console.log('🌍 Menghubungkan Tunnel Online (Subdomain Tetap)...');
  const npxCmd = isWin ? 'npx.cmd' : 'npx';
  const tunnel = spawn(npxCmd, ['localtunnel', '--port', '5000', '--subdomain', 'kantin-queue-kampus'], {
    stdio: 'inherit',
    shell: true
  });

  tunnel.on('close', (code) => {
    console.log(`Tunnel closed with code ${code}`);
  });
}, 6000);

// Cleanup saat Ctrl+C
const cleanup = () => {
  console.log('\n🛑 Menghentikan seluruh proses...');
  try { backend.kill(); } catch (e) {}
  try { frontend.kill(); } catch (e) {}
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
