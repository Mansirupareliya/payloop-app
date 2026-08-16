/**
 * Migration script: Creates the `users` table if it doesn't exist.
 * Run with: node migrate.js
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
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  phone           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function migrate() {
  try {
    console.log('⏳ Running migration: creating users table...');
    await pool.query(sql);
    console.log('✅ users table created (or already exists).');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

migrate();
