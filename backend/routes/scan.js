const express = require('express');
const multer  = require('multer');
const { createWorker } = require('tesseract.js');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: '/tmp/payloop-scans/' });

if (!fs.existsSync('/tmp/payloop-scans/')) {
  fs.mkdirSync('/tmp/payloop-scans/', { recursive: true });
}

function extractAmount(text) {
  // Try many patterns from most specific to least
  const patterns = [
    /total\s*(?:amount|due|payable|bill)?[\s:₹rs.]*([\d,]+(?:\.\d{1,2})?)/i,
    /amount\s*(?:due|payable|billed|total)?[\s:₹rs.]*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:net\s*)?payable[\s:₹rs.]*([\d,]+(?:\.\d{1,2})?)/i,
    /bill\s*amount[\s:₹rs.]*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:₹|rs\.?|inr\.?)\s*([\d,]+(?:\.\d{1,2})?)/i,
    // any number with comma separator (like 1,200 or 12,500.00)
    /\b(\d{1,3}(?:,\d{3})+(?:\.\d{1,2})?)\b/,
    // plain decimal number >= 10
    /\b(\d{2,6}(?:\.\d{1,2})?)\b/,
  ];

  const candidates = [];
  for (const pattern of patterns) {
    const matches = text.matchAll(new RegExp(pattern.source, pattern.flags + 'g'));
    for (const match of matches) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(val) && val >= 1 && val <= 9999999) {
        candidates.push(val);
      }
    }
    if (candidates.length > 0) break;
  }

  // Return the largest candidate (usually the total)
  return candidates.length > 0 ? Math.max(...candidates) : null;
}

function extractBillName(text) {
  const lines = text.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 3 && /[a-zA-Z]/.test(l));

  const serviceKeywords = [
    'electricity', 'electric', 'power', 'energy', 'water', 'gas',
    'internet', 'broadband', 'wifi', 'wi-fi', 'fiber', 'fibre',
    'mobile', 'phone', 'telephone', 'prepaid', 'postpaid', 'recharge',
    'insurance', 'premium', 'policy', 'rent', 'maintenance', 'society',
    'emi', 'loan', 'credit', 'subscription', 'plan',
    'netflix', 'amazon', 'prime', 'spotify', 'hotstar', 'disney',
    'jio', 'airtel', 'bsnl', 'vodafone', 'vi', 'idea',
    'school', 'college', 'tuition', 'fee', 'tata', 'reliance',
    'bill', 'invoice', 'receipt',
  ];

  // Try to find a line with a service keyword
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (serviceKeywords.some(k => lower.includes(k))) {
      const cleaned = line.replace(/[^a-zA-Z0-9 &.,-]/g, '').trim();
      if (cleaned.length > 3) return cleaned.slice(0, 60);
    }
  }

  // Fall back: first line that looks like a name (has letters, not just numbers)
  for (const line of lines) {
    if (/[a-zA-Z]{3,}/.test(line) && !/^[\d\s.,:/-]+$/.test(line)) {
      const cleaned = line.replace(/[^a-zA-Z0-9 &.,-]/g, '').trim();
      if (cleaned.length > 3) return cleaned.slice(0, 60);
    }
  }

  return null;
}

router.post('/scan', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });

  const filePath = req.file.path;
  let worker;
  try {
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(filePath);

    console.log('[OCR] Extracted text:', text.slice(0, 300));

    const amount   = extractAmount(text);
    const billName = extractBillName(text);

    // Always return raw text so client can show it
    res.json({
      success: true,
      rawText: text.trim().slice(0, 800),
      amount:   amount   ?? null,
      billName: billName ?? null,
    });
  } catch (err) {
    console.error('[OCR] Error:', err.message);
    res.status(500).json({ error: 'OCR failed', detail: err.message });
  } finally {
    if (worker) await worker.terminate().catch(() => {});
    fs.unlink(filePath, () => {});
  }
});

module.exports = router;
