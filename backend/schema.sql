-- PayLoop Database Schema
-- Run this once after creating your Neon/PostgreSQL database.
-- In Neon: go to "SQL Editor" and paste + run this entire file.
-- ─────────────────────────────────────────────────────────────────────────────

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  phone           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bills Table
CREATE TABLE IF NOT EXISTS bills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category_id     TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  due_date        TIMESTAMPTZ NOT NULL,
  frequency       TEXT NOT NULL DEFAULT 'Monthly',
  auto_repeat     BOOLEAN NOT NULL DEFAULT false,
  reminders       TEXT[] NOT NULL DEFAULT '{}',
  payment_method  TEXT,
  notes           TEXT,
  is_paid         BOOLEAN NOT NULL DEFAULT false,
  paid_date       TIMESTAMPTZ,
  transaction_id  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments Table (history records)
CREATE TABLE IF NOT EXISTS payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id         UUID REFERENCES bills(id) ON DELETE CASCADE,
  bill_name       TEXT NOT NULL,
  category_id     TEXT NOT NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  paid_date       TIMESTAMPTZ NOT NULL,
  payment_method  TEXT NOT NULL,
  transaction_id  TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on bills
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bills_updated_at
  BEFORE UPDATE ON bills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
