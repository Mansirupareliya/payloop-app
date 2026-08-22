const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// ─── Helper: convert DB row → app format ────────────────────────────────────
function rowToBill(row) {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    amount: parseFloat(row.amount),
    dueDate: row.due_date,
    frequency: row.frequency,
    autoRepeat: row.auto_repeat,
    reminders: row.reminders ?? [],
    paymentMethod: row.payment_method ?? undefined,
    notes: row.notes ?? undefined,
    isPaid: row.is_paid,
    paidDate: row.paid_date ?? undefined,
    transactionId: row.transaction_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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

// ─── GET /api/bills ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bills WHERE user_id = $1 ORDER BY due_date ASC',
      [req.userId]
    );
    res.json(result.rows.map(rowToBill));
  } catch (err) {
    console.error('GET /bills error:', err);
    res.status(500).json({ error: 'Failed to fetch bills' });
  }
});

// ─── POST /api/bills ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const {
    name, categoryId, amount, dueDate, frequency,
    autoRepeat, reminders, paymentMethod, notes,
  } = req.body;

  if (!name || !categoryId || !amount || !dueDate || !frequency) {
    return res.status(400).json({ error: 'Missing required fields: name, categoryId, amount, dueDate, frequency' });
  }

  try {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO bills
        (id, user_id, name, category_id, amount, due_date, frequency, auto_repeat, reminders, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        id,
        req.userId,
        name,
        categoryId,
        amount,
        dueDate,
        frequency,
        autoRepeat ?? false,
        reminders ?? [],
        paymentMethod ?? null,
        notes ?? null,
      ]
    );
    res.status(201).json(rowToBill(result.rows[0]));
  } catch (err) {
    console.error('POST /bills error:', err);
    res.status(500).json({ error: 'Failed to create bill' });
  }
});

// ─── PUT /api/bills/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, categoryId, amount, dueDate, frequency,
    autoRepeat, reminders, paymentMethod, notes,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE bills SET
        name            = COALESCE($3, name),
        category_id     = COALESCE($4, category_id),
        amount          = COALESCE($5, amount),
        due_date        = COALESCE($6, due_date),
        frequency       = COALESCE($7, frequency),
        auto_repeat     = COALESCE($8, auto_repeat),
        reminders       = COALESCE($9, reminders),
        payment_method  = COALESCE($10, payment_method),
        notes           = COALESCE($11, notes)
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [
        id,
        req.userId,
        name ?? null,
        categoryId ?? null,
        amount ?? null,
        dueDate ?? null,
        frequency ?? null,
        autoRepeat ?? null,
        reminders ?? null,
        paymentMethod ?? null,
        notes ?? null,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json(rowToBill(result.rows[0]));
  } catch (err) {
    console.error('PUT /bills/:id error:', err);
    res.status(500).json({ error: 'Failed to update bill' });
  }
});

// ─── DELETE /api/bills/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM bills WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Bill not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('DELETE /bills/:id error:', err);
    res.status(500).json({ error: 'Failed to delete bill' });
  }
});

// ─── POST /api/bills/:id/pay ─────────────────────────────────────────────────
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paidDate, transactionId, notes } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'paymentMethod is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch the bill (scoped to this user)
    const billResult = await client.query(
      'SELECT * FROM bills WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    if (billResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Bill not found' });
    }
    const bill = billResult.rows[0];
    const resolvedPaidDate = paidDate ?? new Date().toISOString();

    // 2. Mark the bill as paid
    await client.query(
      `UPDATE bills SET is_paid = true, paid_date = $2, transaction_id = $3, notes = COALESCE($4, notes)
       WHERE id = $1`,
      [id, resolvedPaidDate, transactionId ?? null, notes ?? null]
    );

    // 3. Create a payment record (with user_id)
    const paymentId = uuidv4();
    const paymentResult = await client.query(
      `INSERT INTO payments
        (id, user_id, bill_id, bill_name, category_id, amount, paid_date, payment_method, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        paymentId,
        req.userId,
        id,
        bill.name,
        bill.category_id,
        bill.amount,
        resolvedPaidDate,
        paymentMethod,
        transactionId ?? null,
        notes ?? null,
      ]
    );

    await client.query('COMMIT');

    res.json({
      bill: rowToBill({ ...bill, is_paid: true, paid_date: resolvedPaidDate }),
      payment: rowToPayment(paymentResult.rows[0]),
      nextBill: null,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /bills/:id/pay error:', err);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  } finally {
    client.release();
  }
});


module.exports = router;
