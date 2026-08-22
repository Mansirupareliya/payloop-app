/**
 * Migration: add user_id to bills and payments tables.
 * Run once: node migrate_user_id.js
 */
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
});

const sql = `
  ALTER TABLE bills
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

  ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

  CREATE INDEX IF NOT EXISTS bills_user_id_idx    ON bills(user_id);
  CREATE INDEX IF NOT EXISTS payments_user_id_idx ON payments(user_id);
`;

async function migrate() {
  try {
    console.log('Running migration: adding user_id to bills and payments...');
    await pool.query(sql);
    console.log('Done. Existing rows without user_id will not appear for any user.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
