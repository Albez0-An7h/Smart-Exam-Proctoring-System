const { Pool } = require('pg');
const fs = require('fs');

const sql = fs.readFileSync(__dirname + '/prisma/migration.sql', 'utf8');
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

async function run() {
  const client = await pool.connect();
  console.log('✅ Connected to database!');
  
  const statements = sql.split(';')
    .map(s => s.trim())
    .filter(s => s.length > 2);
    
  let ok = 0, skipped = 0, errored = 0;
  for (const stmt of statements) {
    try {
      await client.query(stmt + ';');
      console.log('  OK: ' + stmt.slice(0, 60).replace(/\n/g, ' '));
      ok++;
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('  SKIP (exists): ' + stmt.slice(0, 50).replace(/\n/g, ' '));
        skipped++;
      } else {
        console.error('  ERR: ' + e.message);
        errored++;
      }
    }
  }
  
  client.release();
  await pool.end();
  console.log(`\nDone: ${ok} applied, ${skipped} skipped, ${errored} errors`);
}

run().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
