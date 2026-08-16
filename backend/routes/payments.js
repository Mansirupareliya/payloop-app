const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── Helper: convert DB row → app format ────────────────────────────────────
function rowToPayment(row) {
  return {
    id: row.id,
    billId: row.bill_id,
    billName: row.bill_name,
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    paidDate: row.paid_date,
    paymentMethod: row.payment_method,
    transactionId: row.transaction_id ?? undefined,
    notes: row.notes ?? undefined,
  };
}

// ─── GET /api/payments ───────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM payments ORDER BY paid_date DESC'
    );
    res.json(result.rows.map(rowToPayment));
  } catch (err) {
    console.error('GET /payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

module.exports = router;
