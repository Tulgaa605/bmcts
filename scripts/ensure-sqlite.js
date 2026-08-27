const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

try {
  const pkgPath = require.resolve('better-sqlite3/package.json');
  const dir = path.dirname(pkgPath);
  const databaseJs = path.join(dir, 'lib', 'database.js');
  const binding = path.join(dir, 'build', 'Release', 'better_sqlite3.node');

  if (!fs.existsSync(databaseJs)) {
    console.warn('better-sqlite3: lib/database.js алга — дахин суулгаж байна...');
    const root = process.cwd();
    execSync('pnpm install better-sqlite3 --force', { cwd: root, stdio: 'inherit' });
  }

  if (!fs.existsSync(binding)) {
    console.log('better-sqlite3: prebuilt binary татаж байна...');
    execSync('npx prebuild-install', { cwd: dir, stdio: 'inherit' });
  }

  if (!fs.existsSync(path.join(dir, 'lib', 'database.js'))) {
    throw new Error('better-sqlite3 суулгалт амжилтгүй — lib/database.js олдсонгүй');
  }
} catch (err) {
  console.warn('better-sqlite3 setup skipped:', err instanceof Error ? err.message : err);
}
