export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body || {};

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const BREVO_LIST_ID = process.env.BREVO_LIST_ID;

  if (!BREVO_API_KEY || !BREVO_LIST_ID) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email: email,
        listIds: [parseInt(BREVO_LIST_ID, 10)],
        updateEnabled: true
      })
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ ok: true });
    }

    const data = await response.json().catch(() => ({}));

    if (response.status === 400 && data.code === 'duplicate_parameter') {
      return res.status(200).json({ ok: true });
    }

    return res.status(502).json({ error: 'Could not complete' });
  } catch (err) {
    return res.status(500).json({ error: 'Could not complete' });
  }
}
