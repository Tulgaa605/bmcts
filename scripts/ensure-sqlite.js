const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

try {
  const pkgPath = require.resolve('better-sqlite3/package.json');
  const dir = path.dirname(pkgPath);
  const binding = path.join(dir, 'build', 'Release', 'better_sqlite3.node');

  if (!fs.existsSync(binding)) {
    console.log('better-sqlite3: prebuilt binary татаж байна...');
    execSync('npx prebuild-install', { cwd: dir, stdio: 'inherit' });
  }
} catch (err) {
  console.warn('better-sqlite3 setup skipped:', err instanceof Error ? err.message : err);
}
