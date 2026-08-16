const express = require('express');
const router = express.Router();
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

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

// ─── GET /api/bills ──────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM bills ORDER BY due_date ASC'
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
        (id, name, category_id, amount, due_date, frequency, auto_repeat, reminders, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        id,
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
        name            = COALESCE($2, name),
        category_id     = COALESCE($3, category_id),
        amount          = COALESCE($4, amount),
        due_date        = COALESCE($5, due_date),
        frequency       = COALESCE($6, frequency),
        auto_repeat     = COALESCE($7, auto_repeat),
        reminders       = COALESCE($8, reminders),
        payment_method  = COALESCE($9, payment_method),
        notes           = COALESCE($10, notes)
       WHERE id = $1
       RETURNING *`,
      [
        id,
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
    const result = await pool.query('DELETE FROM bills WHERE id = $1', [id]);
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
// Mark a bill as paid and create a payment record.
// If autoRepeat is true, also inserts the next recurring bill.
router.post('/:id/pay', async (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paidDate, transactionId, notes } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'paymentMethod is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Fetch the bill
    const billResult = await client.query('SELECT * FROM bills WHERE id = $1', [id]);
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

    // 3. Create a payment record
    const paymentId = uuidv4();
    const paymentResult = await client.query(
      `INSERT INTO payments (id, bill_id, bill_name, category_id, amount, paid_date, payment_method, transaction_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        paymentId,
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

    // 4. Auto-create next recurring bill
    let nextBill = null;
    const nonRecurring = ['One time', 'Custom'];
    if (bill.auto_repeat && !nonRecurring.includes(bill.frequency)) {
      const nextDue = getNextDueDate(bill.due_date, bill.frequency);
      const nextId = uuidv4();
      const nextResult = await client.query(
        `INSERT INTO bills
          (id, name, category_id, amount, due_date, frequency, auto_repeat, reminders, payment_method, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          nextId,
          bill.name,
          bill.category_id,
          bill.amount,
          nextDue,
          bill.frequency,
          bill.auto_repeat,
          bill.reminders,
          bill.payment_method,
          bill.notes,
        ]
      );
      nextBill = rowToBill(nextResult.rows[0]);
    }

    await client.query('COMMIT');

    res.json({
      bill: rowToBill({ ...bill, is_paid: true, paid_date: resolvedPaidDate }),
      payment: rowToPayment(paymentResult.rows[0]),
      nextBill,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('POST /bills/:id/pay error:', err);
    res.status(500).json({ error: 'Failed to mark bill as paid' });
  } finally {
    client.release();
  }
});

// ─── Helper: next due date ───────────────────────────────────────────────────
function getNextDueDate(dueDateStr, frequency) {
  const date = new Date(dueDateStr);
  switch (frequency) {
    case 'Daily': date.setDate(date.getDate() + 1); break;
    case 'Weekly': date.setDate(date.getDate() + 7); break;
    case 'Monthly': date.setMonth(date.getMonth() + 1); break;
    case 'Quarterly': date.setMonth(date.getMonth() + 3); break;
    case 'Half-yearly': date.setMonth(date.getMonth() + 6); break;
    case 'Yearly': date.setFullYear(date.getFullYear() + 1); break;
    default: date.setMonth(date.getMonth() + 1);
  }
  return date.toISOString();
}

// ─── Helper: convert payment row → app format ────────────────────────────────
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

module.exports = router;
