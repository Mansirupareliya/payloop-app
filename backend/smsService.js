const { FAST2SMS_API_KEY } = process.env;

/**
 * Send an SMS via Fast2SMS (India).
 * @param {string} to   - Phone number, e.g. "+919876543210" or "9876543210"
 * @param {string} body - Message text
 */
async function sendSMS(to, body) {
  if (!FAST2SMS_API_KEY) {
    throw new Error('FAST2SMS_API_KEY is not set in .env');
  }

  // Fast2SMS expects 10-digit number without country code
  const mobile = to.replace(/^\+91/, '').replace(/^\+/, '').replace(/\D/g, '');

  const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: {
      authorization: FAST2SMS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route: 'q',          // Quick transactional route
      message: body,
      language: 'english',
      flash: 0,
      numbers: mobile,
    }),
  });

  const data = await response.json();
  console.log('[Fast2SMS] Response:', JSON.stringify(data));

  if (!data.return) {
    throw new Error(data.message?.[0] ?? 'Fast2SMS send failed');
  }

  return data;
}

module.exports = { sendSMS };
