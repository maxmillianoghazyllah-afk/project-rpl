const { spawnSync } = require('child_process');
const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

const env = { ...process.env, SIMULATE_FAILURE: 'true' };
const res = spawnSync(npmCmd, ['--prefix', 'backend', 'test'], {
  stdio: 'inherit',
  shell: true,
  env,
});

process.exit(res.status || 0);
