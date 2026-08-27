const Firebird = require('node-firebird');

const config = {
  host: 'ctsystem.mn',
  port: 3050,
  database: 'CT$FS4',
  user: process.env.FB_USER || 'SYSDBA',
  password: process.env.FB_PASSWORD || 'masterkey',
};

Firebird.attach(config, (err, db) => {
  if (err) {
    console.error('CONNECT_FAIL:', err.message);
    process.exit(1);
  }
  db.query('SELECT 1 as ok FROM RDB$DATABASE', [], (e, rows) => {
    if (e) {
      console.error('QUERY_FAIL:', e.message);
      process.exit(1);
    }
    console.log('CONNECT_OK', rows);
    db.detach();
  });
});
