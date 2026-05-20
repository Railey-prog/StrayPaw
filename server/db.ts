import { Pool } from 'pg';

const dbUrl = process.env.SUPABASE_DB_URL || '';

if (!dbUrl) {
  console.error('ERROR: SUPABASE_DB_URL is not set.');
}

const isLocal = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1') || dbUrl.includes('helium');
const hasSslMode = dbUrl.includes('sslmode=');

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isLocal
    ? false
    : hasSslMode
    ? undefined
    : { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

export default pool;
