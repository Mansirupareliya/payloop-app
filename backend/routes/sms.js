const express = require('express');
const router = express.Router();
const { sendSMS } = require('../smsService');

// POST /api/sms/send
// Body: { to: "+91XXXXXXXXXX", message: "..." }
router.post('/send', async (req, res) => {
  const { to, message } = req.body;
  console.log('[SMS] /send called — to:', to, '| message length:', message?.length);
  if (!to || !message) {
    return res.status(400).json({ error: 'to and message are required' });
  }
  try {
    const result = await sendSMS(to, message);
    console.log('[SMS] Sent successfully, SID:', result.sid);
    res.json({ success: true });
  } catch (err) {
    console.error('[SMS] Send error:', err.message);
    res.status(500).json({ error: err.message ?? 'Failed to send SMS' });
  }
});

module.exports = router;
