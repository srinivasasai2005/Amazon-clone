import { Router } from 'express';
import Stripe from 'stripe';
import { query } from '../db/database.js';

const router = Router();

const stripeSecret = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const isStripeConfigured = Boolean(
  stripeSecret &&
  /^sk_(test|live)_/.test(stripeSecret) &&
  !stripeSecret.includes('dummy')
);
const stripe = isStripeConfigured ? new Stripe(stripeSecret) : null;

const PRIME_PLAN_AMOUNTS = {
  monthly: 19900,
  yearly: 149900,
};

async function activatePrimeFromPaymentIntent(paymentIntent) {
  const metadata = paymentIntent?.metadata || {};
  if (metadata.type !== 'prime-membership') return;

  const userId = Number(metadata.user_id);
  const plan = metadata.plan === 'yearly' ? 'yearly' : 'monthly';
  const expectedAmount = PRIME_PLAN_AMOUNTS[plan];

  if (!Number.isInteger(userId) || userId <= 0) return;
  if (paymentIntent.amount !== expectedAmount) return;
  if (paymentIntent.status !== 'succeeded') return;

  await query(
    `UPDATE users
     SET is_prime_member = true,
         prime_plan = $1::varchar,
         prime_member_since = COALESCE(prime_member_since, CURRENT_TIMESTAMP),
         prime_expires_at = CASE
           WHEN $1::text = 'yearly' THEN CURRENT_TIMESTAMP + INTERVAL '1 year'
           ELSE CURRENT_TIMESTAMP + INTERVAL '1 month'
         END
     WHERE id = $2`,
    [plan, userId]
  );
}

router.post('/stripe', async (req, res) => {
  try {
    if (!stripe || !webhookSecret) {
      return res.status(503).json({
        error: 'Stripe webhook is not configured.',
        code: 'STRIPE_WEBHOOK_NOT_CONFIGURED',
      });
    }

    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing Stripe signature header' });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
    } catch (err) {
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    const alreadyProcessed = await query(
      `INSERT INTO stripe_webhook_events (event_id, event_type)
       VALUES ($1, $2)
       ON CONFLICT (event_id) DO NOTHING
       RETURNING event_id`,
      [event.id, event.type]
    );

    if (alreadyProcessed.rowCount === 0) {
      return res.json({ received: true, duplicate: true });
    }

    if (event.type === 'payment_intent.succeeded') {
      await activatePrimeFromPaymentIntent(event.data.object);
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Stripe webhook error:', err);
    return res.status(500).json({ error: 'Webhook handling failed' });
  }
});

export default router;
