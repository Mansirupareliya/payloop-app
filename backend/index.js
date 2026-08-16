require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRouter     = require('./routes/auth');
const billsRouter    = require('./routes/bills');
const paymentsRouter = require('./routes/payments');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Request logger ──────────────────────────────────────────────────────────
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRouter);
app.use('/api/bills',    billsRouter);
app.use('/api/payments', paymentsRouter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 PayLoop API running on http://0.0.0.0:${PORT}`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://10.225.244.143:${PORT}  (for Android device)`);
});
