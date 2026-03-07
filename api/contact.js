import { Resend } from 'resend';

/* ── Rate limiter (in-memory, resets on cold start) ── */
const rateMap = new Map();
const RATE_LIMIT  = 3;
const RATE_WINDOW = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateMap.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

/* ── Validation + sanitization ── */
function validate(body) {
  const errors = [];
  const { name, email, description, budget, _hp } = body;

  // Honeypot — bots fill hidden fields
  if (_hp) return { valid: false, errors: ['spam'] };

  if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100)
    errors.push('Name is required (2-100 characters).');
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
    errors.push('A valid email is required.');
  if (!description || typeof description !== 'string' || description.trim().length < 10 || description.length > 2000)
    errors.push('Project description is required (10-2000 characters).');
  if (budget && typeof budget === 'string' && budget.length > 50)
    errors.push('Budget value too long.');

  const clean = (s) => typeof s === 'string' ? s.replace(/<[^>]*>/g, '').trim() : '';

  return {
    valid: errors.length === 0,
    errors,
    data: {
      name:        clean(name),
      email:       clean(email),
      description: clean(description),
      budget:      clean(budget || 'Not specified'),
    }
  };
}

/* ── Handler ── */
export default async function handler(req, res) {
  // CORS
  const origin = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Rate limit
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  }

  // Validate
  const { valid, errors, data } = validate(req.body || {});
  if (!valid) {
    if (errors[0] === 'spam') return res.status(200).json({ ok: true });
    return res.status(400).json({ error: errors.join(' ') });
  }

  // Send email
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from:    'Shelf Light <onboarding@resend.dev>',
      to:      process.env.CONTACT_TO_EMAIL || 'brianlapinskiart@gmail.com',
      replyTo: data.email,
      subject: `Commission inquiry from ${data.name}`,
      html: [
        '<h2>New Commission Inquiry</h2>',
        `<p><strong>Name:</strong> ${data.name}</p>`,
        `<p><strong>Email:</strong> ${data.email}</p>`,
        `<p><strong>Budget:</strong> ${data.budget}</p>`,
        '<h3>Project Description</h3>',
        `<p>${data.description.replace(/\n/g, '<br>')}</p>`,
        '<hr>',
        '<p style="color:#888;font-size:12px">Sent from Shelf Light contact form</p>',
      ].join('\n'),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send message. Please try again.' });
  }
}
