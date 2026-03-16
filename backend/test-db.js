const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgres://3988d0af52690a00160f7d1705eef38e0455f16434120293e81a2c726aafc183:sk_WsMEeffKLEG3VC83vFV8n@db.prisma.io:5432/postgres?sslmode=require',
});
pool.query('SELECT 1 as result', (err, res) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Success:', res.rows[0].result);
  }
  pool.end();
});
